package com.faiz.alive;

import android.content.ContentResolver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.UriPermission;
import android.database.Cursor;
import android.net.Uri;
import android.provider.DocumentsContract;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Set;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Automatic backups into a folder the user picked (Storage Access Framework: no storage permission, files survive
 * an uninstall). One gzip file per backup: {"meta":{...,"sha256":...},"data":<whole app data>}.
 * A file is written as .tmp, read back and compared, and only then renamed; old files are pruned by BackupPlan.
 */
final class AutoBackup {
    static SharedPreferences prefs(Context c) { return c.getSharedPreferences("backup", Context.MODE_PRIVATE); }

    static Uri tree(Context c) {
        String s = prefs(c).getString("tree", null); if (s == null) return null;
        Uri t = Uri.parse(s);
        for (UriPermission p : c.getContentResolver().getPersistedUriPermissions()) if (p.getUri().equals(t) && p.isWritePermission()) return t;
        return null; // folder deleted or access revoked: back to "off"
    }

    static void setTree(Context c, Uri t) {
        c.getContentResolver().takePersistableUriPermission(t, Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
        String old = prefs(c).getString("tree", null);
        if (old != null && !old.equals(t.toString())) try { c.getContentResolver().releasePersistableUriPermission(Uri.parse(old), Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION); } catch (Exception ignored) {}
        prefs(c).edit().putString("tree", t.toString()).remove("err").remove("sha").apply(); // new folder: next backup always writes
    }

    static Uri dir(Uri tree) { return DocumentsContract.buildDocumentUriUsingTree(tree, DocumentsContract.getTreeDocumentId(tree)); }

    static final class Doc { String id, name; long size; Doc(String i, String n, long s) { id = i; name = n; size = s; } }

    static List<Doc> list(Context c, Uri tree) {
        List<Doc> out = new ArrayList<>();
        Uri kids = DocumentsContract.buildChildDocumentsUriUsingTree(tree, DocumentsContract.getTreeDocumentId(tree));
        try (Cursor q = c.getContentResolver().query(kids, new String[]{DocumentsContract.Document.COLUMN_DOCUMENT_ID, DocumentsContract.Document.COLUMN_DISPLAY_NAME, DocumentsContract.Document.COLUMN_SIZE}, null, null, null)) {
            while (q != null && q.moveToNext()) out.add(new Doc(q.getString(0), q.getString(1), q.isNull(2) ? 0 : q.getLong(2)));
        }
        return out;
    }

    static String sha(String s) throws Exception {
        byte[] h = MessageDigest.getInstance("SHA-256").digest(s.getBytes("UTF-8")); StringBuilder b = new StringBuilder();
        for (byte x : h) b.append(String.format("%02x", x)); return b.toString();
    }
    static byte[] gzip(String s) throws Exception {
        ByteArrayOutputStream b = new ByteArrayOutputStream(); try (GZIPOutputStream z = new GZIPOutputStream(b)) { z.write(s.getBytes("UTF-8")); } return b.toByteArray();
    }
    static String gunzip(byte[] x) throws Exception { try (InputStream in = new GZIPInputStream(new ByteArrayInputStream(x))) { return new String(MainActivity.readAll(in), "UTF-8"); } }
    static boolean isGzip(byte[] x) { return x.length > 2 && (x[0] & 0xff) == 0x1f && (x[1] & 0xff) == 0x8b; }

    /**
     * Writes a backup unless the data equals the last one written (force skips that check). Returns "" when the
     * folder holds a current backup, "off" when no folder is set, or the error text.
     */
    static synchronized String run(Context c, String metaJson, String data, boolean force, String version) {
        Uri tree = tree(c); if (tree == null) return "off";
        SharedPreferences p = prefs(c); ContentResolver cr = c.getContentResolver(); Uri tmp = null;
        try {
            String h = sha(data); List<Doc> docs = list(c, tree);
            boolean have = false; for (Doc d : docs) if (d.name.equals(p.getString("name", ""))) have = true;
            if (!force && have && h.equals(p.getString("sha", ""))) { p.edit().putLong("ok", System.currentTimeMillis()).remove("err").apply(); return ""; }
            JSONObject meta = new JSONObject(metaJson); meta.put("sha256", h); meta.put("appVersion", version);
            String notion = c.getSharedPreferences("notion", Context.MODE_PRIVATE).getString("url", null);
            JSONObject pr = new JSONObject(); if (notion != null) pr.put("notionUrl", notion); meta.put("prefs", pr);
            String env = "{\"meta\":" + meta.toString() + ",\"data\":" + data + "}";
            byte[] gz = gzip(env); String name = BackupPlan.name(Calendar.getInstance());
            tmp = DocumentsContract.createDocument(cr, dir(tree), "application/octet-stream", name + ".tmp");
            if (tmp == null) throw new Exception("couldn't create a file in the folder");
            try (OutputStream o = cr.openOutputStream(tmp, "w")) { o.write(gz); }
            byte[] back; try (InputStream in = cr.openInputStream(tmp)) { back = MainActivity.readAll(in); }
            if (!java.util.Arrays.equals(back, gz) || !gunzip(back).equals(env)) throw new Exception("file didn't read back the same");
            for (Doc d : docs) if (d.name.equals(name)) DocumentsContract.deleteDocument(cr, DocumentsContract.buildDocumentUriUsingTree(tree, d.id)); // same minute: replace
            Uri fin = DocumentsContract.renameDocument(cr, tmp, name); if (fin != null) tmp = fin;
            boolean named = false; for (Doc d : list(c, tree)) if (d.name.equals(name)) named = true; // some providers return null even on success
            if (!named) throw new Exception("couldn't rename the backup file");
            tmp = null;
            prune(c, tree);
            p.edit().putString("sha", h).putString("name", name).putLong("last", System.currentTimeMillis()).putLong("ok", System.currentTimeMillis()).remove("err").apply();
            return "";
        } catch (Exception e) {
            if (tmp != null) try { DocumentsContract.deleteDocument(cr, tmp); } catch (Exception ignored) {}
            String m = e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage();
            p.edit().putString("err", m).apply(); return m;
        }
    }

    // Deletes our files that fall outside the keep plan, and our own leftover .tmp files. Never touches anything else.
    static void prune(Context c, Uri tree) throws Exception {
        List<Doc> docs = list(c, tree); List<String> n = new ArrayList<>(); List<Long> s = new ArrayList<>();
        for (Doc d : docs) { n.add(d.name); s.add(d.size); }
        Set<String> keep = BackupPlan.keep(n, s, BackupPlan.CAP);
        for (Doc d : docs) {
            boolean ourTmp = d.name.endsWith(".tmp") && BackupPlan.ours(d.name.substring(0, d.name.length() - 4));
            if ((BackupPlan.ours(d.name) && !keep.contains(d.name)) || ourTmp)
                DocumentsContract.deleteDocument(c.getContentResolver(), DocumentsContract.buildDocumentUriUsingTree(tree, d.id));
        }
    }

    /** {tree, folder, last, ok, err, files, bytes} for the Backup panel and the Home warning. */
    static String state(Context c) {
        try {
            JSONObject o = new JSONObject(); Uri tree = tree(c); SharedPreferences p = prefs(c);
            o.put("tree", tree != null); o.put("last", p.getLong("last", 0)); o.put("ok", p.getLong("ok", 0)); o.put("err", p.getString("err", ""));
            if (tree != null) {
                String id = DocumentsContract.getTreeDocumentId(tree); o.put("folder", id.contains(":") ? id.substring(id.indexOf(':') + 1) : id);
                int n = 0; long b = 0; for (Doc d : list(c, tree)) if (BackupPlan.ours(d.name)) { n++; b += d.size; }
                o.put("files", n); o.put("bytes", b);
            }
            return o.toString();
        } catch (Exception e) { return "{\"tree\":false,\"err\":" + JSONObject.quote(String.valueOf(e.getMessage())) + "}"; }
    }

    /** Our backups, newest first: [{name, size, meta}]. meta is null when a file can't be read. */
    static String files(Context c) {
        JSONArray a = new JSONArray(); Uri tree = tree(c); if (tree == null) return "[]";
        try {
            List<Doc> docs = list(c, tree); java.util.Collections.sort(docs, (x, y) -> y.name.compareTo(x.name));
            for (Doc d : docs) {
                if (!BackupPlan.ours(d.name)) continue;
                JSONObject o = new JSONObject(); o.put("name", d.name); o.put("size", d.size);
                try { String env = gunzip(readDoc(c, tree, d)); o.put("meta", new JSONObject(env.substring(8, env.indexOf(",\"data\":")))); } catch (Exception e) { o.put("meta", JSONObject.NULL); }
                a.put(o);
            }
        } catch (Exception e) { return "[]"; }
        return a.toString();
    }

    static byte[] readDoc(Context c, Uri tree, Doc d) throws Exception {
        try (InputStream in = c.getContentResolver().openInputStream(DocumentsContract.buildDocumentUriUsingTree(tree, d.id))) { return MainActivity.readAll(in); }
    }

    /** {text} = the whole verified backup, or {err}. The checksum must match: a damaged file is never restored. */
    static String read(Context c, String name) {
        try {
            Uri tree = tree(c); if (tree == null) return err("No backup folder");
            for (Doc d : list(c, tree)) if (d.name.equals(name)) {
                String env = gunzip(readDoc(c, tree, d)), bad = verify(env);
                return bad != null ? err(bad) : new JSONObject().put("text", env).toString();
            }
            return err("File not found");
        } catch (Exception e) { return err("Can't read it: " + e.getMessage()); }
    }

    /** null if the envelope's data matches its checksum; the problem otherwise. Plain (old) backups have no envelope. */
    static String verify(String env) throws Exception {
        if (!env.startsWith("{\"meta\":")) return null;
        int i = env.indexOf(",\"data\":"); if (i < 0) return "Backup file is incomplete";
        JSONObject meta = new JSONObject(env.substring(8, i));
        return sha(env.substring(i + 8, env.length() - 1)).equals(meta.optString("sha256")) ? null : "Backup file is damaged (checksum doesn't match)";
    }

    static String err(String m) { try { return new JSONObject().put("err", m).toString(); } catch (Exception e) { return "{}"; } }
}
