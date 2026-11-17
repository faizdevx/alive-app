package com.faiz.alive;

import android.accessibilityservice.AccessibilityService;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.util.Log;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.json.JSONObject;

/**
 * Drives the ChatGPT app for one job at a time: puts the prompt in the message box, presses Send,
 * waits until the answer stops streaming, reads the JSON reply and brings ALIVE? back with it.
 * Only receives events from com.openai.chatgpt (see res/xml/gpt_service.xml) and does nothing without a job.
 */
public class GptDriver extends AccessibilityService {
    static final String GPT = "com.openai.chatgpt", MARK = "Reply with ONLY this JSON", TAG = "ALIVE";
    static volatile GptDriver live;
    static volatile Job job;

    static class Job { String kind, prompt; long start, sentAt; int stage; String last; int stable; }

    final Handler h = new Handler(Looper.getMainLooper());
    final Runnable tick = this::step;

    @Override protected void onServiceConnected() { live = this; Log.i(TAG, "GptDriver connected"); }
    @Override public void onDestroy() { live = null; super.onDestroy(); }
    @Override public void onInterrupt() {}
    @Override public void onAccessibilityEvent(AccessibilityEvent e) { if (job != null) { h.removeCallbacks(tick); h.postDelayed(tick, 250); } }

    static boolean enabled(Context c) {
        String s = Settings.Secure.getString(c.getContentResolver(), Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
        if (s == null) return false;
        android.content.ComponentName me = new android.content.ComponentName(c, GptDriver.class); // exact entry: a renamed class leaves a stale one behind
        for (String x : s.split(":")) if (x.equals(me.flattenToString()) || x.equals(me.flattenToShortString())) return true;
        return false;
    }

    static void start(String kind, String prompt) {
        Job j = new Job(); j.kind = kind; j.prompt = prompt; j.start = System.currentTimeMillis(); job = j;
        GptDriver d = live; if (d != null) { d.h.removeCallbacks(d.tick); d.h.postDelayed(d.tick, 1500); }
    }

    void step() {
        Job j = job; if (j == null) return;
        long now = System.currentTimeMillis();
        if (now - j.start > 180_000) { finish(j, null, "ChatGPT took too long. Copy the answer and tap Paste answer."); return; }
        h.removeCallbacks(tick); h.postDelayed(tick, 1000); // keep polling: streaming text doesn't always send events
        AccessibilityNodeInfo root = getRootInActiveWindow();
        if (root == null || root.getPackageName() == null || !GPT.contentEquals(root.getPackageName())) return;
        List<AccessibilityNodeInfo> all = new ArrayList<>(); collect(root, all, 0);

        if (j.stage == 0) { // fill + send
            AccessibilityNodeInfo input = null;
            for (AccessibilityNodeInfo n : all) if (n.isEditable()) input = n; // last editable = message box
            if (input == null) { if (now - j.start > 25_000) finish(j, null, "Couldn't find ChatGPT's message box. Is ChatGPT logged in?"); return; }
            CharSequence t = input.getText();
            boolean hint = Build.VERSION.SDK_INT >= 26 && input.isShowingHintText();
            if (hint || t == null || !t.toString().contains(MARK)) {
                Bundle b = new Bundle(); b.putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, j.prompt);
                input.performAction(AccessibilityNodeInfo.ACTION_FOCUS);
                input.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, b);
                Log.i(TAG, "prompt typed");
                return;
            }
            AccessibilityNodeInfo send = byDesc(all, "send");
            if (send != null && send.isEnabled()) { click(send); j.stage = 1; j.sentAt = now; Log.i(TAG, "sent"); }
            return; // send disabled = photo still uploading; try again next tick
        }

        if (now - j.sentAt < 3000) return;
        if (byDesc(all, "stop") != null) { j.stable = 0; return; } // still generating
        String ans = extract(all);
        if (ans == null) return;
        if (ans.equals(j.last)) { if (++j.stable >= 2) finish(j, ans, null); } else { j.last = ans; j.stable = 0; } // unchanged for 2 s = done
    }

    static void collect(AccessibilityNodeInfo n, List<AccessibilityNodeInfo> out, int depth) {
        if (n == null || depth > 60) return;
        out.add(n);
        for (int i = 0; i < n.getChildCount(); i++) collect(n.getChild(i), out, depth + 1);
    }

    static AccessibilityNodeInfo byDesc(List<AccessibilityNodeInfo> all, String word) {
        for (AccessibilityNodeInfo n : all) {
            CharSequence d = n.getContentDescription();
            if (d != null && d.length() < 40 && d.toString().toLowerCase(Locale.ROOT).contains(word)) return n;
        }
        return null;
    }

    static void click(AccessibilityNodeInfo n) {
        while (n != null && !n.isClickable()) n = n.getParent();
        if (n != null) n.performAction(AccessibilityNodeInfo.ACTION_CLICK);
    }

    /** Latest valid JSON answer on screen. Our own prompt (and its blank template) is ignored. */
    static String extract(List<AccessibilityNodeInfo> all) {
        String best = null; StringBuilder after = new StringBuilder();
        for (AccessibilityNodeInfo n : all) {
            CharSequence c = n.getText(); if (c == null) continue;
            String t = c.toString();
            if (t.contains(MARK)) { after.setLength(0); continue; }
            after.append(t).append('\n');
            String j = json(t); if (j != null) best = j;
        }
        return best != null ? best : json(after.toString()); // answer split across several text nodes
    }

    static String json(String t) {
        int a = t.indexOf('{'), b = t.lastIndexOf('}'); if (a < 0 || b <= a) return null;
        try {
            JSONObject o = new JSONObject(t.substring(a, b + 1).replace('“', '"').replace('”', '"').replaceAll(",\\s*([}\\]])", "$1"));
            boolean meal = o.has("kcal") && !"short meal name".equals(o.optString("name"));
            boolean workout = o.has("duration_min") && !"short title".equals(o.optString("title"));
            return meal || workout ? o.toString() : null;
        } catch (Exception e) { return null; }
    }

    void finish(Job j, String ans, String err) {
        if (job != j) return; job = null; h.removeCallbacks(tick);
        try {
            JSONObject r = new JSONObject().put("kind", j.kind).put("at", System.currentTimeMillis());
            if (ans != null) r.put("text", ans); else r.put("error", err);
            getSharedPreferences("gpt", MODE_PRIVATE).edit().putString("result", r.toString()).commit();
        } catch (Exception ignored) {}
        Log.i(TAG, "finish " + (err == null ? "ok" : err));
        Intent i = getPackageManager().getLaunchIntentForPackage(getPackageName());
        if (i != null) startActivity(i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)); // brings the existing ALIVE? task to front
    }
}
