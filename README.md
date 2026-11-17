<p align="center">
  <img src="editions/public/store_icon_512.png" alt="ALIVE? icon" width="160">
</p>

<h1 align="center">ALIVE?</h1>

<p align="center"><b>Your life, played like a pixel RPG.</b><br>
A private, offline-first Android app that turns eating well, training, sleeping, quitting bad habits and chasing big goals into XP, streaks and maps you climb.</p>

<p align="center">
  <a href="https://github.com/faizdevx/alive-app/releases/latest/download/ALIVE.apk"><b>⬇ Download ALIVE.apk</b></a>
  &nbsp;·&nbsp;
  <a href="https://github.com/faizdevx/alive-app/releases/latest">All releases</a>
</p>

---

## What it is

ALIVE? asks one question every day: are you actually living well? You log the boring stuff and the app turns it into a game.

- **Daily tracking:** meals (calories and macros), workouts, sleep, steps, habits and your mood.
- **No calorie maths by hand:** snap a photo or type what you ate. ALIVE? opens the ChatGPT app with everything filled in and reads the answer back as numbers.
- **XP, levels and streaks:** good days earn XP. Slips like scrolling or smoking never take XP away; they break your clean streaks instead.
- **Your own pixel avatar:** the Avatar studio turns one selfie into a pixel character, then draws every picture in the app with your face on it.
- **Journeys:** long goals played as maps.
  - **GATE:** a chapter-by-chapter exam roadmap from concepts to question practice to mocks, with a backlog for anything left behind.
  - **Placement Tower:** 14 floors of coding, aptitude, SQL and interview prep topics.
  - **Your Lab:** your own projects, each with a todo list, sorted into folders.
- **Private by design:** no account, no server, no ads, no analytics. Data stays on your phone, with automatic backups to a folder you choose.

## How to use it

1. **Install:** download `ALIVE.apk` from the link above, open it, and allow your browser or file manager to install apps when Android asks.
2. **Set up:** the first launch walks you through how the app works, your details and targets, and which modules you want. Coming back? Pick **Backup folder** on the first screen to restore everything.
3. **Make your avatar (optional):** Me → **Avatar studio**. Take a selfie and send it to ChatGPT. When the picture is ready, tap it in ChatGPT → **Share** → **ALIVE?**. Do the same for any other picture.
4. **Log your day:** tap **Log** for meals, workouts, sleep, steps, habits or mood. For food and training, tap **Ask ChatGPT**, send, and come back with the answer.
5. **Play a journey:** open **Journey**, pick one, answer the start questions, and climb.
6. **Stay backed up:** Me → Backup → **Choose backup folder**. ALIVE? then saves on its own whenever something changes.

The app checks this page once a day and shows **Update available** on Home when a new version is out. It sends nothing about you.

### Auto mode (optional)

Auto mode lets ALIVE? type into the ChatGPT app, press Send and read the answer for you, using Android's accessibility service. It can only see the ChatGPT app.

> Banking and UPI apps block payments while any downloaded accessibility service is on. Turn auto mode off before paying, or toggle it with Android's accessibility shortcut.

## Tech stack

| Part | What it uses |
|---|---|
| App shell | Native Android in **Java** (min Android 7.0, API 24 · target API 34), one `Activity` hosting a `WebView` |
| Interface | Plain **HTML, CSS and JavaScript** (no framework), pixel fonts Pixelify Sans and VT323 |
| Pixel art | Drawn at runtime on an HTML **canvas**; icon generated with **Python + Pillow** |
| Storage | `localStorage` for app data, app-private files for avatar pictures |
| Backups | Storage Access Framework folder, gzip files with a SHA-256 checksum, 7-daily / 4-weekly / 6-monthly rotation |
| ChatGPT link | Android share intents, clipboard, and an optional `AccessibilityService` |
| Sensors | Step counter sensor, `UsageStatsManager` for screen time, exact alarms for the midnight step reset |
| Build | **No Gradle:** a PowerShell script drives `aapt2 → javac → d8 → zipalign → apksigner` |
| Tests | Node.js logic tests, Java simulations for steps, backup rotation and link checks, headless Edge for the UI |

## Privacy

- Your data lives in the app and in backup files inside the folder you pick.
- A photo or text goes to ChatGPT only when you tap a button that says so. Your selfie is deleted once your avatar is made.
- Backup files are not encrypted, so any app with file access on your phone can read them.

## Build it yourself

Needs Windows, the Android SDK (build-tools 34, platform 34), a JDK, Node.js and Python with Pillow.

```powershell
powershell -ExecutionPolicy Bypass -File build.ps1
```

Signing uses `keys\alive-release.keystore` with its password in `keys\alive-release.pass` (git-ignored). Make your own key with `keytool` for a build of your own. The icon is drawn by `python tools/public_icon.py`.
