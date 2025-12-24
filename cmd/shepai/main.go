package main

import (
	"fmt"
	"os"

	"github.com/monstarlab/shepai/internal/cli"
)

func main() {
	if len(os.Args) < 2 {
		printUsage()
		os.Exit(1)
	}

	command := os.Args[1]

	switch command {
	case "file":
		cli.HandleFileCommand(os.Args[2:])
	case "docker":
		cli.HandleDockerCommand(os.Args[2:])
	case "version", "-v", "--version":
		fmt.Println("shepai v1.0.0")
		os.Exit(0)
	case "help", "-h", "--help":
		printUsage()
		os.Exit(0)
	default:
		fmt.Fprintf(os.Stderr, "Unknown command: %s\n\n", command)
		printUsage()
		os.Exit(1)
	}
}

func printUsage() {
	fmt.Fprintf(os.Stderr, `shepai - Local log viewer for developers

Usage:
  shepai file <path>     Stream logs from a file
  shepai docker <container>  Stream logs from a Docker container

Flags:
  --port <number>        Port for web dashboard (default: 4040)

Examples:
  shepai file storage/logs/laravel.log
  shepai docker my_container --port 8080

`)
}
