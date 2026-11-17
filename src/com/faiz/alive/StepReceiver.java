package com.faiz.alive;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

/**
 * Keeps today's step count correct without the app open:
 * exact alarm at midnight (day boundary), hourly checkpoints, and reads at shutdown / boot so reboots lose little.
 */
public class StepReceiver extends BroadcastReceiver {
    static final String TAG = "ALIVE", MIDNIGHT = "com.faiz.alive.MIDNIGHT", CHECKPOINT = "com.faiz.alive.CHECKPOINT";

    static String ymd(long t) { return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date(t)); }

    // ---- persistence of StepDay ----
    static synchronized StepDay load(Context c) {
        SharedPreferences p = c.getSharedPreferences("steps", Context.MODE_PRIVATE); StepDay s = new StepDay();
        s.date = p.getString("date", ""); s.base = p.getFloat("base", -1); s.offset = p.getFloat("offset", 0); s.last = p.getFloat("last", -1);
        s.since = p.getLong("since", 0); s.partial = p.getBoolean("partial", true); s.prevDate = p.getString("prevDate", ""); s.prevSteps = p.getFloat("prevSteps", -1);
        return s;
    }
    static synchronized void save(Context c, StepDay s) {
        c.getSharedPreferences("steps", Context.MODE_PRIVATE).edit().putString("date", s.date).putFloat("base", s.base).putFloat("offset", s.offset)
                .putFloat("last", s.last).putLong("since", s.since).putBoolean("partial", s.partial).putString("prevDate", s.prevDate).putFloat("prevSteps", s.prevSteps).commit();
    }
    static synchronized void reading(Context c, float raw) { StepDay s = load(c); s.reading(ymd(System.currentTimeMillis()), raw, System.currentTimeMillis()); save(c, s); }

    // ---- alarms ----
    static PendingIntent pi(Context c, String action, int code) {
        return PendingIntent.getBroadcast(c, code, new Intent(c, StepReceiver.class).setAction(action), PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }
    static void schedule(Context c) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        Calendar t = Calendar.getInstance();
        t.set(Calendar.HOUR_OF_DAY, 0); t.set(Calendar.MINUTE, 0); t.set(Calendar.SECOND, 2); t.set(Calendar.MILLISECOND, 0);
        if (t.getTimeInMillis() <= System.currentTimeMillis()) t.add(Calendar.DAY_OF_YEAR, 1); // next 00:00:02 still ahead (rescheduling at 00:00:01 must not skip tonight)
        boolean exact = Build.VERSION.SDK_INT < 31 || am.canScheduleExactAlarms();
        if (exact) am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, t.getTimeInMillis(), pi(c, MIDNIGHT, 0));
        else am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, t.getTimeInMillis(), pi(c, MIDNIGHT, 0)); // may be late; StepDay then marks the day partial
        am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, System.currentTimeMillis() + 3600_000L, pi(c, CHECKPOINT, 1));
        Log.i(TAG, "scheduled midnight=" + t.getTime() + " exact=" + exact);
    }

    @Override public void onReceive(Context c, Intent intent) {
        Context app = c.getApplicationContext();
        String a = String.valueOf(intent.getAction());
        long now = System.currentTimeMillis(); String today = ymd(now);
        Log.i(TAG, "receive " + a + " " + today);
        if (!a.equals(Intent.ACTION_SHUTDOWN)) schedule(app);
        if (a.equals(Intent.ACTION_BOOT_COMPLETED)) {
            synchronized (StepReceiver.class) { StepDay s = load(app); s.boot(today, now); save(app, s); Log.i(TAG, "boot -> " + s.json()); }
            return;
        }
        SensorManager sm = (SensorManager) app.getSystemService(Context.SENSOR_SERVICE);
        Sensor sensor = sm.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
        if (sensor == null) { Log.i(TAG, "no step sensor"); return; }
        Reader r = new Reader(app, sm, a, today, now, goAsync());
        Handler h = new Handler(Looper.getMainLooper());
        try { sm.registerListener(r, sensor, SensorManager.SENSOR_DELAY_FASTEST, h); }
        catch (SecurityException e) { r.finish(-1); return; } // permission not granted
        h.postDelayed(() -> r.finish(-1), a.equals(Intent.ACTION_SHUTDOWN) ? 3000 : 8000); // broadcasts must end within ~10 s
    }

    static class Reader implements SensorEventListener {
        final Context app; final SensorManager sm; final String action, day; final long now; final PendingResult pr; boolean done;
        Reader(Context a, SensorManager s, String ac, String d, long n, PendingResult p) { app = a; sm = s; action = ac; day = d; now = n; pr = p; }
        public void onSensorChanged(SensorEvent e) { finish(e.values[0]); }
        public void onAccuracyChanged(Sensor x, int a) {}
        void finish(float raw) {
            if (done) return; done = true;
            sm.unregisterListener(this);
            if (raw >= 0) synchronized (StepReceiver.class) {
                StepDay s = load(app);
                if (action.equals(MIDNIGHT)) s.midnight(day, raw, now); else s.reading(day, raw, now);
                save(app, s); Log.i(TAG, action + " raw=" + raw + " -> " + s.json());
            }
            pr.finish();
        }
    }
}
