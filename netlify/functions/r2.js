// R2 索引代理：服务端转发 R2 公开桶里的 JSON 索引（course.json / 题库 json），
// 避免前端跨域 fetch 需要 R2 配 CORS。视频/图片本身由 <video>/<img> 直连 R2（免 CORS）。
// 仅放行 index/ 与 question_bank/index/ 下的 .json，避免变成开放代理。

const R2_BASE = "https://pub-3e6c60a8d9f9400bae5689777ed59538.r2.dev/";
const ALLOW = /^(index\/|question_bank\/index\/)[\w./%\-（）()]+\.json$/;

exports.handler = async function (event) {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: cors, body: "" };

  const key = (event.queryStringParameters && event.queryStringParameters.key) || "";
  if (!ALLOW.test(key)) {
    return { statusCode: 400, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: "key not allowed", key }) };
  }
  try {
    const r = await fetch(R2_BASE + key);
    if (!r.ok) {
      return { statusCode: r.status, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: "R2 " + r.status, key }) };
    }
    const body = await r.text();
    return {
      statusCode: 200,
      headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "public, max-age=600" },
      body,
    };
  } catch (e) {
    return { statusCode: 502, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: "fetch failed", message: e.message }) };
  }
};
