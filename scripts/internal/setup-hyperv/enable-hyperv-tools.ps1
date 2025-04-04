Write-Host "`n=== SCRIPT STARTED ===" -ForegroundColor Cyan

function Pause-And-Exit($code) {
    Read-Host -Prompt "Press Enter to close..."
    exit $code
}

# Verify we're running in PowerShell
if (-not $PSVersionTable) {
    Write-Host "ERROR: This must be run in PowerShell." -ForegroundColor Red
    Pause-And-Exit 1
}

# Verify Administrator privileges
$IsAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $IsAdmin) {
    Write-Host "ERROR: Run this script as Administrator." -ForegroundColor Red
    Pause-And-Exit 1
}

Write-Host "`nChecking for Hyper-V Management PowerShell module..."
$hv = Get-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V-Management-PowerShell"
if ($hv.State -ne 'Enabled') {
    Write-Host "Enabling Hyper-V Management PowerShell module..."
    Enable-WindowsOptionalFeature -Online -FeatureName "Microsoft-Hyper-V-Management-PowerShell" -All -NoRestart
    Write-Host "Module enabled. A reboot is required."
    $ans = Read-Host "Reboot now? (Y/N)"
    if ($ans -match "^(y|Y)$") {
        Restart-Computer
    } else {
        Write-Host "Please reboot manually later."
        Pause-And-Exit 0
    }
} else {
    Write-Host "Hyper-V Management PowerShell module is already installed." -ForegroundColor Green
}

Write-Host "`nChecking for 'Multipass Bridge' virtual switch..."
try {
    $switches = Get-VMSwitch
} catch {
    Write-Host "ERROR: Could not load virtual switches. Is Hyper-V running?" -ForegroundColor Red
    Pause-And-Exit 1
}

if ($switches.Name -contains "Multipass Bridge") {
    Write-Host "'Multipass Bridge' exists." -ForegroundColor Green
} else {
    Write-Host "'Multipass Bridge' NOT found." -ForegroundColor Red
    Write-Host "To create it manually, do the following:"
    Write-Host " 1. Open Hyper-V Manager"
    Write-Host " 2. Go to Virtual Switch Manager"
    Write-Host " 3. Create a new External switch named: Multipass Bridge"
    $show = Read-Host "Show existing switches? (Y/N)"
    if ($show -match "^(y|Y)$") {
        $switches | Format-Table Name, SwitchType, NetAdapterInterfaceDescription
    }
}

# 🧱 Add mDNS Firewall Rules
Write-Host "`n🔐 Adding Windows Firewall rules for mDNS (UDP 5353)..."
try {
    New-NetFirewallRule -DisplayName "Allow mDNS (UDP 5353 Inbound)" `
        -Direction Inbound `
        -Protocol UDP `
        -LocalPort 5353 `
        -Action Allow `
        -Profile Any `
        -Group "User Management Dev Setup" `
        -ErrorAction Stop

    New-NetFirewallRule -DisplayName "Allow mDNS (UDP 5353 Outbound)" `
        -Direction Outbound `
        -Protocol UDP `
        -RemotePort 5353 `
        -Action Allow `
        -Profile Any `
        -Group "User Management Dev Setup" `
        -ErrorAction Stop

    Write-Host "✅ mDNS firewall rules added." -ForegroundColor Green
} catch {
    Write-Host "⚠️ Firewall rules may already exist or could not be added." -ForegroundColor Yellow
}

Write-Host "`n=== SCRIPT COMPLETED ===" -ForegroundColor Cyan
Pause-And-Exit 0
