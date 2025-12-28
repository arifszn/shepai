# PowerShell uninstallation script for shepai on Windows

param(
    [string]$InstallDir = "$env:LOCALAPPDATA\Programs\shepai"
)

$ErrorActionPreference = "Stop"

# Configuration
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

# Uninstall shepai
function Uninstall-Shepai {
    $targetPath = Join-Path $InstallDir $BINARY_NAME

    # Check if shepai is installed
    if (-not (Test-Path $InstallDir)) {
        Write-Warning-Message "shepai installation directory not found: $InstallDir"
        Write-Warning-Message "shepai may not be installed or was installed to a different location"
        return
    }

    if (-not (Test-Path $targetPath)) {
        Write-Warning-Message "shepai binary not found: $targetPath"
        Write-Warning-Message "shepai may not be installed or was installed to a different location"
    }

    # Remove installation directory
    try {
        Write-Warning-Message "Removing shepai from $InstallDir..."
        Remove-Item -Path $InstallDir -Recurse -Force -ErrorAction Stop
        Write-Success "[OK] Removed shepai installation directory"
    }
    catch {
        Write-Error-Message "Error: Failed to remove installation directory"
        Write-Error-Message $_.Exception.Message
        exit 1
    }

    # Remove from PATH
    try {
        $userPath = [System.Environment]::GetEnvironmentVariable("Path", "User")

        if ($userPath -like "*$InstallDir*") {
            Write-Warning-Message "Removing $InstallDir from user PATH..."

            # Split path entries, filter out shepai directory, and rejoin
            $pathEntries = $userPath -split ';'
            $newPathEntries = $pathEntries | Where-Object { $_ -ne $InstallDir -and $_ -notlike '*shepai*' }
            $newPath = $newPathEntries -join ';'

            [System.Environment]::SetEnvironmentVariable("Path", $newPath, "User")
            Write-Success "[OK] Removed from PATH. Please restart your terminal for changes to take effect."
        }
        else {
            Write-Warning-Message "shepai directory not found in PATH"
        }
    }
    catch {
        Write-Error-Message "Warning: Failed to update PATH"
        Write-Error-Message $_.Exception.Message
    }

    Write-Success "[OK] Uninstallation complete!"
    Write-Success "shepai has been removed from your system"
}

# Main
Write-Success "Uninstalling shepai..."
Uninstall-Shepai
