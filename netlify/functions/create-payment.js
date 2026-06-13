import { getStore } from "@netlify/blobs";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const { email, amount, reportType, description, fileB64, fileType, fileName } = JSON.parse(event.body);

    if (!email || !amount) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields" }) };
    }

    const MOLLIE_API_KEY = process.env.MOLLIE_API_KEY;
    if (!MOLLIE_API_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: "Mollie API key not configured" }) };
    }

    // Store PDF in Netlify Blobs (server-side, works here)
    let blobKey = null;
    if (fileB64 && fileType) {
      const key = `report_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const store = getStore({ name: "report-data", consistency: "strong" });
      await store.setJSON(key, { fileB64, fileType, fileName, reportType, email, createdAt: new Date().toISOString() });
      blobKey = key;
      console.log("PDF stored in Blobs with key:", blobKey);
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
