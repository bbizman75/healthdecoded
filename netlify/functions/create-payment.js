export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const { email, amount, reportType, description, blobKey } = JSON.parse(event.body);

    if (!email || !amount) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields" }) };
    }

    const MOLLIE_API_KEY = process.env.MOLLIE_API_KEY;
    if (!MOLLIE_API_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: "Mollie API key not configured" }) };
    }

    const baseUrl = "https://healthdecoded.netlify.app";

    const response = await fetch("https://api.mollie.com/v2/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MOLLIE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: { currency: "EUR", value: parseFloat(amount).toFixed(2) },
        description: description || "HealthDecoded Report",
        redirectUrl: `${baseUrl}/?status=paid&email=${encodeURIComponent(email)}&type=${reportType}`,
        cancelUrl: `${baseUrl}/?status=cancelled`,
        webhookUrl: `${baseUrl}/.netlify/functions/payment-webhook-background`,
        metadata: { email, reportType, blobKey: blobKey || "" },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Mollie error:", data);
      return { statusCode: 500, body: JSON.stringify({ error: data.detail || "Mollie payment creation failed" }) };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkoutUrl: data._links.checkout.href }),
    };
  } catch (err) {
    console.error("create-payment error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Internal server error" }) };
  }
}
