# step 1: install the unwindows cli tool
Push-Location (Join-Path $PSScriptRoot 'cli')

try {
    npm install
    npm link
}
finally {
    Pop-Location
}

# step 2: write powershell/profile.ps1 to (append) $PROFILE
$template = Join-Path $PSScriptRoot 'powershell\profile.ps1.template'

$beginMarker = '# >>> unwindows >>>'
$endMarker   = '# <<< unwindows <<<'

$profileDir = Split-Path $PROFILE -Parent
New-Item -ItemType Directory -Force -Path $profileDir | Out-Null

if (-not (Test-Path $PROFILE)) {
    New-Item -ItemType File -Path $PROFILE | Out-Null
}

$templateContent = Get-Content -Raw $template

$managedBlock = @"
$beginMarker
$templateContent
$endMarker
"@

$profileContent = Get-Content -Raw $PROFILE

$pattern = "(?s)$([regex]::Escape($beginMarker)).*?$([regex]::Escape($endMarker))"

if ($profileContent -match $pattern) {
    $profileContent = [regex]::Replace(
        $profileContent,
        $pattern,
        [System.Text.RegularExpressions.MatchEvaluator]{
            param($match)
            $managedBlock
        }
    )

    Set-Content -Path $PROFILE -Value $profileContent
} else {
    Add-Content -Path $PROFILE -Value "`n$managedBlock"
}
