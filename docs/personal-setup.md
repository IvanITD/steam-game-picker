# Personal setup guide (Ivan)

This app is for **your personal use only**. No public launch, no app store, no database.

## What you need

| Item | Where to get it |
|------|-----------------|
| Steam ID64 | [steamid.io](https://steamid.io) or Steam profile URL |
| Steam Web API key | [steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey) |
| Public game details | Steam → Settings → Privacy → Profile + Game details = **Public** |

Your Steam ID and API key are stored **only in your browser** (`localStorage`). Nothing is saved on a server.

---

## Option A — Run on your computer (simplest)

```bash
git clone https://github.com/IvanITD/steam-game-picker.git
cd steam-game-picker
npm install
npm run dev
```

Open http://localhost:4317

**Production mode on your PC:**

```bash
npm run build
npm start -p 4317
```

---

## Option B — Private GitHub repo + Vercel (use from anywhere)

### 1. Create a **private** GitHub repo

**Recommended (one command):**

```bash
gh auth login   # once, if not already signed in
chmod +x scripts/create-private-github-repo.sh
./scripts/create-private-github-repo.sh steam-game-picker
```

This creates the repo as **Private** — only you can see it.

**Or manually:**

1. Go to [github.com/new](https://github.com/new)
2. Name: `steam-game-picker`
3. Visibility: **Private** ← required for personal use
4. Do **not** add README (you already have one)
5. Create repository

```bash
git remote add github https://github.com/IvanITD/steam-game-picker.git
git push -u github main
```

**If the repo already exists but is public**, make it private:

```bash
gh repo edit IvanITD/steam-game-picker --visibility private
```

Or: GitHub → repo → **Settings** → **General** → **Danger Zone** → **Change repository visibility** → **Private**.

### 3. Deploy on Vercel (free)

1. Sign in at [vercel.com](https://vercel.com) with GitHub
2. **Add New Project** → import `steam-game-picker`
3. Framework: **Next.js** (auto-detected)
4. Deploy — no environment variables required for basic use
5. Your URL: [https://steam-game-picker-xi.vercel.app/](https://steam-game-picker-xi.vercel.app/)

Optional: Settings → Deployment Protection → **Vercel Authentication** so only you can open it.

### 4. Connect your Steam library

1. Open your deployed URL (or localhost)
2. **Settings** → turn off **Use demo library**
3. Enter Steam ID64 + API key → **Save**
4. Click **Refresh** if needed

---

## Install as an app (PWA)

On **Chrome / Edge** (desktop or Android):

1. Open your deployed or local URL
2. Address bar → **Install** icon, or menu → **Install Steam Game Picker**
3. App opens in its own window like a native app

On **iPhone**: Safari → Share → **Add to Home Screen**

---

## Updating later

```bash
git pull
npm install
npm run build   # if self-hosting
```

On Vercel, every `git push` to `main` auto-redeploys.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| No games / private profile | Set Steam profile + game details to Public |
| Missing API key error | Add key in Settings from steamcommunity.com/dev/apikey |
| API timeout | Retry, or use demo mode temporarily |
| Wrong library | Check Steam ID64 is yours (17 digits) |

---

## Security notes (personal use)

- Keep the GitHub repo **private** if you don't want the code public
- API key lives in your browser — don't share your machine profile
- Optional: enable Vercel password protection on your deployment
- The app only **reads** your library via official Steam Web API — no automation, no ban risk
