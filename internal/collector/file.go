package collector

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"time"

	"github.com/monstarlab/shepai/internal/models"
)

const (
	// DefaultSnapshotLines is the fixed number of recent lines to show on startup
	DefaultSnapshotLines = 100
)

// FileCollector collects logs from a file
type FileCollector struct {
	filePath string
	stopChan chan struct{}
}

// NewFileCollector creates a new file collector
func NewFileCollector(filePath string) (*FileCollector, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to open file: %w", err)
	}
	file.Close()

	return &FileCollector{
		filePath: filePath,
		stopChan: make(chan struct{}),
	}, nil
}

// GetSnapshot reads the last N lines from the file
func (f *FileCollector) GetSnapshot() ([]models.LogEvent, error) {
	file, err := os.Open(f.filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to open file: %w", err)
	}
	defer file.Close()

	// Get file size
	stat, err := file.Stat()
	if err != nil {
		return nil, fmt.Errorf("failed to stat file: %w", err)
	}

	fileSize := stat.Size()
	if fileSize == 0 {
		return []models.LogEvent{}, nil
	}

	// Read in chunks from the end
	chunkSize := int64(8192)
	if fileSize < chunkSize {
		chunkSize = fileSize
	}

	var lines []string
	buf := make([]byte, chunkSize)
	remaining := DefaultSnapshotLines
	pos := fileSize
	hasLeadingPartial := false

	for remaining > 0 && pos > 0 {
		readSize := chunkSize
		if pos < chunkSize {
			readSize = pos
		}

		pos -= readSize

		// Detect whether this chunk starts in the middle of a line.
		// If the byte before `pos` is not '\n', then the first "line" parsed from this
		// chunk will be a partial tail that needs to be merged with the previous chunk.
		chunkStartsMidLine := false
		if pos > 0 {
			if _, err := file.Seek(pos-1, io.SeekStart); err == nil {
				one := make([]byte, 1)
				if _, err := file.Read(one); err == nil {
					if one[0] != '\n' {
						chunkStartsMidLine = true
					}
				}
			}
		}

		_, err := file.Seek(pos, io.SeekStart)
		if err != nil {
			break
		}

		n, err := file.Read(buf[:readSize])
		if err != nil && err != io.EOF {
			break
		}

		// Parse lines from this chunk
		chunkLines := parseLinesFromChunk(buf[:n])

		// If the previously accumulated slice starts with a partial tail (because the
		// later chunk began mid-line), merge it into the last line of the current chunk.
		if hasLeadingPartial && len(lines) > 0 && len(chunkLines) > 0 {
			chunkLines[len(chunkLines)-1] = chunkLines[len(chunkLines)-1] + lines[0]
			lines = lines[1:]
		}

		lines = append(chunkLines, lines...)
		remaining = DefaultSnapshotLines - len(lines)
		hasLeadingPartial = chunkStartsMidLine

		if pos == 0 {
			break
		}
	}

	// Trim to exact number of lines
	if len(lines) > DefaultSnapshotLines {
		lines = lines[len(lines)-DefaultSnapshotLines:]
	}

	// Convert to LogEvent
	events := make([]models.LogEvent, 0, len(lines))
	now := time.Now()

	for _, line := range lines {

		event := models.LogEvent{
			Timestamp: now, // Will be updated if we can parse from line
			Source:    "file",
			Stream:    "",
			Message:   line,
		}

		// Try to extract timestamp from log line
		if parsedTime := f.parseTimestampFromLine(line); !parsedTime.IsZero() {
			event.Timestamp = parsedTime
		}

		events = append(events, event)
	}

	return events, nil
}

