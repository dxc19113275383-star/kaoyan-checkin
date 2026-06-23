// Netlify Function — send test push notification
// Requires VAPID_PRIVATE_KEY, VAPID_PUBLIC_KEY, VAPID_SUBJECT env vars

exports.handler = async function(event) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: corsHeaders, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers: corsHeaders, body: "Method Not Allowed" };

  try {
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
    const vapidPublic = process.env.VAPID_PUBLIC_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT || "mailto:kaoyan@example.com";

    if (!vapidPrivate || !vapidPublic) {
      return {
        statusCode: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "VAPID keys not configured in environment variables" })
      };
    }

    const { subscription, title, body } = JSON.parse(event.body || "{}");
    if (!subscription || !subscription.endpoint) {
      return { statusCode: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Missing subscription" }) };
    }

    const webpush = require("web-push");
    webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

    const payload = JSON.stringify({
      title: title || "该动一下了",
      body: body || "今天还没开始。先背20个单词，别让热力图空着。",
      url: "/#checkin"
    });

    await webpush.sendNotification(subscription, payload);

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true })
    };

  } catch(err) {
    if (err.statusCode === 410 || (err.body && err.body.includes("unsubscribed"))) {
      return {
        statusCode: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, unsubscribed: true, message: "Subscription expired, please re-subscribe" })
      };
    }
    return {
      statusCode: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message, statusCode: err.statusCode })
    };
  }
};
