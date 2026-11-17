package com.faiz.alive;

import java.net.URI;
import java.util.Locale;

/** My Cockpit → Notion link checks. No Android imports, so tools/NotionSim.java can run them on a PC during the build. */
public final class NotionLink {
    public static final String DEFAULT = NotionDefault.URL; // per edition: editions/<name>/src

    /** null if url is an https Notion link we may open, else a short reason to show the user. */
    public static String problem(String url) {
        if (url == null || url.trim().isEmpty()) return "Paste a Notion link first.";
        url = url.trim();
        if (url.length() > 2048) return "That link is too long.";
        for (int i = 0; i < url.length(); i++) { char c = url.charAt(i); if (c <= ' ' || c == 0x7f || c == '\\') return "That link has spaces or odd characters in it."; }
        URI u;
        try { u = new URI(url); } catch (Exception e) { return "That isn't a valid link."; }
        if (!"https".equalsIgnoreCase(u.getScheme())) return "The link must start with https://";
        if (u.getRawUserInfo() != null || (u.getPort() != -1 && u.getPort() != 443)) return "That isn't a normal Notion link.";
        if (!hostOk(u.getHost())) return "Only notion.so, notion.com or notion.site links are allowed.";
        return null;
    }

    public static boolean hostOk(String host) {
        if (host == null) return false;
        String h = host.toLowerCase(Locale.ROOT);
        return is(h, "notion.so") || is(h, "notion.com") || is(h, "notion.site");
    }

    static boolean is(String h, String dom) { return h.equals(dom) || h.endsWith("." + dom); }
}
