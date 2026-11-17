import com.faiz.alive.StepDay;

/** Simulates real-life step-counter timelines against StepDay. Run: tools\stepsim.ps1 */
public class StepSim {
    static int fails = 0;
    static void check(String name, float got, float want) {
        boolean ok = Math.round(got) == Math.round(want);
        if (!ok) fails++;
        System.out.println((ok ? "PASS " : "FAIL ") + name + ": got " + Math.round(got) + ", want " + Math.round(want));
    }

    public static void main(String[] a) {
        String D1 = "2026-11-07", D2 = "2026-11-08";

        // 1. Normal day: midnight alarm, walk, app opened in evening.
        StepDay s = new StepDay();
        s.midnight(D1, 10000, 0); s.reading(D1, 10500, 1); s.reading(D1, 17200, 2);
        check("normal day", s.steps(), 7200);
        check("normal day not partial", s.partial ? 1 : 0, 0);

        // 2. Walking before first app open is counted (baseline came from midnight alarm).
        s = new StepDay(); s.midnight(D1, 20000, 0); s.reading(D1, 24000, 1);
        check("steps before first open", s.steps(), 4000);

        // 3. Midnight rollover closes yesterday at its full count, even if the app was last opened at 6pm.
        s = new StepDay(); s.midnight(D1, 0, 0); s.reading(D1, 6000, 1); /* 6pm */ s.reading(D1, 6500, 2); /* hourly checkpoint 11pm */
        s.midnight(D2, 7000, 3); /* 00:00 alarm: 500 more walked before midnight */
        check("yesterday final", s.prevSteps, 7000);
        check("new day starts at 0", s.steps(), 0);
        s.reading(D2, 9000, 4);
        check("new day steps", s.steps(), 2000);

        // 4. Reboot mid-day with shutdown read: nothing lost.
        s = new StepDay(); s.midnight(D1, 5000, 0); s.reading(D1, 8000, 1);
        s.reading(D1, 8300, 2);   // ACTION_SHUTDOWN read
        s.boot(D1, 3);            // counter -> 0
        s.reading(D1, 1200, 4);   // walked 1200 after boot
        check("reboot with shutdown read", s.steps(), 3000 + 300 + 1200);

        // 5. Reboot without shutdown broadcast (battery died): loses only steps since last checkpoint.
        s = new StepDay(); s.midnight(D1, 5000, 0); s.reading(D1, 8000, 1); /* checkpoint */
        /* walked 400 more, battery died */ s.boot(D1, 2); s.reading(D1, 100, 3);
        check("reboot, no shutdown read (400 lost)", s.steps(), 3000 + 100);

        // 6. Reboot not seen at all (no BOOT_COMPLETED yet), next reading lower than last.
        s = new StepDay(); s.midnight(D1, 5000, 0); s.reading(D1, 9000, 1); s.reading(D1, 50, 2);
        check("unseen reboot", s.steps(), 4000 + 50);

        // 7. Midnight alarm missed entirely (phone off at midnight): new day marked partial.
        s = new StepDay(); s.midnight(D1, 0, 0); s.reading(D1, 3000, 1);
        s.reading(D2, 4000, 2);
        check("missed midnight: yesterday closed at last known", s.prevSteps, 3000);
        check("missed midnight: today partial", s.partial ? 1 : 0, 1);
        s.reading(D2, 4500, 3);
        check("missed midnight: counts from first reading", s.steps(), 500);

        // 8. App opened just after midnight before alarm ran; late alarm must not reset the day.
        s = new StepDay(); s.midnight(D1, 0, 0); s.reading(D1, 2000, 1);
        s.reading(D2, 2100, 2); s.reading(D2, 2300, 3);
        s.midnight(D2, 2400, 4); // alarm arrives late
        check("late alarm keeps today's count", s.steps(), 300);

        // 9. Phone booted on a new day (was off over midnight).
        s = new StepDay(); s.midnight(D1, 0, 0); s.reading(D1, 5000, 1);
        s.boot(D2, 2); s.reading(D2, 800, 3);
        check("boot on new day: yesterday kept", s.prevSteps, 5000);
        check("boot on new day: today", s.steps(), 800);

        // 10. Two reboots in one day.
        s = new StepDay(); s.midnight(D1, 1000, 0); s.reading(D1, 2000, 1); s.boot(D1, 2);
        s.reading(D1, 500, 3); s.boot(D1, 4); s.reading(D1, 700, 5);
        check("two reboots", s.steps(), 1000 + 500 + 700);

        System.out.println(fails == 0 ? "ALL STEP SIMULATIONS PASSED" : fails + " FAILED");
        System.exit(fails == 0 ? 0 : 1);
    }
}
