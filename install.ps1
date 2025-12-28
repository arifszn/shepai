# PowerShell installation script for shepai on Windows

param(
    [string]$InstallDir = "$env:LOCALAPPDATA\Programs\shepai"
)

$ErrorActionPreference = "Stop"

# Configuration
$REPO = "arifszn/shepai"
$BINARY_NAME = "shepai.exe"

# Color output functions
function Write-ColorOutput {
    param(
        [string]$ForegroundColor,
        [string]$Message
    )
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    Write-Host $Message
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success { 
    param([string]$Message)
    Write-ColorOutput -ForegroundColor "Green" -Message $Message 
}

function Write-Error-Message { 
    param([string]$Message)
    Write-ColorOutput -ForegroundColor "Red" -Message $Message 
}

function Write-Warning-Message { 
    param([string]$Message)
    Write-ColorOutput -ForegroundColor "Yellow" -Message $Message 
}

# Detect architecture
function Get-Platform {
    $arch = [System.Environment]::GetEnvironmentVariable("PROCESSOR_ARCHITECTURE")

    switch ($arch) {
        "AMD64" { return "windows-amd64" }
        "ARM64" { return "windows-arm64" }
        default {
            Write-Error-Message "Error: Unsupported architecture: $arch"
            exit 1
        }
    }
}

# Get latest version from GitHub
function Get-LatestVersion {
    Write-Warning-Message "Fetching latest version..."

    try {
        $response = Invoke-RestMethod -Uri "https://api.github.com/repos/$REPO/releases/latest"
        $version = $response.tag_name

        if ([string]::IsNullOrEmpty($version)) {
            Write-Error-Message "Error: Could not fetch latest version"
            exit 1
        }

        Write-Success "Latest version: $version"
        return $version
    }
    catch {
        Write-Error-Message "Error: Failed to fetch latest version from GitHub"
        Write-Error-Message $_.Exception.Message
        exit 1
    }
}

# Download and install
function Install-Shepai {
    $platform = Get-Platform
    $version = Get-LatestVersion

    # Try compressed formats first, then raw binary
    $downloadUrlZip = "https://github.com/$REPO/releases/download/$version/shepai-$platform.zip"
    $downloadUrlExe = "https://github.com/$REPO/releases/download/$version/shepai-$platform.exe"
    $downloadUrlRaw = "https://github.com/$REPO/releases/download/$version/shepai-$platform"

    Write-Warning-Message "Downloading shepai $version for $platform..."

    # Create temp directory
    $tempDir = Join-Path $env:TEMP "shepai-install-$(Get-Random)"
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

    try {
        $downloadedFile = $null
        $downloadedFormat = $null

        # Try zip first
        try {
            $zipFile = Join-Path $tempDir "shepai.zip"
            Invoke-WebRequest -Uri $downloadUrlZip -OutFile $zipFile -ErrorAction Stop
            $downloadedFile = $zipFile
            $downloadedFormat = "zip"
        }
        catch {
            # Try .exe
            try {
                $exeFile = Join-Path $tempDir "shepai.exe"
                Invoke-WebRequest -Uri $downloadUrlExe -OutFile $exeFile -ErrorAction Stop
                $downloadedFile = $exeFile
                $downloadedFormat = "exe"
            }
            catch {
                # Try raw binary
                try {
                    $rawFile = Join-Path $tempDir "shepai"
                    Invoke-WebRequest -Uri $downloadUrlRaw -OutFile $rawFile -ErrorAction Stop
                    $downloadedFile = $rawFile
                    $downloadedFormat = "raw"
                }
                catch {
                    Write-Error-Message "Error: Failed to download release asset"
                    Write-Warning-Message "Tried:"
                    Write-Warning-Message "  - $downloadUrlZip"
                    Write-Warning-Message "  - $downloadUrlExe"
                    Write-Warning-Message "  - $downloadUrlRaw"
                    exit 1
                }
            }
        }

        # Extract or prepare binary
        $binaryPath = $null
        if ($downloadedFormat -eq "zip") {
            $extractDir = Join-Path $tempDir "extract"
            Expand-Archive -Path $downloadedFile -DestinationPath $extractDir -Force

            # Look for the binary in extracted files
            $possibleBinary = Get-ChildItem -Path $extractDir -Recurse -Include "shepai-$platform", "shepai-$platform.exe", "shepai.exe", "shepai" | Select-Object -First 1
            if ($possibleBinary) {
                $binaryPath = $possibleBinary.FullName
            }
            else {
                Write-Error-Message "Error: Could not find binary in extracted archive"
                exit 1
            }
        }
        else {
            $binaryPath = $downloadedFile
        }

        # Create install directory
        if (-not (Test-Path $InstallDir)) {
            New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
        }

        # Copy binary to install directory
        $targetPath = Join-Path $InstallDir $BINARY_NAME
        Copy-Item -Path $binaryPath -Destination $targetPath -Force

        Write-Success "[OK] Successfully installed shepai to $targetPath"

        # Add to PATH if not already present
        $userPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
        if ($userPath -notlike "*$InstallDir*") {
            Write-Warning-Message "Adding $InstallDir to user PATH..."
            [System.Environment]::SetEnvironmentVariable(
                "Path",
                "$userPath;$InstallDir",
                "User"
            )
            Write-Success "[OK] Added to PATH. Please restart your terminal for changes to take effect."
        }

        # Verify installation
        Write-Success "[OK] Installation complete!"
        Write-Success "Run 'shepai --help' to get started (restart your terminal first)"
    }
    finally {
        # Cleanup
        if (Test-Path $tempDir) {
            Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}

# Main
Write-Success "Installing shepai..."
Install-Shepai
