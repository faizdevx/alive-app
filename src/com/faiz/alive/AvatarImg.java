package com.faiz.alive;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.ArrayDeque;

/**
 * Avatar studio pictures. ChatGPT's image comes in through Android's share sheet and is fitted to its slot:
 * scenes 640x360, the portrait and base 512x512, the map sprite 128x128 with its plain background made transparent.
 * Files live in app storage (files/av_<slot>.png) and are served to the page by ImgProvider.
 */
final class AvatarImg {
    static boolean okSlot(String s) { return s != null && s.matches("[a-z0-9]{2,12}"); }
    static File file(Context c, String slot) { return new File(c.getFilesDir(), "av_" + slot + ".png"); }

    static void save(Context c, String slot, byte[] raw) throws Exception {
        BitmapFactory.Options o = new BitmapFactory.Options(); o.inJustDecodeBounds = true;
        BitmapFactory.decodeByteArray(raw, 0, raw.length, o);
        o.inSampleSize = 1; while (Math.max(o.outWidth, o.outHeight) / o.inSampleSize > 2048) o.inSampleSize *= 2;
        o.inJustDecodeBounds = false;
        Bitmap b = BitmapFactory.decodeByteArray(raw, 0, raw.length, o);
        if (b == null) throw new Exception("not an image");
        boolean scene = !slot.equals("base") && !slot.equals("portrait") && !slot.equals("hero");
        int w = scene ? 640 : slot.equals("hero") ? 128 : 512, h = scene ? 360 : w;
        Bitmap out = fit(b, w, h);
        if (slot.equals("hero")) out = clearBackground(out);
        File f = file(c, slot), tmp = new File(f.getPath() + ".tmp");
        try (OutputStream s = new FileOutputStream(tmp)) { out.compress(Bitmap.CompressFormat.PNG, 100, s); }
        if (!tmp.renameTo(f)) { f.delete(); if (!tmp.renameTo(f)) throw new Exception("couldn't save"); }
    }

    // Centre crop to the slot's shape, then scale. Pixel art is scaled without smoothing so it stays crisp.
    static Bitmap fit(Bitmap b, int w, int h) {
        float k = Math.max((float) w / b.getWidth(), (float) h / b.getHeight());
        int cw = Math.round(w / k), ch = Math.round(h / k), x = (b.getWidth() - cw) / 2, y = (b.getHeight() - ch) / 2;
        Bitmap c = Bitmap.createBitmap(b, Math.max(0, x), Math.max(0, y), Math.min(cw, b.getWidth()), Math.min(ch, b.getHeight()));
        return Bitmap.createScaledBitmap(c, w, h, false);
    }

    // Flood-fills from the border every pixel close to the corner colour, so the sprite stands on the map without a box.
    static Bitmap clearBackground(Bitmap src) {
        Bitmap b = src.copy(Bitmap.Config.ARGB_8888, true); int w = b.getWidth(), h = b.getHeight(), bg = b.getPixel(0, 0);
        if (Color.alpha(bg) < 128) return b; // already transparent
        boolean[] seen = new boolean[w * h]; ArrayDeque<Integer> q = new ArrayDeque<>();
        for (int x = 0; x < w; x++) { q.add(x); q.add((h - 1) * w + x); }
        for (int y = 0; y < h; y++) { q.add(y * w); q.add(y * w + w - 1); }
        while (!q.isEmpty()) {
            int i = q.poll(); if (seen[i]) continue; seen[i] = true;
            int x = i % w, y = i / w, p = b.getPixel(x, y);
            if (Math.abs(Color.red(p) - Color.red(bg)) + Math.abs(Color.green(p) - Color.green(bg)) + Math.abs(Color.blue(p) - Color.blue(bg)) > 60) continue;
            b.setPixel(x, y, Color.TRANSPARENT);
            if (x > 0) q.add(i - 1); if (x < w - 1) q.add(i + 1); if (y > 0) q.add(i - w); if (y < h - 1) q.add(i + w);
        }
        return b;
    }
}
