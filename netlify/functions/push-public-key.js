// Netlify Function — serve VAPID public key
// Public key can be exposed; private key stays in env only

exports.handler = async function() {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify({
      publicKey: process.env.VAPID_PUBLIC_KEY || ""
    })
  };
};