// Start begins following the file and sending events to the channel
func (f *FileCollector) Start(ch chan<- models.LogEvent) error {
	go func() {
		lastPos := int64(0)
		reconnectDelay := 2 * time.Second
		maxReconnectDelay := 30 * time.Second
		fileWasDeleted := false

		for {
			select {
			case <-f.stopChan:
				return
			default:
				file, err := os.Open(f.filePath)
				if err != nil {
					// File not found - send status message
					if !fileWasDeleted {
						ch <- models.LogEvent{
							Timestamp: time.Now(),
							Source:    "file",
							Stream:    "stderr",
							Message:   fmt.Sprintf("[shepai] File '%s' not found. Waiting for file...", f.filePath),
						}
						fileWasDeleted = true
						lastPos = 0 // Reset position when file is deleted
					}
					time.Sleep(reconnectDelay)
					if reconnectDelay < maxReconnectDelay {
						reconnectDelay *= 2
					}
					continue
				}

				// File was found (or found again after deletion)
				if fileWasDeleted {
					ch <- models.LogEvent{
						Timestamp: time.Now(),
						Source:    "file",
						Stream:    "stdout",
						Message:   fmt.Sprintf("[shepai] File '%s' found. Resuming log streaming...", f.filePath),
					}
					fileWasDeleted = false
					reconnectDelay = 2 * time.Second // Reset delay
				}

				stat, err := file.Stat()
				if err != nil {
					file.Close()
					time.Sleep(reconnectDelay)
					if reconnectDelay < maxReconnectDelay {
						reconnectDelay *= 2
					}
					continue
				}

				// Check for file rotation (size decreased)
				if stat.Size() < lastPos {
					ch <- models.LogEvent{
						Timestamp: time.Now(),
						Source:    "file",
						Stream:    "stdout",
						Message:   "[shepai] File rotation detected. Restarting from beginning...",
					}
					lastPos = 0
				}

				if stat.Size() > lastPos {
					file.Seek(lastPos, io.SeekStart)
					scanner := bufio.NewScanner(file)

					for scanner.Scan() {
						line := scanner.Text()
						eventTime := time.Now()

						event := models.LogEvent{
							Timestamp: eventTime,
							Source:    "file",
							Stream:    "",
							Message:   line,
						}

						if parsedTime := f.parseTimestampFromLine(line); !parsedTime.IsZero() {
							event.Timestamp = parsedTime
						}

						select {
						case ch <- event:
						case <-f.stopChan:
							file.Close()
							return
						}
					}

					currentPos, _ := file.Seek(0, io.SeekCurrent)
					lastPos = currentPos
				}

				file.Close()
				time.Sleep(100 * time.Millisecond)
			}
		}
	}()

	return nil
}

// Stop stops the collector
func (f *FileCollector) Stop() error {
	close(f.stopChan)
	return nil
}

// GetSourceName returns the file path
func (f *FileCollector) GetSourceName() string {
	return f.filePath
}

// parseTimestampFromLine attempts to parse common timestamp formats from log lines
func (f *FileCollector) parseTimestampFromLine(line string) time.Time {
	formats := []string{
		time.RFC3339,
		time.RFC3339Nano,
		"2006-01-02 15:04:05",
		"2006-01-02T15:04:05",
		"2006-01-02 15:04:05.000000",
		"2006-01-02T15:04:05.000000",
		"2006-01-02 15:04:05.000",
		"2006-01-02T15:04:05.000",
	}

	// Try to find timestamp at the beginning of the line
	for _, format := range formats {
		if len(line) >= len(format) {
			if t, err := time.Parse(format, line[:len(format)]); err == nil {
				return t
			}
		}
	}

	// Try Laravel-style: [2025-01-01 12:00:00]
	if len(line) > 1 && line[0] == '[' {
		end := 0
		for i := 1; i < len(line); i++ {
			if line[i] == ']' {
				end = i
				break
			}
		}
		if end > 0 {
			timestampStr := line[1:end]
			for _, format := range []string{
				"2006-01-02 15:04:05",
				"2006-01-02T15:04:05",
			} {
				if t, err := time.Parse(format, timestampStr); err == nil {
					return t
				}
			}
		}
	}

	return time.Time{}
}

// parseLinesFromChunk extracts complete lines from a byte chunk
func parseLinesFromChunk(chunk []byte) []string {
	var lines []string
	var currentLine []byte

	for i := len(chunk) - 1; i >= 0; i-- {
		if chunk[i] == '\n' {
			if len(currentLine) > 0 {
				// Reverse the line
				reversed := make([]byte, len(currentLine))
				for j := 0; j < len(currentLine); j++ {
					reversed[j] = currentLine[len(currentLine)-1-j]
				}
				lines = append(lines, string(reversed))
				currentLine = currentLine[:0]
			}
		} else {
			currentLine = append(currentLine, chunk[i])
		}
	}

	// Add remaining line if exists
	if len(currentLine) > 0 {
		reversed := make([]byte, len(currentLine))
		for j := 0; j < len(currentLine); j++ {
			reversed[j] = currentLine[len(currentLine)-1-j]
		}
		lines = append(lines, string(reversed))
	}

	// Reverse lines to get correct order
	for i, j := 0, len(lines)-1; i < j; i, j = i+1, j-1 {
		lines[i], lines[j] = lines[j], lines[i]
	}

	return lines
}
