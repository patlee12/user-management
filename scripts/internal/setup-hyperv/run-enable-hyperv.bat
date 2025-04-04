@echo off
SETLOCAL

REM Path to script
SET SCRIPT_PATH=%~dp0enable-hyperv-tools.ps1

REM Run PowerShell as admin inline so window stays open
powershell.exe -NoExit -ExecutionPolicy Bypass -Command ^
 "Start-Process powershell.exe -ArgumentList '-NoExit -ExecutionPolicy Bypass -File ""%SCRIPT_PATH%""' -Verb RunAs"

ENDLOCAL
