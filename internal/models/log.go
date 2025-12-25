package models

import "time"

// LogEvent represents a normalized log entry
type LogEvent struct {
	Timestamp time.Time `json:"timestamp"`
	Source    string    `json:"source"`    // "file" or "docker"
	Stream    string    `json:"stream"`    // "stdout" or "stderr" (for docker), empty for file
	Message   string    `json:"message"`
}

// LogCollector defines the interface for log collectors
type LogCollector interface {
	// Start begins collecting logs and sends them to the provided channel
	Start(ch chan<- LogEvent) error
	
	// Stop stops the collector
	Stop() error
	
	// GetSnapshot returns a fixed number of recent log lines
	GetSnapshot() ([]LogEvent, error)
	
	// GetSourceName returns the name of the source (file path or container name)
	GetSourceName() string
}

