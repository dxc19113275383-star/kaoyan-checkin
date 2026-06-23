// Netlify Function — send test push notification
// Requires env vars: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT

exports.handler = async function(event) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: corsHeaders, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers: corsHeaders, body: "Method Not Allowed" };

  try {
    const vapidPublic = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT || "mailto:kaoyan@example.com";

    const hasPublic = Boolean(vapidPublic && vapidPublic.length > 10);
    const hasPrivate = Boolean(vapidPrivate && vapidPrivate.length > 10);

    console.log("[push-send-test] hasPublicKey:", hasPublic, "hasPrivateKey:", hasPrivate);

    if (!hasPublic || !hasPrivate) {
      return {
        statusCode: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "VAPID keys not configured in environment variables",
          hasPublicKey: hasPublic,
          hasPrivateKey: hasPrivate,
          expected: ["VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY", "VAPID_SUBJECT"],
          hint: "请在 Netlify Site configuration → Environment variables 中添加这三项后重新 Deploy"
        })
      };
    }

    const { subscription, title, body } = JSON.parse(event.body || "{}");
    if (!subscription || !subscription.endpoint) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing subscription" })
      };
    }

    const webpush = require("web-push");
    webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

    const payload = JSON.stringify({
      title: title || "该动一下了",
      body: body || "今天还没开始。先背20个单词，别让热力图空着。",
      url: "/#checkin"
    });

    await webpush.sendNotification(subscription, payload);
    console.log("[push-send-test] notification sent successfully");

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true })
    };

  } catch(err) {
    console.error("[push-send-test]", err.message);
    if (err.statusCode === 410 || (err.body && String(err.body).includes("unsubscribed"))) {
      return {
        statusCode: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, unsubscribed: true, message: "Subscription expired, please re-subscribe" })
      };
    }
    return {
      statusCode: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message })
    };
  }
};
