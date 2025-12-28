import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { HeroAnimation } from "@/components/HeroAnimation"
import {
  Play,
  FileText,
  Container,
  Search,
  Eye,
  Palette,
  Zap,
  Code2,
  Github,
  Twitter,
  Heart,
  Check,
  ChevronRight,
  Copy,
  Check as CheckCopy,
  Terminal
} from "lucide-react"
import logoSvg from "/logo.svg"

function App() {
  const [platform, setPlatform] = useState<"macos" | "linux" | "windows">("macos")
  const [uninstallPlatform, setUninstallPlatform] = useState<"macos" | "linux" | "windows">("macos")
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null)

  const copyToClipboard = (command: string) => {
    navigator.clipboard.writeText(command)
    setCopiedCommand(command)
    setTimeout(() => setCopiedCommand(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background antialiased">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logoSvg} alt="shepai logo" className="w-8 h-8" />
            <span className="font-bold text-xl">shepai</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#install" className="text-sm hover:text-primary transition-colors">
              Install
            </a>
            <a href="#usage" className="text-sm hover:text-primary transition-colors">
              Usage
            </a>
            <a href="#uninstall" className="text-sm hover:text-primary transition-colors">
              Uninstall
            </a>
            <a href="#features" className="text-sm hover:text-primary transition-colors">
              Features
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/arifszn/shepai"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm">
                <Github className="w-4 h-4" />
                <span className="hidden sm:inline">GitHub</span>
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-primary p-2"
          >
            shepai
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
            Stream logs directly to your browser with JSON support, syntax highlighting,
          and real-time updates. No config needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <a href="#install">
              <Button size="lg" className="text-base">
                <Play className="w-5 h-5 mr-2 fill-current" />
                Get Started
              </Button>
            </a>
            <a href="https://github.com/arifszn/shepai" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="text-base">
                <Github className="w-5 h-5 mr-2" />
                View Source
              </Button>
            </a>
          </div>

          {/* Animated Hero Section */}
          <div className="mt-2 w-full">
            <HeroAnimation screenshotUrl="/demo.png" />
          </div>
        </div>
      </section>

      {/* Installation Section */}
      <section id="install" className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Installation</h2>
            <p className="text-muted-foreground text-lg">
              Choose your platform and get started in seconds
            </p>
          </div>

          {/* Platform Selector */}
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            <Button
              variant={platform === "macos" ? "default" : "outline"}
              onClick={() => setPlatform("macos")}
            >
              macOS
            </Button>
            <Button
              variant={platform === "linux" ? "default" : "outline"}
              onClick={() => setPlatform("linux")}
            >
              Linux
            </Button>
            <Button
              variant={platform === "windows" ? "default" : "outline"}
              onClick={() => setPlatform("windows")}
            >
              Windows
            </Button>
          </div>

          <Card className="mb-8 overflow-hidden">
            <CardHeader className="bg-muted/30">
              <CardTitle>
                Quick Install
              </CardTitle>
              <CardDescription>
                {platform === "windows" 
                  ? "Choose the method that works best for you"
                  : "Run this command in your terminal"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {(platform === "macos" || platform === "linux") ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-3 text-muted-foreground flex items-center gap-2">
                      <Terminal className="w-4 h-4" />
                      Install Command
                    </h3>
                    <div className="relative group">
                      <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto pr-12">
                        <code className="text-green-600">curl -fsSL</code>{" "}
                        <code className="text-blue-600">
                          https://raw.githubusercontent.com/arifszn/shepai/main/install.sh
                        </code>{" "}
                        <code className="text-green-600">| bash</code>
                      </div>
                      <button
                        onClick={() => copyToClipboard("curl -fsSL https://raw.githubusercontent.com/arifszn/shepai/main/install.sh | bash")}
                        className="absolute right-2 top-2 p-2 rounded-md hover:bg-background/80 transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedCommand === "curl -fsSL https://raw.githubusercontent.com/arifszn/shepai/main/install.sh | bash" ? (
                          <CheckCopy className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-10">
                  {/* Windows Option 1 */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary">
                        <span className="text-xs font-bold">1</span>
                      </div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Terminal className="w-5 h-5" />
                        PowerShell Script (Recommended)
                      </h3>
                    </div>
                    
                    <div className="relative group mb-4">
                      <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto pr-12">
                        <span className="text-blue-600">irm</span>{" "}
                        <span className="text-foreground">https://raw.githubusercontent.com/arifszn/shepai/main/install.ps1</span>{" "}
                        <span className="text-blue-600">| iex</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard("irm https://raw.githubusercontent.com/arifszn/shepai/main/install.ps1 | iex")}
                        className="absolute right-2 top-2 p-2 rounded-md hover:bg-background/80 transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedCommand === "irm https://raw.githubusercontent.com/arifszn/shepai/main/install.ps1 | iex" ? (
                          <CheckCopy className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4 border text-sm">
                      <p className="font-medium mb-2">Verify the installation (restart your terminal first):</p>
                      <div className="relative group">
                        <code className="font-mono block bg-background px-3 py-2 rounded border">shepai --version</code>
                        <button
                          onClick={() => copyToClipboard("shepai --version")}
                          className="absolute right-2 top-2 p-1.5 rounded-md hover:bg-muted transition-colors"
                        >
                          {copiedCommand === "shepai --version" ? (
                            <CheckCopy className="w-3 h-3 text-green-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  {/* Windows Option 2 */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary">
                        <span className="text-xs font-bold">2</span>
                      </div>
                      <h3 className="font-semibold text-lg">Manual Installation</h3>
                    </div>

                    <div className="space-y-4 mb-6">
                      <ol className="list-decimal list-inside space-y-3 text-sm ml-1">
                        <li>
                          Download the{" "}
                          <a
                            href="https://github.com/arifszn/shepai/releases/latest"
                            className="text-primary hover:underline font-medium"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            shepai-windows-amd64.zip
                          </a>{" "}
                          asset from the latest release
                        </li>
                        <li>Extract the archive to your preferred location</li>
                        <li>Open a terminal in the extracted directory</li>
                      </ol>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4 border text-sm mb-4">
                      <p className="font-medium mb-2">Verify the installation:</p>
                      <div className="relative group">
                        <code className="font-mono block bg-background px-3 py-2 rounded border">.\shepai.exe --version</code>
                        <button
                          onClick={() => copyToClipboard(".\\shepai.exe --version")}
                          className="absolute right-2 top-2 p-1.5 rounded-md hover:bg-muted transition-colors"
                        >
                          {copiedCommand === ".\\shepai.exe --version" ? (
                            <CheckCopy className="w-3 h-3 text-green-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-3 rounded-lg text-sm border border-yellow-200 dark:border-yellow-900/50">
                      <strong className="font-semibold">Note:</strong> For system-wide access, add the extracted directory to your PATH environment variable.
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verify Installation */}
          
          {/* Verify Installation - Only for macOS/Linux here since Windows has it embedded */}
          {(platform === "macos" || platform === "linux") && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Verify Installation</CardTitle>
                <CardDescription>Make sure shepai is installed correctly</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative group">
                  <div className="bg-muted p-4 rounded-lg font-mono text-sm pr-12">
                    <code>shepai --version</code>
                  </div>
                  <button
                    onClick={() => copyToClipboard("shepai --version")}
                    className="absolute right-2 top-2 p-2 rounded-md hover:bg-background/80 transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedCommand === "shepai --version" ? (
                      <CheckCopy className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Usage Section */}
      <section id="usage" className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Usage</h2>
            <p className="text-muted-foreground text-lg">
              View logs from files or Docker containers with a single command
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* File Logs */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>File Logs</CardTitle>
                <CardDescription>
                  Stream any log file directly to your browser
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative group mb-4">
                  <div className="bg-muted p-4 rounded-lg font-mono text-sm pr-12">
                    <code className="text-green-600">shepai file</code>{" "}
                    <code className="text-blue-600">storage/logs/app.log</code>
                  </div>
                  <button
                    onClick={() => copyToClipboard("shepai file storage/logs/app.log")}
                    className="absolute right-2 top-2 p-2 rounded-md hover:bg-background/80 transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedCommand === "shepai file storage/logs/app.log" ? (
                      <CheckCopy className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <div className="bg-primary/5 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-primary">Dashboard:</span>{" "}
                    http://localhost:4040
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Docker Logs */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Container className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Docker Logs</CardTitle>
                <CardDescription>
                  Monitor Docker container logs in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative group mb-4">
                  <div className="bg-muted p-4 rounded-lg font-mono text-sm pr-12">
                    <code className="text-green-600">shepai docker</code>{" "}
                    <code className="text-blue-600">my_container</code>
                  </div>
                  <button
                    onClick={() => copyToClipboard("shepai docker my_container")}
                    className="absolute right-2 top-2 p-2 rounded-md hover:bg-background/80 transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedCommand === "shepai docker my_container" ? (
                      <CheckCopy className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <div className="bg-primary/5 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-primary">Dashboard:</span>{" "}
                    http://localhost:4040
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Port Option */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Custom Port</CardTitle>
              <CardDescription>
                Use the --port flag to specify a different port for the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative group">
                <div className="bg-muted p-4 rounded-lg font-mono text-sm pr-12">
                  <code className="text-green-600">shepai docker</code>{" "}
                  <code className="text-blue-600">app</code>{" "}
                  <code className="text-orange-600">--port 8080</code>
                </div>
                <button
                  onClick={() => copyToClipboard("shepai docker app --port 8080")}
                  className="absolute right-2 top-2 p-2 rounded-md hover:bg-background/80 transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedCommand === "shepai docker app --port 8080" ? (
                    <CheckCopy className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Uninstall Section */}
      <section id="uninstall" className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Uninstallation</h2>
            <p className="text-muted-foreground text-lg">
              Choose your platform to remove shepai
            </p>
          </div>

          {/* Platform Selector */}
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            <Button
              variant={uninstallPlatform === "macos" ? "default" : "outline"}
              onClick={() => setUninstallPlatform("macos")}
            >
              macOS
            </Button>
            <Button
              variant={uninstallPlatform === "linux" ? "default" : "outline"}
              onClick={() => setUninstallPlatform("linux")}
            >
              Linux
            </Button>
            <Button
              variant={uninstallPlatform === "windows" ? "default" : "outline"}
              onClick={() => setUninstallPlatform("windows")}
            >
              Windows
            </Button>
          </div>

          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30">
              <CardTitle>Uninstall Command</CardTitle>
              <CardDescription>
                {uninstallPlatform === "windows"
                  ? "Run this command in PowerShell to remove shepai"
                  : "Run this command in your terminal to remove shepai"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative group">
                <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto pr-12">
                  {uninstallPlatform === "windows" ? (
                    <>
                      <span className="text-blue-600">irm</span>{" "}
                      <span className="text-foreground">https://raw.githubusercontent.com/arifszn/shepai/main/uninstall.ps1</span>{" "}
                      <span className="text-blue-600">| iex</span>
                    </>
                  ) : (
                    <>
                      <code className="text-green-600">curl -fsSL</code>{" "}
                      <code className="text-blue-600">
                        https://raw.githubusercontent.com/arifszn/shepai/main/uninstall.sh
                      </code>{" "}
                      <code className="text-green-600">| bash</code>
                    </>
                  )}
                </div>
                <button
                  onClick={() => copyToClipboard(
                    uninstallPlatform === "windows"
                      ? "irm https://raw.githubusercontent.com/arifszn/shepai/main/uninstall.ps1 | iex"
                      : "curl -fsSL https://raw.githubusercontent.com/arifszn/shepai/main/uninstall.sh | bash"
                  )}
                  className="absolute right-2 top-2 p-2 rounded-md hover:bg-background/80 transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedCommand === (uninstallPlatform === "windows"
                    ? "irm https://raw.githubusercontent.com/arifszn/shepai/main/uninstall.ps1 | iex"
                    : "curl -fsSL https://raw.githubusercontent.com/arifszn/shepai/main/uninstall.sh | bash") ? (
                    <CheckCopy className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Features</h2>
            <p className="text-muted-foreground text-lg">
              Everything you need for effective log monitoring
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Zero Configuration",
                description: "No setup required for common workflows. Just run and view."
              },
              {
                icon: Eye,
                title: "Real-time Streaming",
                description: "Logs appear instantly as they're generated, with auto-reconnect."
              },
              {
                icon: Code2,
                title: "JSON Viewer",
                description: "Syntax highlighting with collapsible structure for nested JSON."
              },
              {
                icon: Search,
                title: "Powerful Search",
                description: "Real-time text filtering and highlighting across all logs."
              },
              {
                icon: Palette,
                title: "Dark/Light Mode",
                description: "Toggle between themes for comfortable viewing in any environment."
              },
              {
                icon: Container,
                title: "Docker Support",
                description: "Monitor container logs without shelling out to docker commands."
              }
            ].map((feature, index) => (
              <Card key={index} className="border-none shadow-sm bg-muted/30">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center mb-4 shadow-sm">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Additional Features List */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>More Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  "Expandable stack traces viewer",
                  "Severity highlighting with color-coded levels",
                  "Log severity filtering (Error, Warning, Info, Debug)",
                  "Focus mode for individual log entries",
                  "Zoom controls for text size adjustment",
                  "ANSI color support from logs",
                  "Automatic reconnection on restart",
                  "No application code changes needed",
                  "Cross-platform support (macOS, Linux, Windows)"
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-4">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Ready to streamline your log viewing?
              </h2>
              <p className="text-muted-foreground">
                Install shepai and start viewing logs in your browser today.
              </p>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#install">
                  <Button size="lg" className="text-base">
                    <Play className="w-5 h-5 mr-2" />
                    Get Started Now
                  </Button>
                </a>
                <a href="https://github.com/arifszn/shepai" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="text-base">
                    <Github className="w-5 h-5 mr-2" />
                    Star on GitHub
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <img src={logoSvg} alt="shepai logo" className="w-6 h-6" />
              <span className="font-semibold">shepai</span>
            </div>

            <div className="flex items-center gap-6">
              <a
                href="https://github.com/arifszn/shepai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com/intent/tweet?url=https://github.com/arifszn/shepai&hashtags=opensource,devtools,logs,docker,webdev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span>by</span>
              <a
                href="https://github.com/arifszn"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                arifszn
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>
              MIT License — Open source, freely usable for any purpose
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
