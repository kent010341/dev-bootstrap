git config --global alias.back "checkout -" --replace-all
git config --global alias.copy '!f(){ git checkout $1 -- $2; }; f' --replace-all
git config --global alias.listalias '!git config --get-regexp "^alias\."' --replace-all
git config --global alias.fp "fetch --prune" --replace-all
git config --global alias.pp "pull --prune" --replace-all
git config --global alias.discard '!git reset --hard && git clean -fd' --replace-all
git config --global alias.unstage "restore --staged" --replace-all

Write-Host "Git aliases have been set up successfully."
