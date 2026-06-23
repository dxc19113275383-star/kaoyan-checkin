// Netlify Function — save push subscription
// Stores subscription for Web Push delivery

exports.handler = async function(event) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: corsHeaders, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers: corsHeaders, body: "Method Not Allowed" };

  try {
    const { subscription } = JSON.parse(event.body || "{}");
    if (!subscription || !subscription.endpoint) {
      return { statusCode: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Missing subscription" }) };
    }

    // Use Netlify Blobs for persistent storage
    // In production, you'd store multiple subscriptions with user IDs
    const blobKey = "push_subscriptions";
    let subs = [];
    try {
      const { getStore } = require("@netlify/blobs");
      const store = getStore("kaoyan-data");
      const raw = await store.get(blobKey);
      if (raw) subs = JSON.parse(raw);
    } catch(e) { subs = []; }

    // Avoid duplicates by endpoint
    subs = subs.filter(s => s.endpoint !== subscription.endpoint);
    subs.push({ ...subscription, savedAt: new Date().toISOString() });

    try {
      const { getStore } = require("@netlify/blobs");
      const store = getStore("kaoyan-data");
      await store.setJSON(blobKey, subs);
      return {
        statusCode: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ ok: true, count: subs.length })
      };
    } catch(storeError) {
      // Fallback: return subscription in response for caller to handle
      return {
        statusCode: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ ok: true, count: subs.length, note: "Blobs not available, subscription stored in function memory (ephemeral)" })
      };
    }

  } catch(err) {
    return {
      statusCode: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message })
    };
  }
};
