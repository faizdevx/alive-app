package com.faiz.alive;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.provider.OpenableColumns;
import java.io.File;
import java.io.FileNotFoundException;

/** Serves the temp meal photo (camera writes, ChatGPT reads), the backup file and the Avatar studio pictures (read-only). Nothing else is reachable. */
public class ImgProvider extends ContentProvider {
    static String AUTH = "com.faiz.alive.img"; // set from the real package in onCreate: an edition may use its own app id
    static Uri uri(String name) { return Uri.parse("content://" + AUTH + "/" + name); }

    static File file(Context c, String name) { return new File(c.getCacheDir(), name); }

    static String name(Uri u) throws FileNotFoundException {
        String n = u.getLastPathSegment();
        if (!"meal.jpg".equals(n) && !"alive-backup.json".equals(n) && !isAv(n)) throw new FileNotFoundException(n);
        return n;
    }
    static boolean isAv(String n) { return n != null && n.startsWith("av_") && n.endsWith(".png") && AvatarImg.okSlot(n.substring(3, n.length() - 4)); }
    static File fileFor(Context c, String n) { return isAv(n) ? AvatarImg.file(c, n.substring(3, n.length() - 4)) : file(c, n); }

    @Override public boolean onCreate() { AUTH = getContext().getPackageName() + ".img"; return true; }

    @Override public ParcelFileDescriptor openFile(Uri uri, String mode) throws FileNotFoundException {
        String n = name(uri);
        int m = mode.contains("w") && !isAv(n) ? ParcelFileDescriptor.MODE_READ_WRITE | ParcelFileDescriptor.MODE_CREATE | ParcelFileDescriptor.MODE_TRUNCATE
                : ParcelFileDescriptor.MODE_READ_ONLY;
        return ParcelFileDescriptor.open(fileFor(getContext(), n), m);
    }

    @Override public String getType(Uri uri) { return String.valueOf(uri.getLastPathSegment()).endsWith(".json") ? "application/json" : String.valueOf(uri.getLastPathSegment()).endsWith(".png") ? "image/png" : "image/jpeg"; }

    @Override public Cursor query(Uri uri, String[] p, String s, String[] a, String o) {
        MatrixCursor c = new MatrixCursor(new String[]{OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE});
        try { String n = name(uri); c.addRow(new Object[]{n, fileFor(getContext(), n).length()}); } catch (FileNotFoundException ignored) {}
        return c;
    }

    @Override public Uri insert(Uri uri, ContentValues v) { return null; }
    @Override public int delete(Uri uri, String s, String[] a) { return 0; }
    @Override public int update(Uri uri, ContentValues v, String s, String[] a) { return 0; }
}
