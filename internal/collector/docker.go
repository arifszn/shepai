package collector

import (
	"context"
	"fmt"
	"io"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
	"github.com/monstarlab/shepai/internal/models"
)

const (
	// DefaultDockerSnapshotLines is the fixed number of recent lines to show on startup
	DefaultDockerSnapshotLines = 100
)

// DockerCollector collects logs from a Docker container
type DockerCollector struct {
	containerName string
	client        *client.Client
	stopChan      chan struct{}
}

// NewDockerCollector creates a new Docker collector.
// containerIdentifier can be either a container name or container ID (full or short).
func NewDockerCollector(containerIdentifier string) (*DockerCollector, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, fmt.Errorf("failed to create Docker client: %w", err)
	}

	ctx := context.Background()
	containerInfo, err := cli.ContainerInspect(ctx, containerIdentifier)
	if err != nil {
		return nil, fmt.Errorf("container not found (tried: %s). Make sure the container name or ID is correct: %w", containerIdentifier, err)
	}

	// Use the actual container name (strip leading slash if present)
	containerName := containerInfo.Name
	if len(containerName) > 0 && containerName[0] == '/' {
		containerName = containerName[1:]
	}

	return &DockerCollector{
		containerName: containerName,
		client:        cli,
		stopChan:      make(chan struct{}),
	}, nil
}

// GetSnapshot fetches recent logs from the container
func (d *DockerCollector) GetSnapshot() ([]models.LogEvent, error) {
	ctx := context.Background()

	options := types.ContainerLogsOptions{
		ShowStdout: true,
		ShowStderr: true,
		Tail:       fmt.Sprintf("%d", DefaultDockerSnapshotLines),
		Timestamps: true,
		Follow:     false,
	}

	reader, err := d.client.ContainerLogs(ctx, d.containerName, options)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch container logs: %w", err)
	}
	defer reader.Close()

	return d.parseDockerLogs(reader)
}

// Start begins streaming logs from the container
// It will automatically reconnect if the container is restarted (with the same name)
func (d *DockerCollector) Start(ch chan<- models.LogEvent) error {
	go d.streamWithReconnect(ch)
	return nil
}

// streamWithReconnect handles streaming with automatic reconnection on container restart
func (d *DockerCollector) streamWithReconnect(ch chan<- models.LogEvent) {
	reconnectDelay := 2 * time.Second
	maxReconnectDelay := 30 * time.Second

	for {
		select {
		case <-d.stopChan:
			return
		default:
			// Check if container exists and is running before attempting to stream
			ctx := context.Background()
			containerInfo, err := d.client.ContainerInspect(ctx, d.containerName)
			if err != nil {
				// Container not found - send error message and wait
				ch <- models.LogEvent{
					Timestamp: time.Now(),
					Source:    "docker",
					Stream:    "stderr",
					Message:   fmt.Sprintf("[shepai] Container '%s' not found. Waiting for container to start...", d.containerName),
				}
				time.Sleep(reconnectDelay)
				if reconnectDelay < maxReconnectDelay {
					reconnectDelay *= 2
				}
				continue
			}

			// Check if container is actually running (not just exists)
			if !containerInfo.State.Running {
				// Container exists but is not running
				ch <- models.LogEvent{
					Timestamp: time.Now(),
					Source:    "docker",
					Stream:    "stderr",
					Message:   fmt.Sprintf("[shepai] Container '%s' is not running (status: %s). Waiting for container to start...", d.containerName, containerInfo.State.Status),
				}
				time.Sleep(reconnectDelay)
				if reconnectDelay < maxReconnectDelay {
					reconnectDelay *= 2
				}
				continue
			}

			// Reset reconnect delay on successful connection
			reconnectDelay = 2 * time.Second

			// Container exists, start streaming
			options := types.ContainerLogsOptions{
				ShowStdout: true,
				ShowStderr: true,
				Tail:       "0",
				Timestamps: true,
				Follow:     true,
			}

			reader, err := d.client.ContainerLogs(ctx, d.containerName, options)
			if err != nil {
				// Failed to get logs - container might be stopping/restarting
				ch <- models.LogEvent{
					Timestamp: time.Now(),
					Source:    "docker",
					Stream:    "stderr",
					Message:   fmt.Sprintf("[shepai] Failed to stream logs from container '%s': %v. Retrying...", d.containerName, err),
				}
				time.Sleep(reconnectDelay)
				continue
			}

			// Stream logs until connection is lost
			streamErr := d.streamLogs(reader, ch)
			reader.Close()

			if streamErr != nil && streamErr != io.EOF {
				// Connection lost - container might have stopped/restarted
				ch <- models.LogEvent{
					Timestamp: time.Now(),
					Source:    "docker",
					Stream:    "stderr",
					Message:   fmt.Sprintf("[shepai] Connection to container '%s' lost. Attempting to reconnect...", d.containerName),
				}
			}

			// Wait before reconnecting
			time.Sleep(reconnectDelay)
			if reconnectDelay < maxReconnectDelay {
				reconnectDelay *= 2
			}
		}
	}
}

