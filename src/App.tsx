import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { HeroAnimation } from "@/components/HeroAnimation"
import { LazyVideo } from "@/components/LazyVideo"
import {
  Play,
  FileText,
  Container,
  Github,
  Heart,
  Copy,
  Check as CheckCopy,
  Terminal,
  Settings,
  Zap,
  Activity,
  Braces,
  ListTree,
  Search,
  Maximize2,
  Palette,
  Monitor,
  RefreshCw,
  Moon,
  ZoomIn,
  Bug,
  Tags,
  Eye,
  Code2,
  Check,
  Filter
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Install</h2>
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
                        <div className="font-mono block bg-background px-3 py-2 rounded border">
                          <span className="text-green-600">shepai</span>{" "}
                          <span className="text-purple-600">--version</span>
                        </div>
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
                        <div className="font-mono block bg-background px-3 py-2 rounded border">
                          <span className="text-green-600">.\shepai.exe</span>{" "}
                          <span className="text-purple-600">--version</span>
                        </div>
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
                    <span className="text-green-600">shepai</span>{" "}
                    <span className="text-purple-600">--version</span>
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
      <section id="usage" className="container mx-auto px-4 py-24 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Usage</h2>
            <p className="text-muted-foreground text-lg">
              Start viewing logs in your browser instantly. No configuration files, no complicated setup.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Watch File Logs */}
            <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">Watch File Logs</CardTitle>
                <CardDescription className="text-base">
                  Stream any log file directly to your browser with real-time updates.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl overflow-hidden bg-[#1e1e1e] border border-white/10 shadow-2xl">
                  <div className="flex items-center gap-1.5 px-4 py-3 bg-white/5 border-b border-white/5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                  </div>
                  <div className="p-4 relative group">
                    <div className="font-mono text-sm text-gray-300 overflow-x-auto pr-8">
                      <span className="text-green-400">shepai</span>{" "}
                      <span className="text-blue-400">file</span>{" "}
                      <span className="text-gray-400">/path/to/app.log</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard("shepai file /path/to/app.log")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                      title="Copy to clipboard"
                    >
                      {copiedCommand === "shepai file /path/to/app.log" ? (
                        <CheckCopy className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Watch Docker Logs */}
            <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
                  <Container className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-2xl">Watch Docker Logs</CardTitle>
                <CardDescription className="text-base">
                  Monitor any running Docker container without leaving your browser.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl overflow-hidden bg-[#1e1e1e] border border-white/10 shadow-2xl">
                  <div className="flex items-center gap-1.5 px-4 py-3 bg-white/5 border-b border-white/5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                  </div>
                  <div className="p-4 relative group">
                    <div className="font-mono text-sm text-gray-300 overflow-x-auto pr-8">
                      <span className="text-green-400">shepai</span>{" "}
                      <span className="text-blue-400">docker</span>{" "}
                      <span className="text-orange-400">container-name</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard("shepai docker container-name")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                      title="Copy to clipboard"
                    >
                      {copiedCommand === "shepai docker container-name" ? (
                        <CheckCopy className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Options */}
          <div className="mt-8">
            <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
              <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-gray-500" />
                    Options
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Need to run on a specific port? Use the <code className="text-xs bg-muted px-1 py-0.5 rounded">--port</code> flag to customize where the dashboard is served.
                  </p>
                </div>
                <div className="w-full md:w-auto md:min-w-[300px]">
                  <div className="rounded-xl overflow-hidden bg-[#1e1e1e] border border-white/10 shadow-2xl">
                    <div className="flex items-center gap-1.5 px-4 py-3 bg-white/5 border-b border-white/5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                    </div>
                    <div className="p-4 relative group">
                      <div className="font-mono text-sm text-gray-300 overflow-x-auto pr-8">
                        <span className="text-green-400">shepai</span>{" "}
                        <span className="text-blue-400">docker</span>{" "}
                        <span className="text-orange-400">container-name</span>{" "}
                        <span className="text-yellow-400">--port 8080</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard("shepai docker container-name --port 8080")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                        title="Copy to clipboard"
                      >
                        {copiedCommand === "shepai docker container-name --port 8080" ? (
                          <CheckCopy className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Uninstall Section */}
      <section id="uninstall" className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Uninstall</h2>
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
                icon: ListTree,
                title: "Stack Traces",
                description: "Expandable stack traces that make debugging complex errors a breeze."
              },
              {
                icon: Filter,
                title: "Log Severity Filtering",
                description: "Filter logs by severity levels (Error, Warning, Info, Debug) to focus on what matters."
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
                  "Dark/Light Mode support",
                  "Severity highlighting with color-coded levels",
                  "Focus mode for individual log entries",
                  "Zoom controls for text size adjustment",
                  "ANSI color support from logs",
                  "Automatic reconnection on restart",
                  "Cross-platform support (macOS, Linux, Windows)",
                  "No shelling out to system commands for log streaming"
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

      {/* Preview Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              See it in action
            </h2>
            <p className="text-muted-foreground text-lg">
              Transform your logs into a powerful web interface instantly.
            </p>
          </div>
          <LazyVideo src="/preview.mp4" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/20">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <img src={logoSvg} alt="shepai logo" className="w-8 h-8" />
                <span className="font-bold text-xl">shepai</span>
              </div>
              <p className="text-muted-foreground max-w-sm">
                Stream logs directly to your browser with JSON support, syntax highlighting, and real-time updates.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Explore</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#install" className="hover:text-primary transition-colors">Install</a></li>
                <li><a href="#usage" className="hover:text-primary transition-colors">Usage</a></li>
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <a href="https://github.com/arifszn/shepai" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors inline-flex items-center gap-2">
                    <Github className="w-4 h-4" /> GitHub
                  </a>
                </li>
                <li>
                  <a href="https://github.com/arifszn/shepai/issues" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors inline-flex items-center gap-2">
                    <Bug className="w-4 h-4" /> Issues
                  </a>
                </li>
                <li>
                  <a href="https://github.com/arifszn/shepai/releases" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors inline-flex items-center gap-2">
                    <Tags className="w-4 h-4" /> Releases
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()}. MIT License.</p>
            <div className="flex items-center gap-2">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span>by</span>
              <a
                href="https://github.com/arifszn"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-primary transition-colors"
              >
                arifszn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
