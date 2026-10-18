package com.aarush.panchangam;

import android.app.AlarmManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.provider.Settings;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import org.json.JSONObject;

/**
 * The window.AarushNative object the web app talks to. Every method is called on a
 * WebView background thread, so anything touching views hops to the UI thread.
 */
public class NativeBridge {

    private final MainActivity activity;
    private final WebView webView;
    private volatile String launchAction;

    NativeBridge(MainActivity activity, WebView webView) {
        this.activity = activity;
        this.webView = webView;
    }

    void setLaunchAction(String action) {
        this.launchAction = action;
    }

    static String quote(String s) {
        return JSONObject.quote(s == null ? "" : s);
    }

    @JavascriptInterface
    public String getInfo() {
        try {
            JSONObject o = new JSONObject();
            o.put("platform", "android");
            o.put("sdk", Build.VERSION.SDK_INT);
            o.put("version", activity.getPackageManager()
                    .getPackageInfo(activity.getPackageName(), 0).versionName);
            o.put("exactAlarms", canScheduleExactAlarms());
            return o.toString();
        } catch (Exception e) {
            return "{\"platform\":\"android\"}";
        }
    }

    /** Returns (once) what a notification asked the app to open, e.g. "alarms". */
    @JavascriptInterface
    public String takeLaunchAction() {
        String a = launchAction;
        launchAction = null;
        return a == null ? "" : a;
    }

    /**
     * Replaces the whole alarm/reminder schedule. JSON array of
     * {id, title, body, time (epoch ms), kind: "alarm"|"reminder", vibrate,
     *  repeat: {type: "once"|"daily"|"weekly", days: [0-6], hour, minute}}
     */
    @JavascriptInterface
    public boolean setSchedule(String json) {
        try {
            AlarmScheduler.replaceSchedule(activity.getApplicationContext(), json);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @JavascriptInterface
    public boolean canScheduleExactAlarms() {
        if (Build.VERSION.SDK_INT < 31) return true;
        AlarmManager am = (AlarmManager) activity.getSystemService(Context.ALARM_SERVICE);
        return am != null && am.canScheduleExactAlarms();
    }

    @JavascriptInterface
    public void requestNotificationPermission() {
        activity.runOnUiThread(activity::requestNotificationPermission);
    }

    @JavascriptInterface
    public void openExactAlarmSettings() {
        if (Build.VERSION.SDK_INT >= 31) {
            activity.runOnUiThread(() -> {
                try {
                    Intent i = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM,
                            Uri.parse("package:" + activity.getPackageName()));
                    activity.startActivity(i);
                } catch (Exception ignored) {
                }
            });
        }
    }

    @JavascriptInterface
    public void share(String title, String text) {
        activity.runOnUiThread(() -> {
            Intent send = new Intent(Intent.ACTION_SEND);
            send.setType("text/plain");
            send.putExtra(Intent.EXTRA_SUBJECT, title);
            send.putExtra(Intent.EXTRA_TEXT, text);
            activity.startActivity(Intent.createChooser(send, title));
        });
    }

    /** Opens Android's print dialog for the current page; "Save as PDF" is one of its printers. */
    @JavascriptInterface
    public void print(String jobName) {
        activity.runOnUiThread(() -> {
            PrintManager pm = (PrintManager) activity.getSystemService(Context.PRINT_SERVICE);
            if (pm == null) return;
            String name = (jobName == null || jobName.isEmpty()) ? "Aarush Panchangam" : jobName;
            PrintDocumentAdapter adapter = webView.createPrintDocumentAdapter(name);
            pm.print(name, adapter, new PrintAttributes.Builder()
                    .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                    .build());
        });
    }

    @JavascriptInterface
    public void openUrl(String url) {
        activity.runOnUiThread(() -> {
            try {
                activity.startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
            } catch (Exception ignored) {
            }
        });
    }
}
