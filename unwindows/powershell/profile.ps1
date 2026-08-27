# curl is an alias for Invoke-WebRequest in Windows PowerShell.
# curl.exe is the actual curl executable and supports the curl options we expect from Bash.
# Remove the alias so we don't have to type curl.exe every time.
Remove-Item Alias:curl -ErrorAction SilentlyContinue

# where is a read-only alias for Where-Object in Windows PowerShell.
# Remove the alias so where resolves to the native Windows where.exe command.
Remove-Item Alias:where -ErrorAction SilentlyContinue -Force

# pwd is a read-only alias for Get-Location in Windows PowerShell and contains unneeded information in the output.
# Remove the alias to use my custom pwd function that outputs only the current directory path.
Remove-Item Alias:pwd -ErrorAction SilentlyContinue

# add which alias for the native Windows where.exe command.
Set-Alias which where.exe -Force

# add Ctrl + k keybinding to clear the console in Windows PowerShell (default is Ctrl + l).
Set-PSReadLineKeyHandler -Key "Ctrl+k" -Function ClearScreen

# add open alias for the native Windows explorer.exe command.
Set-Alias open explorer.exe -Force
