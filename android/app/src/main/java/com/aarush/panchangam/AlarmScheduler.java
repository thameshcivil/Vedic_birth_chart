package com.aarush.panchangam;

import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Calendar;

/**
 * Keeps the alarm/reminder list in SharedPreferences and registers each entry with
 * AlarmManager. Clock alarms that repeat (daily / chosen weekdays) are rescheduled
 * here after they fire; panchangam-based reminders arrive from the web app already
 * expanded into individual one-shot times.
 */
final class AlarmScheduler {

    static final String CHANNEL_ALARMS = "aarush_alarms";
    static final String CHANNEL_REMINDERS = "aarush_reminders";
    static final int SNOOZE_FLAG = 0x40000000;
    static final long SNOOZE_MS = 10 * 60 * 1000L;

    private static final String PREFS = "aarush_alarms";
    private static final String KEY = "schedule";

    private AlarmScheduler() {
    }

    static void createChannels(Context c) {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationManager nm = c.getSystemService(NotificationManager.class);
        if (nm == null) return;

        NotificationChannel alarms = new NotificationChannel(CHANNEL_ALARMS,
                c.getString(R.string.channel_alarms), NotificationManager.IMPORTANCE_HIGH);
        alarms.setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM),
                new AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build());
        alarms.enableVibration(true);
        nm.createNotificationChannel(alarms);

        NotificationChannel reminders = new NotificationChannel(CHANNEL_REMINDERS,
                c.getString(R.string.channel_reminders), NotificationManager.IMPORTANCE_DEFAULT);
        nm.createNotificationChannel(reminders);
    }

    // ----- storage -----

    static synchronized JSONArray load(Context c) {
        SharedPreferences p = c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        try {
            return new JSONArray(p.getString(KEY, "[]"));
        } catch (JSONException e) {
            return new JSONArray();
        }
    }

    static synchronized void save(Context c, JSONArray arr) {
        c.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(KEY, arr.toString()).apply();
    }

    static JSONObject find(Context c, int id) {
        JSONArray arr = load(c);
        for (int i = 0; i < arr.length(); i++) {
            JSONObject o = arr.optJSONObject(i);
            if (o != null && o.optInt("id") == id) return o;
        }
        return null;
    }

    static void putEntry(Context c, JSONObject entry) {
        JSONArray arr = load(c);
        JSONArray out = new JSONArray();
        int id = entry.optInt("id");
        for (int i = 0; i < arr.length(); i++) {
            JSONObject o = arr.optJSONObject(i);
            if (o != null && o.optInt("id") != id) out.put(o);
        }
        out.put(entry);
        save(c, out);
    }

    static void removeEntry(Context c, int id) {
        JSONArray arr = load(c);
        JSONArray out = new JSONArray();
        for (int i = 0; i < arr.length(); i++) {
            JSONObject o = arr.optJSONObject(i);
            if (o != null && o.optInt("id") != id) out.put(o);
        }
        save(c, out);
    }

    // ----- scheduling -----

    static synchronized void replaceSchedule(Context c, String json) throws JSONException {
        JSONArray old = load(c);
        for (int i = 0; i < old.length(); i++) {
            JSONObject o = old.optJSONObject(i);
            if (o != null) cancel(c, o.optInt("id"));
        }
        JSONArray incoming = new JSONArray(json);
        JSONArray keep = new JSONArray();
        long now = System.currentTimeMillis();
        for (int i = 0; i < incoming.length(); i++) {
            JSONObject o = incoming.getJSONObject(i);
            long t = nextFireTime(o, now);
            if (t <= 0) continue;
            o.put("time", t);
            keep.put(o);
            schedule(c, o);
        }
        save(c, keep);
    }

    static void rescheduleAll(Context c) {
        JSONArray arr = load(c);
        JSONArray keep = new JSONArray();
        long now = System.currentTimeMillis();
        for (int i = 0; i < arr.length(); i++) {
            JSONObject o = arr.optJSONObject(i);
            if (o == null) continue;
            long t = nextFireTime(o, now);
            if (t <= 0) continue;
            try {
                o.put("time", t);
            } catch (JSONException ignored) {
            }
            keep.put(o);
            schedule(c, o);
        }
        save(c, keep);
    }

    /** Next time this entry should fire, or 0 if it never will again. */
    static long nextFireTime(JSONObject o, long now) {
        JSONObject repeat = o.optJSONObject("repeat");
        String type = repeat == null ? "once" : repeat.optString("type", "once");
        if ("once".equals(type)) {
            long t = o.optLong("time", 0);
            return t > now ? t : 0;
        }
        int hour = repeat.optInt("hour", 6);
        int minute = repeat.optInt("minute", 0);
        JSONArray days = repeat.optJSONArray("days"); // 0 = Sunday ... 6 = Saturday
        Calendar cal = Calendar.getInstance();
        cal.setTimeInMillis(now);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        cal.set(Calendar.HOUR_OF_DAY, hour);
        cal.set(Calendar.MINUTE, minute);
        for (int i = 0; i < 8; i++) {
            if (cal.getTimeInMillis() > now) {
                int dow = cal.get(Calendar.DAY_OF_WEEK) - 1;
                if (!"weekly".equals(type) || containsDay(days, dow)) return cal.getTimeInMillis();
            }
            cal.add(Calendar.DAY_OF_MONTH, 1);
            cal.set(Calendar.HOUR_OF_DAY, hour);
            cal.set(Calendar.MINUTE, minute);
        }
        return 0;
    }

    private static boolean containsDay(JSONArray days, int dow) {
        if (days == null || days.length() == 0) return true;
        for (int i = 0; i < days.length(); i++) if (days.optInt(i, -1) == dow) return true;
        return false;
    }

    private static PendingIntent firePendingIntent(Context c, int id, int flags) {
        Intent i = new Intent(c, AlarmReceiver.class);
        i.setAction(AlarmReceiver.ACTION_FIRE);
        i.putExtra("id", id);
        return PendingIntent.getBroadcast(c, id, i, flags | PendingIntent.FLAG_IMMUTABLE);
    }

    static void schedule(Context c, JSONObject o) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        int id = o.optInt("id");
        long t = o.optLong("time");
        PendingIntent fire = firePendingIntent(c, id, PendingIntent.FLAG_UPDATE_CURRENT);
        boolean exactAllowed = Build.VERSION.SDK_INT < 31 || am.canScheduleExactAlarms();
        if (exactAllowed) {
            Intent show = new Intent(c, MainActivity.class).putExtra(MainActivity.EXTRA_OPEN, "alarms");
            PendingIntent showPi = PendingIntent.getActivity(c, id, show,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            am.setAlarmClock(new AlarmManager.AlarmClockInfo(t, showPi), fire);
        } else {
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, t, fire);
        }
    }

    static void cancel(Context c, int id) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        PendingIntent pi = firePendingIntent(c, id, PendingIntent.FLAG_NO_CREATE);
        if (pi != null) {
            if (am != null) am.cancel(pi);
            pi.cancel();
        }
    }

    /** Called after an entry fires: repeating clock alarms move to their next time. */
    static void afterFire(Context c, JSONObject o) {
        long next = nextFireTime(o, System.currentTimeMillis() + 1000);
        int id = o.optInt("id");
        if (next > 0 && o.optJSONObject("repeat") != null
                && !"once".equals(o.optJSONObject("repeat").optString("type", "once"))) {
            try {
                o.put("time", next);
            } catch (JSONException ignored) {
            }
            putEntry(c, o);
            schedule(c, o);
        } else {
            removeEntry(c, id);
        }
    }

    static void snooze(Context c, JSONObject o) {
        try {
            JSONObject s = new JSONObject(o.toString());
            s.put("id", (o.optInt("id") & ~SNOOZE_FLAG) | SNOOZE_FLAG);
            s.put("time", System.currentTimeMillis() + SNOOZE_MS);
            s.remove("repeat");
            putEntry(c, s);
            schedule(c, s);
        } catch (JSONException ignored) {
        }
    }
}
