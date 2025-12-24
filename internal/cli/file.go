package cli

import (
	"flag"
	"fmt"
	"os"

	"github.com/monstarlab/shepai/internal/collector"
	"github.com/monstarlab/shepai/internal/server"
)

func HandleFileCommand(args []string) {
	fs := flag.NewFlagSet("file", flag.ExitOnError)
	port := fs.Int("port", 4040, "Port for web dashboard")

	if err := fs.Parse(args); err != nil {
		fmt.Fprintf(os.Stderr, "Error parsing flags: %v\n", err)
		os.Exit(1)
	}

	if fs.NArg() < 1 {
		fmt.Fprintf(os.Stderr, "Error: file path is required\n")
		fmt.Fprintf(os.Stderr, "Usage: shepai file <path> [flags]\n")
		os.Exit(1)
	}

	filePath := fs.Arg(0)

	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		fmt.Fprintf(os.Stderr, "Error: file does not exist: %s\n", filePath)
		os.Exit(1)
	}

	fileCollector, err := collector.NewFileCollector(filePath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error creating file collector: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("Streaming logs from: %s\n", filePath)
	fmt.Printf("Press Ctrl+C to stop\n\n")
	
	if err := server.Start(*port, fileCollector); err != nil {
		fmt.Fprintf(os.Stderr, "Error starting server: %v\n", err)
		os.Exit(1)
	}
}

