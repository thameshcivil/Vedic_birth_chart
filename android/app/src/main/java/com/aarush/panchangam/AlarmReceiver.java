package com.aarush.panchangam;

import android.app.Notification;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.AudioManager;
import android.media.RingtoneManager;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import org.json.JSONException;
import org.json.JSONObject;

/** Fires alarms and reminders, and handles the Dismiss / Snooze buttons. */
public class AlarmReceiver extends BroadcastReceiver {

    static final String ACTION_FIRE = "com.aarush.panchangam.FIRE";
    static final String ACTION_DISMISS = "com.aarush.panchangam.DISMISS";
    static final String ACTION_SNOOZE = "com.aarush.panchangam.SNOOZE";

    private static final long[] VIBRATION = {0, 600, 400, 600, 400, 600};

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        int id = intent.getIntExtra("id", -1);
        if (ACTION_FIRE.equals(action)) {
            JSONObject entry = AlarmScheduler.find(context, id);
            if (entry == null) return;
            show(context, entry);
            AlarmScheduler.afterFire(context, entry);
        } else if (ACTION_DISMISS.equals(action)) {
            NotificationManagerCompat.from(context).cancel(id);
        } else if (ACTION_SNOOZE.equals(action)) {
            NotificationManagerCompat.from(context).cancel(id);
            try {
                JSONObject o = new JSONObject();
                o.put("id", id);
                o.put("title", intent.getStringExtra("title"));
                o.put("body", intent.getStringExtra("body"));
                o.put("kind", "alarm");
                o.put("vibrate", intent.getBooleanExtra("vibrate", true));
                AlarmScheduler.snooze(context, o);
            } catch (JSONException ignored) {
            }
        }
    }

    static PendingIntent actionIntent(Context c, String action, JSONObject entry) {
        int id = entry.optInt("id");
        Intent i = new Intent(c, AlarmReceiver.class);
        i.setAction(action);
        i.putExtra("id", id);
        i.putExtra("title", entry.optString("title"));
        i.putExtra("body", entry.optString("body"));
        i.putExtra("vibrate", entry.optBoolean("vibrate", true));
        int request = (ACTION_SNOOZE.equals(action) ? 2 : 1) * 31 + id;
        return PendingIntent.getBroadcast(c, request, i,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static void show(Context c, JSONObject entry) {
        AlarmScheduler.createChannels(c);
        int id = entry.optInt("id");
        boolean isAlarm = "alarm".equals(entry.optString("kind", "reminder"));
        String title = entry.optString("title", c.getString(R.string.app_name));
        String body = entry.optString("body", "");

        Intent open = new Intent(c, MainActivity.class)
                .putExtra(MainActivity.EXTRA_OPEN, isAlarm ? "alarms" : "today")
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent openPi = PendingIntent.getActivity(c, id, open,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        NotificationCompat.Builder b = new NotificationCompat.Builder(c,
                isAlarm ? AlarmScheduler.CHANNEL_ALARMS : AlarmScheduler.CHANNEL_REMINDERS)
                .setSmallIcon(R.drawable.ic_stat_aarush)
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
                .setContentIntent(openPi)
                .setAutoCancel(!isAlarm);

        if (isAlarm) {
            Intent full = new Intent(c, AlarmActivity.class)
                    .putExtra("id", id)
                    .putExtra("title", title)
                    .putExtra("body", body)
                    .putExtra("vibrate", entry.optBoolean("vibrate", true))
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_NO_USER_ACTION);
            PendingIntent fullPi = PendingIntent.getActivity(c, id, full,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            b.setCategory(NotificationCompat.CATEGORY_ALARM)
                    .setPriority(NotificationCompat.PRIORITY_MAX)
                    .setOngoing(true)
                    .setFullScreenIntent(fullPi, true)
                    .addAction(0, c.getString(R.string.snooze), actionIntent(c, ACTION_SNOOZE, entry))
                    .addAction(0, c.getString(R.string.dismiss), actionIntent(c, ACTION_DISMISS, entry));
            if (Build.VERSION.SDK_INT < 26) {
                b.setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM), AudioManager.STREAM_ALARM);
                if (entry.optBoolean("vibrate", true)) b.setVibrate(VIBRATION);
            }
        } else {
            b.setCategory(NotificationCompat.CATEGORY_REMINDER)
                    .setPriority(NotificationCompat.PRIORITY_DEFAULT);
            if (Build.VERSION.SDK_INT < 26) b.setDefaults(Notification.DEFAULT_ALL);
        }

        Notification n = b.build();
        if (isAlarm) n.flags |= Notification.FLAG_INSISTENT; // keep ringing until dismissed
        try {
            NotificationManagerCompat.from(c).notify(id, n);
        } catch (SecurityException ignored) {
            // Notification permission not granted
        }
    }
}
