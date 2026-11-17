import com.faiz.alive.BackupPlan;
import java.util.*;

// Checks the backup rotation rules on a PC: run by build.ps1, exits 1 on any failure.
public class BackupSim {
    static int fails = 0;
    static void check(boolean ok, String what) { if (!ok) { fails++; System.out.println("FAIL: " + what); } }

    public static void main(String[] a) {
        List<String> n = new ArrayList<>(); List<Long> s = new ArrayList<>();
        Calendar c = Calendar.getInstance(); c.clear(); c.set(2026, Calendar.NOVEMBER, 18, 21, 40);
        for (int d = 0; d < 400; d++) { // a backup every day for 400 days, three on the newest day
            Calendar x = (Calendar) c.clone(); x.add(Calendar.DAY_OF_MONTH, -d); n.add(BackupPlan.name(x)); s.add(40_000L);
        }
        Calendar e1 = (Calendar) c.clone(); e1.add(Calendar.HOUR_OF_DAY, -3); n.add(BackupPlan.name(e1)); s.add(40_000L);
        Calendar e2 = (Calendar) c.clone(); e2.add(Calendar.HOUR_OF_DAY, -5); n.add(BackupPlan.name(e2)); s.add(40_000L);
        n.add("holiday.jpg"); s.add(5_000_000L); n.add("alive-backup.json"); s.add(1000L); // not ours: never touched

        Set<String> k = BackupPlan.keep(n, s, 10L * 1024 * 1024);
        check(k.contains("alive-2026-11-18_2140.json.gz"), "newest kept");
        check(!k.contains(BackupPlan.name(e1)) && !k.contains(BackupPlan.name(e2)), "older same-day backups dropped");
        check(k.size() <= 17, "at most 7+4+6 files, got " + k.size());
        check(k.size() >= 12, "daily+weekly+monthly spread kept, got " + k.size());
        for (int d = 0; d < 7; d++) { Calendar x = (Calendar) c.clone(); x.add(Calendar.DAY_OF_MONTH, -d); check(k.contains(BackupPlan.name(x)), "last 7 days kept: " + d); }
        check(k.contains("alive-2026-06-30_2140.json.gz") || k.contains("alive-2026-06-01_2140.json.gz") || k.stream().anyMatch(x -> x.startsWith("alive-2026-06")), "a June backup kept (monthly)");
        check(k.stream().noneMatch(x -> x.startsWith("alive-2025-")), "nothing older than 6 months");
        check(!k.contains("holiday.jpg") && !k.contains("alive-backup.json"), "foreign files are never in the plan");

        // Size cap: big files drop oldest first, the newest always survives
        List<Long> big = new ArrayList<>(); for (int i = 0; i < s.size(); i++) big.add(4_000_000L);
        Set<String> kb = BackupPlan.keep(n, big, 10L * 1024 * 1024);
        check(kb.size() == 2 && kb.contains("alive-2026-11-18_2140.json.gz"), "cap keeps the newest 2 of 4 MB files, got " + kb);
        List<Long> huge = new ArrayList<>(); for (int i = 0; i < s.size(); i++) huge.add(50_000_000L);
        check(BackupPlan.keep(n, huge, 10L * 1024 * 1024).equals(Collections.singleton("alive-2026-11-18_2140.json.gz")), "a file over the cap is still kept if it is the newest");
        check(BackupPlan.keep(new ArrayList<>(), new ArrayList<>(), 1).isEmpty(), "empty folder");

        System.out.println(fails == 0 ? "ALL BACKUP ROTATION CHECKS PASSED" : fails + " BACKUP CHECKS FAILED");
        System.exit(fails == 0 ? 0 : 1);
    }
}
