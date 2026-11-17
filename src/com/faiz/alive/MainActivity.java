package com.faiz.alive;

import android.app.Activity;
import android.app.AppOpsManager;
import android.app.usage.UsageEvents;
import android.app.usage.UsageStatsManager;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Process;
import android.provider.Settings;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.widget.Toast;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;
import org.json.JSONArray;
import org.json.JSONObject;

public class MainActivity extends Activity implements SensorEventListener {
    static final String CHATGPT = "com.openai.chatgpt";
    static final String PERM = "android.permission.ACTIVITY_RECOGNITION";
    WebView web;
    volatile float stepRaw = -1;
    float savedRaw = -1; long savedAt = 0;

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        // Fresh launch only: after Android kills us during the camera, b != null and the new photo must survive.
        if (b == null) ImgProvider.file(this, "meal.jpg").delete();
        web = new WebView(this);
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(true);
        web.setWebChromeClient(new WebChromeClient()); // without it confirm() silently returns false
        web.addJavascriptInterface(new Bridge(), "Android");
        web.setBackgroundColor(0xFF121411);
        web.loadUrl("file:///android_asset/index.html");
        root = new android.widget.FrameLayout(this); // app page + (later) the Cockpit's Notion view on top of it
        root.addView(web, new android.widget.FrameLayout.LayoutParams(-1, -1));
        setContentView(root);
        if (stepsAllowed()) startSteps(); // first-run setup asks for it otherwise
        takeShared(getIntent());
        StepReceiver.schedule(this);
    }

    boolean stepsAllowed() { return Build.VERSION.SDK_INT < 29 || checkSelfPermission(PERM) == PackageManager.PERMISSION_GRANTED; }

    @Override public void onRequestPermissionsResult(int c, String[] p, int[] r) {
        if (stepsAllowed()) startSteps();
        web.evaluateJavascript("window.onAppResume&&onAppResume()", null);
    }

    void startSteps() {
        SensorManager sm = (SensorManager) getSystemService(SENSOR_SERVICE);
        Sensor s = sm.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
        if (s != null) sm.registerListener(this, s, SensorManager.SENSOR_DELAY_NORMAL);
    }

    @Override public void onSensorChanged(SensorEvent e) {
        stepRaw = e.values[0];
        long now = System.currentTimeMillis();
        if (Math.abs(stepRaw - savedRaw) >= 20 || now - savedAt > 60_000) { StepReceiver.reading(this, stepRaw); savedRaw = stepRaw; savedAt = now; }
    }
    @Override public void onAccuracyChanged(Sensor s, int a) {}

    @Override protected void onNewIntent(Intent i) { super.onNewIntent(i); setIntent(i); takeShared(i); }
    // Avatar studio: an image shared to ALIVE? (from ChatGPT) fills the slot the studio is waiting for.
    void takeShared(Intent i) {
        if (i == null || !Intent.ACTION_SEND.equals(i.getAction())) return;
        Uri u = i.getParcelableExtra(Intent.EXTRA_STREAM); i.setAction(null); // handle once
        String slot = getSharedPreferences("studio", MODE_PRIVATE).getString("wait", "");
        if (u == null) { toast("No picture in that share"); return; }
        if (!AvatarImg.okSlot(slot)) { toast("Open Avatar studio and pick a picture first"); return; }
        new Thread(() -> {
            try (InputStream in = getContentResolver().openInputStream(u)) {
                AvatarImg.save(this, slot, readAll(in));
                getSharedPreferences("studio", MODE_PRIVATE).edit().remove("wait").apply();
                runOnUiThread(() -> web.evaluateJavascript("window.onAvImg&&onAvImg(" + JSONObject.quote(slot) + ")", null));
            } catch (Exception e) { toast("Couldn't use that picture: " + e.getMessage()); }
        }).start();
    }

    @Override protected void onResume() { super.onResume(); if (web != null) web.evaluateJavascript("window.onAppResume&&onAppResume()", null); }

    @Override protected void onPause() {
        super.onPause(); android.webkit.CookieManager.getInstance().flush(); // keep the Notion login on disk
        if (web != null) web.evaluateJavascript("window.onAppPause&&onAppPause()", null); // auto backup if anything changed
    }

    @Override public void onBackPressed() {
        if (nweb != null && nweb.getVisibility() == android.view.View.VISIBLE && nweb.canGoBack()) { nweb.goBack(); return; } // back through Notion pages first
        web.evaluateJavascript("goBack()", r -> { if (!"true".equals(r)) finish(); });
    }

    @Override protected void onActivityResult(int req, int res, Intent data) {
        if (req == 4) { // file picked for a Notion upload (or cancelled: Notion must still be told)
            if (fileCb != null) fileCb.onReceiveValue(android.webkit.WebChromeClient.FileChooserParams.parseResult(res, data));
            fileCb = null; return;
        }
        if (res != RESULT_OK) return;
        try {
            if (req == 5) { // backup folder picked
                AutoBackup.setTree(this, data.getData());
                web.evaluateJavascript("window.onBackupFolder&&onBackupFolder()", null);
                return;
            }
            if (req == 3) { // backup file picked: plain JSON (manual export) or an auto backup (.json.gz, checksum checked)
                String txt; byte[] raw;
                try (InputStream in = getContentResolver().openInputStream(data.getData())) { raw = readAll(in); }
                txt = AutoBackup.isGzip(raw) ? AutoBackup.gunzip(raw) : new String(raw, "UTF-8");
                String bad = AutoBackup.verify(txt); if (bad != null) { toast(bad); return; }
                web.evaluateJavascript("importText(" + JSONObject.quote(txt) + ")", null);
                return;
            }
            File f = ImgProvider.file(this, "meal.jpg");
            InputStream in = req == 2 && data != null && data.getData() != null
                    ? getContentResolver().openInputStream(data.getData()) : new java.io.FileInputStream(f);
            Bitmap bm = shrink(in);
            try (OutputStream out = new FileOutputStream(f)) { bm.compress(Bitmap.CompressFormat.JPEG, 82, out); }
            web.evaluateJavascript("window.onPhoto&&onPhoto(true)", null); // page may still be loading after a restart; JS restores from saved state
        } catch (Exception e) { toast("Failed: " + e.getMessage()); }
    }

    // Downscale to ~1280px so the temp file stays small.
    Bitmap shrink(InputStream in) throws Exception {
        byte[] buf; try (InputStream i = in) { buf = readAll(i); }
        BitmapFactory.Options o = new BitmapFactory.Options(); o.inJustDecodeBounds = true;
        BitmapFactory.decodeByteArray(buf, 0, buf.length, o);
        o.inSampleSize = 1; while (Math.max(o.outWidth, o.outHeight) / o.inSampleSize > 2000) o.inSampleSize *= 2;
        o.inJustDecodeBounds = false;
        Bitmap bm = BitmapFactory.decodeByteArray(buf, 0, buf.length, o);
        if (bm == null) throw new Exception("image format not supported");
        float k = 1280f / Math.max(bm.getWidth(), bm.getHeight());
        return k < 1 ? Bitmap.createScaledBitmap(bm, Math.round(bm.getWidth() * k), Math.round(bm.getHeight() * k), true) : bm;
    }

    static byte[] readAll(InputStream in) throws Exception {
        java.io.ByteArrayOutputStream b = new java.io.ByteArrayOutputStream(); byte[] x = new byte[16384]; int n;
        while ((n = in.read(x)) > 0) b.write(x, 0, n); return b.toByteArray();
    }

    void toast(String s) { runOnUiThread(() -> Toast.makeText(this, s, Toast.LENGTH_LONG).show()); }

    // ---------- My Cockpit → Notion ----------
    // Opens the real notion website in a Chrome Custom Tab. No androidx.browser here (this project builds without Gradle),
    // so the tab is requested with the public Custom Tabs intent extras that the library itself sets.
    static final String CT_SERVICE = "android.support.customtabs.action.CustomTabsService";
    static final Uri PROBE = Uri.parse("https://www.example.com"); // any web link: finds browsers, never the Notion app

    android.content.SharedPreferences notionPrefs() { return getSharedPreferences("notion", MODE_PRIVATE); }
    String notionUrl() { String u = notionPrefs().getString("url", NotionLink.DEFAULT); return NotionLink.problem(u) == null ? u : NotionLink.DEFAULT; }

    /** Browsers that can show web links, default browser first. */
    java.util.List<String> browsers() {
        PackageManager pm = getPackageManager();
        java.util.List<String> out = new java.util.ArrayList<>();
        for (android.content.pm.ResolveInfo r : pm.queryIntentActivities(new Intent(Intent.ACTION_VIEW, PROBE), PackageManager.MATCH_ALL))
            if (!out.contains(r.activityInfo.packageName)) out.add(r.activityInfo.packageName);
        android.content.pm.ResolveInfo def = pm.resolveActivity(new Intent(Intent.ACTION_VIEW, PROBE), PackageManager.MATCH_DEFAULT_ONLY);
        if (def != null && out.remove(def.activityInfo.packageName)) out.add(0, def.activityInfo.packageName);
        return out;
    }
    /** Browser with Custom Tabs support: default first, then Chrome, then any. null if none. */
    String customTabBrowser(java.util.List<String> all) {
        java.util.List<String> ct = new java.util.ArrayList<>();
        for (String p : all) if (getPackageManager().resolveService(new Intent(CT_SERVICE).setPackage(p), 0) != null) ct.add(p);
        if (ct.isEmpty()) return null;
        return ct.get(0).equals(all.get(0)) || !ct.contains("com.android.chrome") ? ct.get(0) : "com.android.chrome";
    }
    boolean online() {
        android.net.ConnectivityManager cm = (android.net.ConnectivityManager) getSystemService(CONNECTIVITY_SERVICE);
        android.net.NetworkCapabilities c = cm.getNetworkCapabilities(cm.getActiveNetwork());
        return c != null && c.hasCapability(android.net.NetworkCapabilities.NET_CAPABILITY_INTERNET);
    }
    // ---------- Cockpit tab: the real notion website inside the app ----------
    // A second WebView, separate from the app page: it never gets the Android bridge, keeps its own Notion login cookies,
    // and only loads https Notion pages; every other link goes to the browser. Google blocks its sign-in inside apps,
    // so in here you log in with "Continue with email" (Notion mails a code), or use Open in Chrome.
    android.widget.FrameLayout root;
    WebView nweb; String nLoaded; android.webkit.ValueCallback<Uri[]> fileCb;

    void notionEv(String k, String v) { web.evaluateJavascript("window.notionEv&&notionEv(" + JSONObject.quote(k) + "," + JSONObject.quote(v == null ? "" : v) + ")", null); }

    WebView notionWeb() {
        if (nweb != null) return nweb;
        nweb = new WebView(this);
        android.webkit.WebSettings s = nweb.getSettings();
        s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false); s.setAllowContentAccess(false);
        s.setUseWideViewPort(true); s.setLoadWithOverviewMode(true);
        nweb.setBackgroundColor(0xFF0F120F);
        android.webkit.CookieManager.getInstance().setAcceptCookie(true);
        android.webkit.CookieManager.getInstance().setAcceptThirdPartyCookies(nweb, true);
        nweb.setWebViewClient(new android.webkit.WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView v, android.webkit.WebResourceRequest r) {
                if (!r.isForMainFrame()) return false;
                Uri u = r.getUrl(); String sc = u.getScheme(), h = u.getHost() == null ? "" : u.getHost().toLowerCase();
                if ("https".equals(sc) && NotionLink.hostOk(h)) return false; // Notion pages stay in the cockpit
                if (h.equals("accounts.google.com") || h.equals("appleid.apple.com")) {
                    toast("Google/Apple sign-in is blocked inside apps. Tap 'Continue with email': Notion mails a login code to your Gmail.");
                    return true;
                }
                if ("https".equals(sc) || "http".equals(sc) || "mailto".equals(sc)) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception e) { toast("No app can open that link"); }
                }
                return true; // intent:, notion:// and other app links are never followed
            }
            @Override public void onPageStarted(WebView v, String url, Bitmap f) { notionEv("loading", url); }
            @Override public void onPageFinished(WebView v, String url) { notionEv("ready", url); }
            @Override public void doUpdateVisitedHistory(WebView v, String url, boolean reload) { notionEv("url", url); }
            @Override public void onReceivedError(WebView v, android.webkit.WebResourceRequest r, android.webkit.WebResourceError e) {
                if (r.isForMainFrame()) notionEv("error", String.valueOf(e.getDescription()));
            }
            @Override public boolean onRenderProcessGone(WebView v, android.webkit.RenderProcessGoneDetail d) { // don't take ALIVE? down with it
                root.removeView(v); v.destroy(); nweb = null; nLoaded = null;
                notionEv("error", "The Notion page crashed."); return true;
            }
        });
        nweb.setWebChromeClient(new WebChromeClient() {
            @Override public void onReceivedTitle(WebView v, String t) { notionEv("title", t); }
            @Override public boolean onShowFileChooser(WebView v, android.webkit.ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (fileCb != null) fileCb.onReceiveValue(null);
                fileCb = cb;
                try { startActivityForResult(p.createIntent(), 4); return true; }
                catch (Exception e) { fileCb = null; toast("No file picker found"); return false; }
            }
        });
        nweb.setDownloadListener((url, ua, cd, mime, len) -> {
            try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url))); } catch (Exception e) { toast("Can't download that here"); }
        });
        nweb.setVisibility(android.view.View.GONE);
        root.addView(nweb, new android.widget.FrameLayout.LayoutParams(-1, -1));
        return nweb;
    }

    String appLabel(String pkg) {
        try { return getPackageManager().getApplicationLabel(getPackageManager().getApplicationInfo(pkg, 0)).toString(); } catch (Exception e) { return pkg; }
    }

    ClipboardManager clip() { return (ClipboardManager) getSystemService(CLIPBOARD_SERVICE); }

    class Bridge {
        @JavascriptInterface public void copy(String t) { runOnUiThread(() -> clip().setPrimaryClip(ClipData.newPlainText("ALIVE?", t))); }

        @JavascriptInterface public String readClipboard() {
            ClipData c = clip().getPrimaryClip();
            if (c == null || c.getItemCount() == 0) return "";
            CharSequence t = c.getItemAt(0).coerceToText(MainActivity.this);
            return t == null ? "" : t.toString();
        }

        @JavascriptInterface public void pickPhoto(boolean camera) {
            runOnUiThread(() -> {
                try {
                    if (camera) {
                        Intent i = new Intent(android.provider.MediaStore.ACTION_IMAGE_CAPTURE);
                        i.putExtra(android.provider.MediaStore.EXTRA_OUTPUT, ImgProvider.uri("meal.jpg"));
                        i.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_READ_URI_PERMISSION);
                        startActivityForResult(i, 1);
                    } else startActivityForResult(new Intent(Intent.ACTION_GET_CONTENT).setType("image/*"), 2);
                } catch (ActivityNotFoundException e) { toast("No camera/gallery app found"); }
            });
        }

        @JavascriptInterface public boolean hasPhoto() { return ImgProvider.file(MainActivity.this, "meal.jpg").length() > 0; }
        @JavascriptInterface public void clearPhoto() { ImgProvider.file(MainActivity.this, "meal.jpg").delete(); }

        /** Auto mode (accessibility service on): GptDriver types, sends and reads the answer back. */
        @JavascriptInterface public boolean hasAutoGPT() { return GptDriver.enabled(MainActivity.this); }
        @JavascriptInterface public void openAutoGPTSettings() { startActivity(new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)); }
        /** Result left by GptDriver ({kind, text} or {kind, error}); cleared once read. */
        @JavascriptInterface public String takeGptResult() {
            android.content.SharedPreferences p = getSharedPreferences("gpt", MODE_PRIVATE);
            String r = p.getString("result", ""); p.edit().remove("result").commit(); return r;
        }

        // Opens ChatGPT with the prompt (and photo). Manual mode also copies the prompt, in case ChatGPT drops shared text.
        @JavascriptInterface public void askChatGPT(String kind, String prompt, boolean withPhoto) {
            boolean auto = GptDriver.enabled(MainActivity.this);
            if (auto) GptDriver.start(kind, prompt); else copy(prompt);
            Intent i = new Intent(Intent.ACTION_SEND).putExtra(Intent.EXTRA_TEXT, prompt);
            if (withPhoto && hasPhoto()) {
                i.setType("image/jpeg").putExtra(Intent.EXTRA_STREAM, ImgProvider.uri("meal.jpg")).addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            } else i.setType("text/plain");
            runOnUiThread(() -> {
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK); // ChatGPT in its own task, so coming back resumes ALIVE? instead of recreating it
                try { startActivity(new Intent(i).setPackage(CHATGPT)); }
                catch (ActivityNotFoundException e) { startActivity(Intent.createChooser(i, "Send to AI")); }
                toast(auto ? "ChatGPT is on it. You'll be brought back with the answer." : "Prompt copied too. In ChatGPT: send, then tap Copy on the answer and come back.");
            });
        }

        // Backup goes out as a file attachment: no size limit like shared text has.
        @JavascriptInterface public void exportBackup(String json) {
            try (OutputStream o = new FileOutputStream(ImgProvider.file(MainActivity.this, "alive-backup.json"))) { o.write(json.getBytes("UTF-8")); }
            catch (Exception e) { toast("Backup failed: " + e.getMessage()); return; }
            Intent i = new Intent(Intent.ACTION_SEND).setType("application/json")
                    .putExtra(Intent.EXTRA_STREAM, ImgProvider.uri("alive-backup.json")).addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            runOnUiThread(() -> startActivity(Intent.createChooser(i, "Save backup (Drive, Files, email…)")));
        }

        // ---------- auto backup (AutoBackup.java) ----------
        @JavascriptInterface public void backupPickFolder() {
            runOnUiThread(() -> {
                try { startActivityForResult(new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE).addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION), 5); }
                catch (ActivityNotFoundException e) { toast("No folder picker found"); }
            });
        }
        @JavascriptInterface public String backupNow(String meta, String data, boolean force) {
            String v = ""; try { v = getPackageManager().getPackageInfo(getPackageName(), 0).versionName; } catch (Exception ignored) {}
            return AutoBackup.run(MainActivity.this, meta, data, force, v);
        }
        @JavascriptInterface public String backupState() { return AutoBackup.state(MainActivity.this); }
        @JavascriptInterface public String backupList() { return AutoBackup.files(MainActivity.this); }
        @JavascriptInterface public String backupRead(String name) { return AutoBackup.read(MainActivity.this, name); }

        // ---------- Avatar studio (AvatarImg.java) ----------
        /** {slot: content url} for every picture made so far. */
        @JavascriptInterface public String avList() {
            JSONObject o = new JSONObject();
            File[] fs = getFilesDir().listFiles(); if (fs != null) for (File f : fs) {
                String n = f.getName(); if (!ImgProvider.isAv(n)) continue;
                try { o.put(n.substring(3, n.length() - 4), ImgProvider.uri(n) + "?v=" + f.lastModified()); } catch (Exception ignored) {}
            }
            return o.toString();
        }
        @JavascriptInterface public void avDelete(String slot) { if (AvatarImg.okSlot(slot)) AvatarImg.file(MainActivity.this, slot).delete(); }
        /** Opens ChatGPT with the prompt and a picture (the selfie for "base", your base avatar for the rest); waits for the share back. */
        @JavascriptInterface public String avAsk(String slot, String prompt) {
            if (!AvatarImg.okSlot(slot)) return "bad slot";
            String src = slot.equals("base") ? "meal.jpg" : "av_base.png";
            File f = slot.equals("base") ? ImgProvider.file(MainActivity.this, "meal.jpg") : AvatarImg.file(MainActivity.this, "base");
            if (f.length() == 0) return slot.equals("base") ? "Take or pick a photo first" : "Make your base avatar first";
            getSharedPreferences("studio", MODE_PRIVATE).edit().putString("wait", slot).apply();
            copy(prompt);
            Intent i = new Intent(Intent.ACTION_SEND).putExtra(Intent.EXTRA_TEXT, prompt).setType(src.endsWith(".png") ? "image/png" : "image/jpeg")
                    .putExtra(Intent.EXTRA_STREAM, ImgProvider.uri(src)).addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            runOnUiThread(() -> {
                try { startActivity(new Intent(i).setPackage(CHATGPT)); }
                catch (ActivityNotFoundException e) { startActivity(Intent.createChooser(i, "Send to AI")); }
                toast("Prompt copied too. When the picture is ready: tap it, Share, then ALIVE?");
            });
            return "";
        }

        @JavascriptInterface public void pickBackup() {
            runOnUiThread(() -> {
                try { startActivityForResult(new Intent(Intent.ACTION_GET_CONTENT).setType("*/*").addCategory(Intent.CATEGORY_OPENABLE), 3); }
                catch (ActivityNotFoundException e) { toast("No file picker found"); }
            });
        }

        /** {date, steps, partial, since, prevDate, prevSteps} from StepDay; "" if no reading yet. */
        @JavascriptInterface public String stepState() {
            if (stepRaw >= 0) StepReceiver.reading(MainActivity.this, stepRaw);
            StepDay s = StepReceiver.load(MainActivity.this);
            return s.base < 0 ? "" : s.json();
        }
        @JavascriptInterface public boolean hasStepsPerm() { return stepsAllowed(); }
        @JavascriptInterface public boolean hasStepSensor() { return ((SensorManager) getSystemService(SENSOR_SERVICE)).getDefaultSensor(Sensor.TYPE_STEP_COUNTER) != null; }

        // After "deny" twice Android stops showing the dialog, so send the user to the app's settings page instead.
        @JavascriptInterface public void requestSteps() {
            if (Build.VERSION.SDK_INT < 29) return;
            runOnUiThread(() -> {
                android.content.SharedPreferences sp = getSharedPreferences("app", MODE_PRIVATE);
                if (sp.getBoolean("askedSteps", false) && !shouldShowRequestPermissionRationale(PERM)) {
                    toast("Turn on Physical activity in Permissions");
                    startActivity(new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + getPackageName())));
                } else { sp.edit().putBoolean("askedSteps", true).apply(); requestPermissions(new String[]{PERM}, 1); }
            });
        }
        @JavascriptInterface public boolean hasChatGPT() {
            try { getPackageManager().getPackageInfo(CHATGPT, 0); return true; } catch (Exception e) { return false; }
        }

        // ---- My Cockpit → Notion. The link lives in SharedPreferences "notion" (never in Life RPG records); every open re-validates it. ----
        /** {url, isDefault, lastOpen, online, browser, customTab}. lastOpen = last time the browser tab was launched, not proof Notion loaded. */
        @JavascriptInterface public String notionState() {
            try {
                String u = notionUrl(); java.util.List<String> all = browsers(); String ct = all.isEmpty() ? null : customTabBrowser(all);
                return new JSONObject().put("url", u).put("isDefault", u.equals(NotionLink.DEFAULT)).put("lastOpen", notionPrefs().getLong("lastOpen", 0))
                        .put("online", online()).put("browser", ct != null ? appLabel(ct) : all.isEmpty() ? "" : appLabel(all.get(0))).put("customTab", ct != null).toString();
            } catch (Exception e) { return ""; }
        }
        /** "" when saved, else the reason the link was refused. */
        @JavascriptInterface public String setNotionUrl(String url) {
            String p = NotionLink.problem(url); if (p != null) return p;
            if (!NotionLink.hostOk(Uri.parse(url.trim()).getHost())) return "That isn't a Notion link."; // Android's parser must agree
            notionPrefs().edit().putString("url", url.trim()).remove("lastOpen").apply(); return "";
        }
        /** Cockpit tab shows/hides the Notion view; top/bottom = CSS px of the pixel header and bottom nav it must leave visible. */
        @JavascriptInterface public void notionShow(boolean on, double top, double bottom) {
            runOnUiThread(() -> {
                if (!on) { if (nweb != null) nweb.setVisibility(android.view.View.GONE); return; }
                WebView w = notionWeb(); float d = getResources().getDisplayMetrics().density;
                android.widget.FrameLayout.LayoutParams lp = (android.widget.FrameLayout.LayoutParams) w.getLayoutParams();
                lp.topMargin = Math.round((float) top * d); lp.bottomMargin = Math.round((float) bottom * d); w.setLayoutParams(lp);
                String u = notionUrl(); if (!u.equals(nLoaded)) { nLoaded = u; w.loadUrl(u); } // first open, or link changed in settings
                w.setVisibility(android.view.View.VISIBLE);
            });
        }
        /** back | reload | home (= the saved cockpit page). */
        @JavascriptInterface public void notionNav(String what) {
            runOnUiThread(() -> {
                if (nweb == null) return;
                if ("back".equals(what)) { if (nweb.canGoBack()) nweb.goBack(); }
                else if ("reload".equals(what)) nweb.reload();
                else if ("home".equals(what)) { nLoaded = notionUrl(); nweb.loadUrl(nLoaded); }
            });
        }
        @JavascriptInterface public void resetNotionUrl() { notionPrefs().edit().remove("url").remove("lastOpen").apply(); }

        /**
         * Opens url (empty = the saved link) in a Custom Tab, falling back to the plain browser.
         * The browser package is set explicitly so the standalone Notion app is never forced open.
         * Returns "" once the launch is started, "offline", "nobrowser", or a reason the link was refused.
         */
        @JavascriptInterface public String openNotion(String url, boolean evenOffline) {
            boolean saved = url == null || url.trim().isEmpty();
            String u = saved ? notionUrl() : url.trim();
            String p = NotionLink.problem(u); if (p != null) return p;
            Uri uri = Uri.parse(u);
            if (!NotionLink.hostOk(uri.getHost())) return "That isn't a Notion link.";
            if (!evenOffline && !online()) return "offline";
            java.util.List<String> all = browsers(); if (all.isEmpty()) return "nobrowser";
            String ct = customTabBrowser(all);
            Intent i = new Intent(Intent.ACTION_VIEW, uri).setPackage(ct != null ? ct : all.get(0));
            Bundle start = null;
            if (ct != null) {
                Bundle session = new Bundle(); session.putBinder("android.support.customtabs.extra.SESSION", null); i.putExtras(session); // marks the intent as a Custom Tab
                int bg = 0xFF0F120F; // app background, so the tab looks like part of ALIVE?
                i.putExtra("android.support.customtabs.extra.TOOLBAR_COLOR", bg)
                 .putExtra("androidx.browser.customtabs.extra.NAVIGATION_BAR_COLOR", bg)
                 .putExtra("androidx.browser.customtabs.extra.COLOR_SCHEME", 2) // dark
                 .putExtra("android.support.customtabs.extra.TITLE_VISIBILITY", 1) // show Notion's page title
                 .putExtra("android.support.customtabs.extra.EXIT_ANIMATION_BUNDLE",
                        android.app.ActivityOptions.makeCustomAnimation(MainActivity.this, android.R.anim.fade_in, android.R.anim.slide_out_right).toBundle());
                start = android.app.ActivityOptions.makeCustomAnimation(MainActivity.this, android.R.anim.slide_in_left, android.R.anim.fade_out).toBundle();
            }
            i.putExtra(Intent.EXTRA_REFERRER, Uri.parse("android-app://" + getPackageName()));
            Bundle anim = start;
            runOnUiThread(() -> {
                try { startActivity(i, anim); if (saved) notionPrefs().edit().putLong("lastOpen", System.currentTimeMillis()).apply(); } // same task: Back returns here
                catch (Exception e) { web.evaluateJavascript("window.notionFail&&notionFail(" + JSONObject.quote("Couldn't open the browser: " + e.getMessage()) + ")", null); }
            });
            return "";
        }

        /** Journey tab: opens a study site (The GATE Grind, GO Classes) in the browser. Only those https hosts are allowed. */
        @JavascriptInterface public String appVersion() { try { return getPackageManager().getPackageInfo(getPackageName(), 0).versionName; } catch (Exception e) { return ""; } }
        @JavascriptInterface public String openLink(String url) {
            Uri u = Uri.parse(url == null ? "" : url.trim());
            String h = u.getHost() == null ? "" : u.getHost().toLowerCase(java.util.Locale.ROOT);
            if (!"https".equals(u.getScheme()) || !(h.equals("github.com") || h.equals("thegategrind.online") || h.endsWith(".thegategrind.online") || h.equals("goclasses.in") || h.endsWith(".goclasses.in"))) return "Link not allowed";
            runOnUiThread(() -> { try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception e) { toast("No browser found"); } });
            return "";
        }

        @JavascriptInterface public boolean hasUsage() {
            AppOpsManager ao = (AppOpsManager) getSystemService(APP_OPS_SERVICE);
            return ao.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), getPackageName()) == AppOpsManager.MODE_ALLOWED;
        }

        @JavascriptInterface public void openUsageSettings() { startActivity(new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)); }

        /**
         * Screen time for [start, end) from foreground events, top apps, and pickups.
         * Excludes the home screen and this app. Pickups = unlocks if the phone has a lock screen, else screen-ons.
         */
        @JavascriptInterface public String usage(double startMs, double endMs) {
            try {
                long start = (long) startMs, end = Math.min((long) endMs, System.currentTimeMillis());
                PackageManager pm = getPackageManager();
                android.content.pm.ResolveInfo home = pm.resolveActivity(new Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME), 0);
                String launcher = home != null ? home.activityInfo.packageName : "";
                UsageEvents ev = ((UsageStatsManager) getSystemService(USAGE_STATS_SERVICE)).queryEvents(start, end);
                Map<String, Long> fg = new HashMap<>(), open = new HashMap<>();
                int unlocks = 0, lockShown = 0, screenOns = 0; UsageEvents.Event e = new UsageEvents.Event();
                while (ev.hasNextEvent()) {
                    ev.getNextEvent(e);
                    String p = e.getPackageName(); int t = e.getEventType();
                    if (t == UsageEvents.Event.KEYGUARD_HIDDEN) unlocks++;
                    else if (t == UsageEvents.Event.KEYGUARD_SHOWN) lockShown++;
                    else if (t == UsageEvents.Event.SCREEN_INTERACTIVE) screenOns++;
                    else if (t == UsageEvents.Event.ACTIVITY_RESUMED) open.put(p, e.getTimeStamp());
                    else if ((t == UsageEvents.Event.ACTIVITY_PAUSED || t == UsageEvents.Event.ACTIVITY_STOPPED) && open.containsKey(p)) {
                        fg.put(p, fg.getOrDefault(p, 0L) + e.getTimeStamp() - open.remove(p));
                    }
                }
                for (Map.Entry<String, Long> o : open.entrySet()) fg.put(o.getKey(), fg.getOrDefault(o.getKey(), 0L) + end - o.getValue());
                fg.remove(launcher); fg.remove(getPackageName());
                long total = 0; JSONArray apps = new JSONArray();
                for (Map.Entry<String, Long> f : fg.entrySet()) {
                    total += f.getValue();
                    String name = f.getKey();
                    try { name = pm.getApplicationLabel(pm.getApplicationInfo(name, 0)).toString(); } catch (Exception ignored) {}
                    apps.put(new JSONObject().put("app", name).put("min", f.getValue() / 60000));
                }
                boolean lock = unlocks + lockShown > 0;
                int pickups = Build.VERSION.SDK_INT < 28 ? -1 : lock ? unlocks : screenOns;
                return new JSONObject().put("min", total / 60000).put("pickups", pickups).put("pickKind", lock ? "unlocks" : "screen-ons").put("apps", apps).toString();
            } catch (Exception ex) { return ""; }
        }
    }
}
