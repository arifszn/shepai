package cli

import (
	"flag"
	"fmt"
	"os"

	"github.com/monstarlab/shepai/internal/collector"
	"github.com/monstarlab/shepai/internal/server"
)

func HandleDockerCommand(args []string) {
	fs := flag.NewFlagSet("docker", flag.ExitOnError)
	port := fs.Int("port", 4040, "Port for web dashboard")

	// Parse flags - this handles flags before positional args
	if err := fs.Parse(args); err != nil {
		fmt.Fprintf(os.Stderr, "Error parsing flags: %v\n", err)
		os.Exit(1)
	}

	// Check for --port flag after positional args (Go flag package stops at first non-flag)
	// This allows: shepai docker container --port 8080 or --port=8080
	for i, arg := range args {
		if arg == "--port" && i+1 < len(args) {
			// Parse the port value manually (--port 8080)
			var portVal int
			if _, err := fmt.Sscanf(args[i+1], "%d", &portVal); err == nil {
				*port = portVal
			}
		} else if len(arg) > 7 && arg[:7] == "--port=" {
			// Parse the port value manually (--port=8080)
			var portVal int
			if _, err := fmt.Sscanf(arg[7:], "%d", &portVal); err == nil {
				*port = portVal
			}
		}
	}

	if fs.NArg() < 1 {
		fmt.Fprintf(os.Stderr, "Error: container name or ID is required\n")
		fmt.Fprintf(os.Stderr, "Usage: shepai docker <container_name_or_id> [flags]\n")
		fmt.Fprintf(os.Stderr, "  Examples:\n")
		fmt.Fprintf(os.Stderr, "    shepai docker my-container\n")
		fmt.Fprintf(os.Stderr, "    shepai docker abc123def456\n")
		fmt.Fprintf(os.Stderr, "    shepai docker abc123  # short ID\n")
		os.Exit(1)
	}

	containerIdentifier := fs.Arg(0)

	dockerCollector, err := collector.NewDockerCollector(containerIdentifier)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error creating Docker collector: %v\n", err)
		fmt.Fprintf(os.Stderr, "Make sure Docker is running and the container exists\n")
		fmt.Fprintf(os.Stderr, "You can use either container name or ID (full or short)\n")
		os.Exit(1)
	}

	fmt.Printf("Streaming logs from container: %s\n", containerIdentifier)
	fmt.Printf("Press Ctrl+C to stop\n\n")
	
	if err := server.Start(*port, dockerCollector); err != nil {
		fmt.Fprintf(os.Stderr, "Error starting server: %v\n", err)
		os.Exit(1)
	}
}

