# Builds ALIVE.apk without Gradle: aapt2 -> javac -> d8 -> zipalign -> apksigner.
# Usage: powershell -ExecutionPolicy Bypass -File build.ps1 [-Edition <name>]
# An edition adds its own assets, res and src from editions\<name> (default: public). editions\<name>\edition.ps1 may set
# $Package, $Apk, $Ks, $KsAlias and $KsPass to build it as another app id with another key.
param([string]$Edition = 'public')
$ErrorActionPreference = 'Stop'
$sdk = "$env:LOCALAPPDATA\Android\Sdk"; $bt = "$sdk\build-tools\34.0.0"; $jar = "$sdk\platforms\android-34\android.jar"
Set-Location $PSScriptRoot
$E = "editions\$Edition"; if (-not (Test-Path $E)) { throw "No edition folder $E" }
$Package = 'com.faiz.alive'; $Apk = 'ALIVE.apk'; $Ks = 'keys\alive-release.keystore'; $KsAlias = 'alive'; $KsPass = ''
if (Test-Path "$E\edition.ps1") { . "$E\edition.ps1" }
if (-not $KsPass -and (Test-Path 'keys\alive-release.pass')) { $KsPass = (Get-Content -Raw 'keys\alive-release.pass').Trim() }
if (-not (Test-Path "$E\res\mipmap\icon.png")) { throw "Edition '$Edition' has no icon and pictures yet (editions\$Edition\res, \assets)" }
node test.js; if ($LASTEXITCODE) { throw 'logic tests failed' }
# A syntax error in index.html's inline script means a blank app, so check it before packaging.
$js = [regex]::Matches([IO.File]::ReadAllText("$PSScriptRoot\assets\index.html"), '(?s)<script>(.*?)</script>') | ForEach-Object { $_.Groups[1].Value }
New-Item -ItemType Directory -Force build | Out-Null; [IO.File]::WriteAllText("$PSScriptRoot\build\inline.js", ($js -join "`n;`n"))
node --check build\inline.js; if ($LASTEXITCODE) { throw 'index.html script has a syntax error' }
node --check assets\journey.js; if ($LASTEXITCODE) { throw 'journey.js has a syntax error' }
node --check assets\acc.js; if ($LASTEXITCODE) { throw 'acc.js has a syntax error' }
node --check assets\art.js; if ($LASTEXITCODE) { throw 'art.js has a syntax error' }
node --check assets\studio.js; if ($LASTEXITCODE) { throw 'studio.js has a syntax error' }
# WebView blocks font files on file:// pages, so the pixel font ships inline as a data URI.
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("$PSScriptRoot\assets\fonts\pixelify.ttf"))
$d64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("$PSScriptRoot\assets\fonts\vt323.ttf"))
# Pixelify's 5 looks like S, so digits (and + %) come from VT323. Declared second = wins for its unicode-range.
[IO.File]::WriteAllText("$PSScriptRoot\assets\font.css", "@font-face{font-family:Pix;font-weight:400 700;src:url(data:font/ttf;base64,$b64) format('truetype')}" +
  "@font-face{font-family:Pix;font-weight:400 700;size-adjust:128%;unicode-range:U+0025,U+002B,U+0030-0039;src:url(data:font/ttf;base64,$d64) format('truetype')}")
Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue
New-Item -ItemType Directory build\sim | Out-Null
& javac -d build\sim src\com\faiz\alive\StepDay.java tools\StepSim.java; & java -cp build\sim StepSim | Select-Object -Last 1; if ($LASTEXITCODE) { throw 'step simulation failed' }
& javac -d build\sim src\com\faiz\alive\BackupPlan.java tools\BackupSim.java; & java -cp build\sim BackupSim | Select-Object -Last 1; if ($LASTEXITCODE) { throw 'backup rotation checks failed' }
& javac -d build\sim src\com\faiz\alive\NotionLink.java $E\src\com\faiz\alive\NotionDefault.java tools\NotionSim.java; & java -cp build\sim NotionSim | Select-Object -Last 1; if ($LASTEXITCODE) { throw 'notion link checks failed' }
New-Item -ItemType Directory build\res, build\classes, build\dex | Out-Null

& "$bt\aapt2.exe" compile --dir res -o build\res\res.zip; if ($LASTEXITCODE) { throw 'aapt2 compile' }
& "$bt\aapt2.exe" compile --dir $E\res -o build\res\ed.zip; if ($LASTEXITCODE) { throw 'aapt2 compile edition' }
# Another app id (from edition.ps1) installs next to ALIVE?: rename the package and its image provider.
$man = 'AndroidManifest.xml'; $ren = @()
if ($Package -ne 'com.faiz.alive') { $man = 'build\AndroidManifest.xml'; [IO.File]::WriteAllText("$PSScriptRoot\$man", ([IO.File]::ReadAllText("$PSScriptRoot\AndroidManifest.xml") -replace 'com\.faiz\.alive\.img', "$Package.img")); $ren = '--rename-manifest-package', $Package }
& "$bt\aapt2.exe" link -o build\unsigned.apk -I $jar --manifest $man @ren -A assets -A $E\assets build\res\res.zip build\res\ed.zip --java build\gen; if ($LASTEXITCODE) { throw 'aapt2 link' }

$src = (Get-ChildItem -Recurse src, $E\src, build\gen -Filter *.java).FullName
& javac -encoding UTF-8 --release 8 -nowarn -cp $jar -d build\classes $src; if ($LASTEXITCODE) { throw 'javac' }
& "$bt\d8.bat" --release --min-api 24 --lib $jar --output build\dex (Get-ChildItem -Recurse build\classes -Filter *.class).FullName; if ($LASTEXITCODE) { throw 'd8' }

Push-Location build\dex; & jar uf ..\unsigned.apk classes.dex; Pop-Location
& "$bt\zipalign.exe" -f 4 build\unsigned.apk build\aligned.apk

# Release key: keys\ is git-ignored. Back it up: losing it means no more updates for anyone who installed the app.
if (-not (Test-Path $Ks)) { throw "Signing key missing: $Ks" }
$sign = '--ks', $Ks, '--ks-key-alias', $KsAlias, '--ks-pass', "pass:$KsPass"
& "$bt\apksigner.bat" sign --v1-signing-enabled true --v2-signing-enabled true --v3-signing-enabled true @sign --out $Apk build\aligned.apk; if ($LASTEXITCODE) { throw 'apksigner' }
"Built: $PSScriptRoot\$Apk ($([math]::Round((Get-Item $Apk).Length/1KB)) KB)"
