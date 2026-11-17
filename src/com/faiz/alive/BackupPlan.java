package com.faiz.alive;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.TimeZone;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Which backup files to keep. Plain Java (no Android) so tools/BackupSim.java can test it on a PC. */
public final class BackupPlan {
    static final int DAILY = 7, WEEKLY = 4, MONTHLY = 6;
    static final long CAP = 10L * 1024 * 1024;
    static final Pattern NAME = Pattern.compile("alive-(\\d{4})-(\\d{2})-(\\d{2})_(\\d{4})\\.json\\.gz");

    public static boolean ours(String name) { return NAME.matcher(name).matches(); }

    public static String name(Calendar c) {
        return String.format(java.util.Locale.US, "alive-%04d-%02d-%02d_%02d%02d.json.gz", c.get(Calendar.YEAR), c.get(Calendar.MONTH) + 1,
                c.get(Calendar.DAY_OF_MONTH), c.get(Calendar.HOUR_OF_DAY), c.get(Calendar.MINUTE));
    }

    // Days since 1970 for the file's date (weeks are counted from that, months from the yyyy-mm text).
    static long epochDay(String name) {
        Matcher m = NAME.matcher(name); if (!m.matches()) return 0;
        Calendar c = Calendar.getInstance(TimeZone.getTimeZone("UTC")); c.clear();
        c.set(Integer.parseInt(m.group(1)), Integer.parseInt(m.group(2)) - 1, Integer.parseInt(m.group(3)));
        return c.getTimeInMillis() / 86400000L;
    }

    /**
     * names[i] has size sizes[i]. Returns the names to keep: the newest file always, the newest file of each of the
     * last 7 days, 4 weeks and 6 months that have backups, then the oldest kept files dropped until the total fits the cap.
     */
    public static Set<String> keep(List<String> names, List<Long> sizes, long cap) {
        List<Integer> idx = new ArrayList<>();
        for (int i = 0; i < names.size(); i++) if (ours(names.get(i))) idx.add(i);
        Collections.sort(idx, (a, b) -> names.get(b).compareTo(names.get(a))); // name sorts by time: newest first
        List<Integer> kept = new ArrayList<>();
        Set<String> days = new HashSet<>(), weeks = new HashSet<>(), months = new HashSet<>();
        for (int i : idx) {
            String n = names.get(i); long d = epochDay(n);
            String day = n.substring(6, 16), week = "w" + Math.floorDiv(d + 3, 7), month = n.substring(6, 13); // 1970-01-01 was a Thursday: +3 starts weeks on Monday
            boolean k = kept.isEmpty();
            if (!days.contains(day) && days.size() < DAILY) { days.add(day); k = true; }
            if (!weeks.contains(week) && weeks.size() < WEEKLY) { weeks.add(week); k = true; }
            if (!months.contains(month) && months.size() < MONTHLY) { months.add(month); k = true; }
            if (k) kept.add(i);
        }
        long total = 0; for (int i : kept) total += sizes.get(i);
        while (total > cap && kept.size() > 1) total -= sizes.get(kept.remove(kept.size() - 1)); // never drop the newest
        Set<String> out = new HashSet<>(); for (int i : kept) out.add(names.get(i));
        return out;
    }
}
