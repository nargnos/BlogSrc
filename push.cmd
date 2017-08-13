git submodule foreach git add .
git submodule foreach git commit -m "update content"
git submodule foreach git push
git add .
git commit -m update
git push