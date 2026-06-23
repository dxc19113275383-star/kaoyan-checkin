// Netlify Scheduled Function — daily push reminder
// Configured in netlify.toml as a scheduled function
// Runs on cron schedule, checks subscriptions and sends reminders
//
// NOTE: This requires persistent subscription storage (Netlify Blobs, Supabase, etc.)
// The push-subscribe function saves subscriptions to Netlify Blobs.
// If Blobs are not available, subscriptions are ephemeral and this won't work.
//
// To enable scheduled functions on Netlify:
// 1. Make sure netlify.toml has the @daily cron config
// 2. Deploy to Netlify
// 3. Netlify auto-detects the schedule and runs this function

exports.handler = async function(event) {
  try {
    const vapidPublic = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT || "mailto:kaoyan@example.com";

    if (!vapidPublic || !vapidPrivate) {
      console.log("[push-scheduled] VAPID keys missing — hasPublic:", Boolean(vapidPublic), "hasPrivate:", Boolean(vapidPrivate));
      return { statusCode: 200, body: "VAPID keys not configured" };
    }

    const webpush = require("web-push");
    webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

    // Try to load subscriptions from Blobs
    let subs = [];
    try {
      const { getStore } = require("@netlify/blobs");
      const store = getStore("kaoyan-data");
      const raw = await store.get("push_subscriptions");
      if (raw) subs = JSON.parse(raw);
    } catch(e) {
      console.log("[push-scheduled] Blobs not available, cannot load subscriptions");
      return { statusCode: 200, body: "No persistent subscription storage" };
    }

    if (subs.length === 0) {
      console.log("[push-scheduled] No subscriptions to send");
      return { statusCode: 200, body: "No subscriptions" };
    }

    // Determine time-appropriate message
    const now = new Date();
    const hour = now.getHours();
    let title, body;
    if (hour >= 20) {
      title = "该动一下了"; body = "今天快结束了。先背20个单词，别让热力图空着。";
    } else if (hour >= 12) {
      title = "今天先保底"; body = "不用一下补完，先完成一个最小任务，今天就不算断线。";
    } else {
      title = "早上好"; body = "今天从背单词开始，30分钟就行。";
    }

    const payload = JSON.stringify({ title, body, url: "/#checkin" });
    let sent = 0, failed = 0;

    for (const sub of subs) {
      try {
        await webpush.sendNotification(sub, payload);
        sent++;
      } catch(err) {
        failed++;
        // Remove expired subscriptions
        if (err.statusCode === 410) {
          subs = subs.filter(s => s.endpoint !== sub.endpoint);
        }
      }
    }

    // Update stored subscriptions (remove expired ones)
    if (failed > 0) {
      try {
        const { getStore } = require("@netlify/blobs");
        const store = getStore("kaoyan-data");
        await store.setJSON("push_subscriptions", subs);
      } catch(e) {}
    }

    console.log("[push-scheduled] Sent:", sent, "Failed:", failed);
    return { statusCode: 200, body: `Sent: ${sent}, Failed: ${failed}` };

  } catch(err) {
    console.error("[push-scheduled]", err);
    return { statusCode: 500, body: err.message };
  }
};
