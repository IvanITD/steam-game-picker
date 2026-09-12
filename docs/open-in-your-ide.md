# Open this project locally

The full app lives in git. Pick one method below.

## Option 1 — Clone from GitHub

```bash
git clone https://github.com/IvanITD/steam-game-picker.git
cd steam-game-picker
npm install
npm run dev
```

Open **http://localhost:4317** in your browser.

Then in your editor: **File → Open Folder** → `steam-game-picker`

### Windows

```powershell
cd C:\Users\Ivan\repos
git clone https://github.com/IvanITD/steam-game-picker.git
cd steam-game-picker
npm install
npm run dev
```

## Option 2 — Create a private GitHub repo (if you don't have one yet)

```bash
cd ~/repos/steam-game-picker
gh auth login
./scripts/create-private-github-repo.sh steam-game-picker
```

Then clone from GitHub on any machine:

```bash
git clone git@github.com:IvanITD/steam-game-picker.git ~/repos/steam-game-picker
```

## Daily use

```bash
cd ~/repos/steam-game-picker
npm run dev
```

Edit files in your editor and run the dev server in a terminal.
