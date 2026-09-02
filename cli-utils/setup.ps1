Push-Location (Join-Path $PSScriptRoot 'cli')

try {
    npm install
    npm link
}
finally {
    Pop-Location
}

Write-Host "CLI setup complete. You can now use the CLI commands globally."
