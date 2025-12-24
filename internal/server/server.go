package server

import (
	"context"
	"embed"
	"encoding/json"
	"fmt"
	"io/fs"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/gorilla/websocket"
	"github.com/monstarlab/shepai/internal/models"
)

//go:embed static/*
var staticFiles embed.FS

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// Only allow localhost connections for security
		origin := r.Header.Get("Origin")
		host := r.Host

		// Extract hostname from origin if present
		if origin != "" {
			// Parse origin URL
			if len(origin) >= 7 && (origin[:7] == "http://" || origin[:8] == "https://") {
				var originHost string
				if origin[:7] == "http://" {
					originHost = origin[7:]
				} else {
					originHost = origin[8:]
				}
				// Remove port if present
				if idx := len(originHost); idx > 0 {
					for i, c := range originHost {
						if c == ':' || c == '/' {
							originHost = originHost[:i]
							break
						}
					}
				}
				// Check if origin host is localhost
				if originHost == "127.0.0.1" || originHost == "localhost" || originHost == "" {
					return true
				}
			}
		}

		// Fallback: check Host header
		hostname := host
		if idx := len(host); idx > 0 {
			for i, c := range host {
				if c == ':' {
					hostname = host[:i]
					break
				}
			}
		}
		return hostname == "127.0.0.1" || hostname == "localhost"
	},
}

// Server manages the HTTP and WebSocket server
type Server struct {
	port       int
	collector  models.LogCollector
	clients    map[*websocket.Conn]bool
	mu         sync.RWMutex
	eventChan  chan models.LogEvent
	snapshot   []models.LogEvent
	snapshotMu sync.RWMutex
}

// isPortAvailable checks if a port is available for binding
// It tries to connect to the port first to see if something is already listening,
// then tries to bind to ensure we can use it
func isPortAvailable(port int) bool {
	addr := fmt.Sprintf("127.0.0.1:%d", port)

	// First, try to connect to see if something is already listening
	// This catches cases where a process is listening on *:port (all interfaces)
	// which might allow binding to 127.0.0.1:port on some systems
	conn, err := net.DialTimeout("tcp", addr, 200*time.Millisecond)
	if err == nil {
		// Something is already listening on this port
		conn.Close()
		return false
	}

	// If connection failed (nothing listening), try to bind to the port
	// This is the definitive test - if we can bind, the port is available
	ln, err := net.Listen("tcp", addr)
	if err != nil {
		// Port is not available (likely already in use)
		return false
	}
	ln.Close()
	return true
}

// findAvailablePort finds the next available port starting from the preferred port
// Returns the first available port, or the preferred port if it's available
func findAvailablePort(preferredPort int) int {
	port := preferredPort
	maxPort := preferredPort + 100 // Limit search to 100 ports ahead

	for port <= maxPort {
		if isPortAvailable(port) {
			return port
		}
		port++
	}

	return preferredPort
}

// NewServer creates a new server instance
func NewServer(port int, collector models.LogCollector) *Server {
	return &Server{
		port:      port,
		collector: collector,
		clients:   make(map[*websocket.Conn]bool),
		eventChan: make(chan models.LogEvent, 100),
	}
}

