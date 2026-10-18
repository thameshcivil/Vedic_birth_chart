package com.aarush.panchangam;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

import org.json.JSONException;
import org.json.JSONObject;

import java.text.DateFormat;
import java.util.Date;

/** Full-screen alarm shown over the lock screen, with Snooze and Dismiss. */
public class AlarmActivity extends Activity {

    private static final int PAPER = Color.parseColor("#1F092F");
    private static final int INK = Color.parseColor("#FBF4E6");
    private static final int ACCENT = Color.parseColor("#FBC044");

    @SuppressWarnings("deprecation")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (Build.VERSION.SDK_INT >= 27) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
        } else {
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
                    | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);
        }
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        getWindow().setStatusBarColor(PAPER);

        final Intent in = getIntent();
        final int id = in.getIntExtra("id", -1);
        final String title = in.getStringExtra("title");
        final String body = in.getStringExtra("body");
        final boolean vibrate = in.getBooleanExtra("vibrate", true);

        float dp = getResources().getDisplayMetrics().density;
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER);
        root.setBackgroundColor(PAPER);
        int pad = (int) (28 * dp);
        root.setPadding(pad, pad, pad, pad);

        TextView time = new TextView(this);
        time.setText(DateFormat.getTimeInstance(DateFormat.SHORT).format(new Date()));
        time.setTextSize(56);
        time.setTextColor(INK);
        time.setGravity(Gravity.CENTER);
        root.addView(time);

        TextView t = new TextView(this);
        t.setText(title == null ? getString(R.string.app_name) : title);
        t.setTextSize(24);
        t.setTypeface(Typeface.SERIF, Typeface.BOLD);
        t.setTextColor(INK);
        t.setGravity(Gravity.CENTER);
        t.setPadding(0, (int) (16 * dp), 0, (int) (8 * dp));
        root.addView(t);

        if (body != null && !body.isEmpty()) {
            TextView b = new TextView(this);
            b.setText(body);
            b.setTextSize(16);
            b.setTextColor(INK);
            b.setGravity(Gravity.CENTER);
            root.addView(b);
        }

        LinearLayout buttons = new LinearLayout(this);
        buttons.setOrientation(LinearLayout.HORIZONTAL);
        buttons.setGravity(Gravity.CENTER);
        buttons.setPadding(0, (int) (40 * dp), 0, 0);

        Button snooze = makeButton(getString(R.string.snooze), false, dp);
        Button dismiss = makeButton(getString(R.string.dismiss), true, dp);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, (int) (56 * dp), 1f);
        lp.setMargins((int) (8 * dp), 0, (int) (8 * dp), 0);
        buttons.addView(snooze, lp);
        buttons.addView(dismiss, new LinearLayout.LayoutParams(lp));
        root.addView(buttons, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT));

        setContentView(root);

        snooze.setOnClickListener(v -> {
            sendAction(AlarmReceiver.ACTION_SNOOZE, id, title, body, vibrate);
            finish();
        });
        dismiss.setOnClickListener(v -> {
            sendAction(AlarmReceiver.ACTION_DISMISS, id, title, body, vibrate);
            finish();
        });
    }

    private Button makeButton(String label, boolean primary, float dp) {
        Button b = new Button(this);
        b.setText(label);
        b.setAllCaps(false);
        b.setTextSize(18);
        GradientDrawable bg = new GradientDrawable();
        bg.setCornerRadius(28 * dp);
        if (primary) {
            bg.setColor(ACCENT);
            b.setTextColor(PAPER);
        } else {
            bg.setColor(Color.TRANSPARENT);
            bg.setStroke((int) (1.5f * dp), INK);
            b.setTextColor(INK);
        }
        b.setBackground(bg);
        return b;
    }

    private void sendAction(String action, int id, String title, String body, boolean vibrate) {
        try {
            JSONObject o = new JSONObject();
            o.put("id", id);
            o.put("title", title);
            o.put("body", body);
            o.put("vibrate", vibrate);
            AlarmReceiver.actionIntent(this, action, o).send();
        } catch (JSONException | android.app.PendingIntent.CanceledException ignored) {
        }
    }
}
