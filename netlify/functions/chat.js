// Netlify Function — DeepSeek API proxy
// DEEPSEEK_API_KEY set in Netlify env vars, never in frontend

exports.handler = async function(event) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method Not Allowed", method: event.httpMethod, expected: "POST" })
    };
  }

  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing DEEPSEEK_API_KEY" })
      };
    }

    const body = JSON.parse(event.body || "{}");
    const { mode, question, context } = body;
    if (!question || !question.trim()) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing question" })
      };
    }

    let modePrompt = "";
    if (mode === "qa") {
      modePrompt = "【一句话结论】\n【小白解释】\n【步骤】\n【容易错的点】\n【今天下一步】";
    } else if (mode === "err") {
      modePrompt = "【错因判断】\n【正确思路】\n【这题怎么记】\n【同类题警惕】\n【是否加入错题本】";
    } else if (mode === "plan") {
      modePrompt = "【明日保底】\n【明日标准】\n【可选冲刺】\n【必须砍掉】\n【原因】";
    }

    const systemPrompt = "你是一个考研执行型学习助手，只服务于用户的考研目标：英语二、396经济类联考、434国际商务专业课。用户基础较弱，英语薄弱，在职备考，容易因为任务过大而放弃。回答必须降低启动成本，强调保底任务、连续性和可执行步骤。只回答与考研学习、复习计划、题目讲解、资料理解、错题分析相关的问题。不要闲聊，不要鸡汤，不要编造院校数据和真题来源。回答最后必须给出\"今天下一步\"。";

    const deepseekResp = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `当前模式：${mode}\n\n上下文：${JSON.stringify(context || {})}\n\n输出格式要求：${modePrompt}\n\n用户问题：${question}` }
        ],
        temperature: 0.3,
        max_tokens: 1200
      })
    });

    const raw = await deepseekResp.text();
    if (!deepseekResp.ok) {
      return {
        statusCode: deepseekResp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "DeepSeek API error", status: deepseekResp.status, detail: raw.slice(0,500) })
      };
    }

    const data = JSON.parse(raw);
    const reply = data.choices?.[0]?.message?.content || "";

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ reply })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Function crashed", message: err.message })
    };
  }
};