// Start starts the server on the preferred port, or finds the next available port if occupied
func Start(preferredPort int, collector models.LogCollector) error {
	actualPort := findAvailablePort(preferredPort)

	if actualPort != preferredPort {
		fmt.Printf("Port %d is in use, using port %d instead\n", preferredPort, actualPort)
	}

	fmt.Printf("Starting shepai on http://127.0.0.1:%d\n", actualPort)

	s := NewServer(actualPort, collector)

	// Get initial snapshot
	snapshot, err := collector.GetSnapshot()
	if err != nil {
		return fmt.Errorf("failed to get snapshot: %w", err)
	}

	// Start collector
	if err := collector.Start(s.eventChan); err != nil {
		return fmt.Errorf("failed to start collector: %w", err)
	}

	// Start broadcaster
	go s.broadcast()

	// Store snapshot for new connections
	s.snapshotMu.Lock()
	s.snapshot = snapshot
	s.snapshotMu.Unlock()

	// Setup routes
	mux := http.NewServeMux()
	mux.HandleFunc("/ws", s.handleWebSocket)
	mux.HandleFunc("/api/snapshot", s.handleSnapshot)

	// Serve static files
	staticFS, err := fs.Sub(staticFiles, "static")
	if err != nil {
		// If static files don't exist, serve a simple message
		log.Printf("Warning: static files not found, serving fallback")
		mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/" {
				w.Header().Set("Content-Type", "text/html")
				w.Write([]byte(`<!DOCTYPE html>
<html>
<head>
	<title>shepai - Log Viewer</title>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
	<h1>shepai</h1>
	<p>Frontend not built. Please run 'make frontend' or 'npm run build' in the frontend directory.</p>
</body>
</html>`))
			} else {
				http.NotFound(w, r)
			}
		})
	} else {
		mux.Handle("/", http.FileServer(http.FS(staticFS)))
	}

	// Create HTTP server
	addr := fmt.Sprintf("127.0.0.1:%d", actualPort)
	srv := &http.Server{
		Addr:         addr,
		Handler:      mux,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Setup graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	serverErr := make(chan error, 1)
	go func() {
		log.Printf("Server starting on http://%s", addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			serverErr <- err
		}
	}()

	// Wait for interrupt signal or server error
	select {
	case <-sigChan:
		log.Println("Shutting down server...")

		// Stop collector
		if err := collector.Stop(); err != nil {
			log.Printf("Error stopping collector: %v", err)
		}

		// Close all WebSocket connections
		s.mu.Lock()
		for conn := range s.clients {
			conn.Close()
		}
		s.mu.Unlock()

		// Shutdown HTTP server
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		if err := srv.Shutdown(ctx); err != nil {
			return fmt.Errorf("server shutdown error: %w", err)
		}

		log.Println("Server stopped")
		return nil
	case err := <-serverErr:
		return fmt.Errorf("server error: %w", err)
	}
}

// handleWebSocket handles WebSocket connections
func (s *Server) handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}
	defer conn.Close()

	// Configure connection
	conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	conn.SetPongHandler(func(string) error {
		conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	// Add client
	s.mu.Lock()
	s.clients[conn] = true
	s.mu.Unlock()

	// Send snapshot immediately
	s.snapshotMu.RLock()
	snapshotCopy := make([]models.LogEvent, len(s.snapshot))
	copy(snapshotCopy, s.snapshot)
	s.snapshotMu.RUnlock()

	conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
	if err := conn.WriteJSON(map[string]interface{}{
		"type":   "snapshot",
		"events": snapshotCopy,
	}); err != nil {
		log.Printf("Error sending snapshot: %v", err)
		s.removeClient(conn)
		return
	}

	// Keep connection alive and handle pings
	ticker := time.NewTicker(54 * time.Second)
	defer ticker.Stop()

	go func() {
		for range ticker.C {
			conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}()

	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}
		conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	}

	s.removeClient(conn)
}

// handleSnapshot returns the current snapshot
func (s *Server) handleSnapshot(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	s.snapshotMu.RLock()
	defer s.snapshotMu.RUnlock()

	json.NewEncoder(w).Encode(map[string]interface{}{
		"events": s.snapshot,
	})
}

// broadcast sends events to all connected clients
func (s *Server) broadcast() {
	for event := range s.eventChan {
		message := map[string]interface{}{
			"type":  "event",
			"event": event,
		}

		s.mu.RLock()
		clients := make([]*websocket.Conn, 0, len(s.clients))
		for conn := range s.clients {
			clients = append(clients, conn)
		}
		s.mu.RUnlock()

		// Send to all clients
		for _, conn := range clients {
			conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := conn.WriteJSON(message); err != nil {
				log.Printf("Error sending to client: %v", err)
				s.removeClient(conn)
			}
		}
	}
}

// removeClient removes a client from the broadcast list
func (s *Server) removeClient(conn *websocket.Conn) {
	s.mu.Lock()
	delete(s.clients, conn)
	s.mu.Unlock()
	conn.Close()
}