// streamLogs reads and parses logs from the Docker log stream
func (d *DockerCollector) streamLogs(reader io.Reader, ch chan<- models.LogEvent) error {
	buf := make([]byte, 8192)

	for {
		select {
		case <-d.stopChan:
			return nil
		default:
			n, err := reader.Read(buf)
			if err != nil {
				return err
			}

			if n > 0 {
				events := d.parseDockerLogChunk(buf[:n])
				for _, event := range events {
					select {
					case ch <- event:
					case <-d.stopChan:
						return nil
					}
				}
			}
		}
	}
}

// Stop stops the collector
func (d *DockerCollector) Stop() error {
	close(d.stopChan)
	return nil
}

// GetSourceName returns the container name or ID
func (d *DockerCollector) GetSourceName() string {
	return d.containerName
}

// parseDockerLogs parses Docker log output.
// Docker logs are prefixed with 8 bytes: [1 byte stream][3 bytes padding][4 bytes size].
func (d *DockerCollector) parseDockerLogs(reader io.Reader) ([]models.LogEvent, error) {
	var events []models.LogEvent

	for {
		// Read header (8 bytes)
		header := make([]byte, 8)
		n, err := reader.Read(header)
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("failed to read log header: %w", err)
		}
		if n < 8 {
			break
		}

		// Determine stream type
		stream := "stdout"
		if header[0] == 2 {
			stream = "stderr"
		}

		// Read size (last 4 bytes, big-endian)
		size := int(header[4])<<24 | int(header[5])<<16 | int(header[6])<<8 | int(header[7])

		if size == 0 {
			continue
		}

		// Read the actual log line
		lineData := make([]byte, size)
		read := 0
		for read < size {
			n, err := reader.Read(lineData[read:])
			if err != nil && err != io.EOF {
				return nil, fmt.Errorf("failed to read log data: %w", err)
			}
			if n == 0 {
				break
			}
			read += n
		}

		line := string(lineData[:read])

		timestamp := time.Now()
		message := line
		if parsedTime, msg := d.parseTimestamp(line); !parsedTime.IsZero() {
			timestamp = parsedTime
			message = msg
		}

		events = append(events, models.LogEvent{
			Timestamp: timestamp,
			Source:    "docker",
			Stream:    stream,
			Message:   message,
		})
	}

	return events, nil
}

// parseDockerLogChunk parses a chunk of Docker log data
func (d *DockerCollector) parseDockerLogChunk(chunk []byte) []models.LogEvent {
	var events []models.LogEvent
	pos := 0

	for pos < len(chunk) {
		if pos+8 > len(chunk) {
			break
		}

		// Read header
		stream := "stdout"
		if chunk[pos] == 2 {
			stream = "stderr"
		}

		// Read size
		size := int(chunk[pos+4])<<24 | int(chunk[pos+5])<<16 | int(chunk[pos+6])<<8 | int(chunk[pos+7])
		pos += 8

		if size == 0 || pos+size > len(chunk) {
			break
		}

		line := string(chunk[pos : pos+size])
		pos += size

		timestamp := time.Now()
		message := line
		if parsedTime, msg := d.parseTimestamp(line); !parsedTime.IsZero() {
			timestamp = parsedTime
			message = msg
		}

		events = append(events, models.LogEvent{
			Timestamp: timestamp,
			Source:    "docker",
			Stream:    stream,
			Message:   message,
		})
	}

	return events
}

// parseTimestamp attempts to parse Docker timestamp format.
func (d *DockerCollector) parseTimestamp(line string) (time.Time, string) {
	formats := []string{
		time.RFC3339Nano,
		time.RFC3339,
		"2006-01-02T15:04:05.000000000Z",
		"2006-01-02T15:04:05.000000Z",
		"2006-01-02T15:04:05.000Z",
	}

	for _, format := range formats {
		if len(line) >= len(format) {
			if t, err := time.Parse(format, line[:len(format)]); err == nil {
				// Skip timestamp and space
				msgStart := len(format)
				if msgStart < len(line) && line[msgStart] == ' ' {
					msgStart++
				}
				return t, line[msgStart:]
			}
		}
	}

	return time.Time{}, line
}
