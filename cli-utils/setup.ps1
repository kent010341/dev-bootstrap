Push-Location (Join-Path $PSScriptRoot 'cli')

try {
    npm install
    npm link
}
finally {
    Pop-Location
}
