package com.faiz.alive;

/**
 * Pure step-day bookkeeping (no Android types, so tools/StepSim.java can drive it on a PC).
 * The phone's counter is cumulative since boot. Today = offset (steps from earlier boots today) + (raw - base).
 */
public class StepDay {
    public String date = "";      // day being counted
    public float base = -1;       // counter value that counts as 0 in the current boot
    public float offset = 0;      // steps from earlier boots today
    public float last = -1;       // latest raw reading seen
    public long since = 0;        // when counting for this day started (ms)
    public boolean partial = true;// true if counting did not start at midnight
    public String prevDate = "";  // the day before, closed at its final known count
    public float prevSteps = -1;

    public int steps() { return base < 0 ? 0 : Math.round(offset + Math.max(0, last - base)); }

    void closeDay() { if (base >= 0 && !date.isEmpty()) { prevDate = date; prevSteps = steps(); } }

    /** Exact midnight alarm: everything up to raw belongs to yesterday, today starts at raw. */
    public void midnight(String today, float raw, long now) {
        if (date.equals(today)) { reading(today, raw, now); return; } // already rolled over (e.g. app opened at 00:00:10)
        if (base >= 0 && raw >= base) last = raw;                       // credit yesterday up to midnight
        closeDay();
        start(today, raw, now, false);
    }

    /** Any normal reading (app open, hourly checkpoint, shutdown). */
    public void reading(String today, float raw, long now) {
        if (raw < 0) return;
        if (!date.equals(today)) {          // missed midnight: steps since the last reading can't be split, so today starts now
            closeDay();
            start(today, raw, now, true);
            return;
        }
        if (raw < last) { offset += Math.max(0, last - base); base = 0; } // counter reset = reboot we didn't see
        last = raw;
    }

    /** BOOT_COMPLETED: counter restarted at 0. Steps before the reboot are kept in offset. */
    public void boot(String today, long now) {
        if (date.equals(today)) { offset += Math.max(0, last - base); base = 0; last = 0; }
        else { closeDay(); start(today, 0, now, true); }
    }

    void start(String today, float raw, long now, boolean part) { date = today; base = raw; last = raw; offset = 0; since = now; partial = part; }

    public String json() {
        return "{\"date\":\"" + date + "\",\"steps\":" + steps() + ",\"partial\":" + partial + ",\"since\":" + since
                + ",\"prevDate\":\"" + prevDate + "\",\"prevSteps\":" + Math.round(prevSteps) + "}";
    }
}
