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
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

    if (!MOLLIE_API_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: "Mollie API key not configured" }) };
    }

    // Generate the full report NOW using Claude (we have the PDF here)
    let reportJson = null;
    if (fileB64 && fileType && ANTHROPIC_API_KEY) {
      console.log("Generating report with Claude...");
      try {
        const messageContent = [];
        if (fileType === "application/pdf") {
          messageContent.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: fileB64 } });
        } else {
          messageContent.push({ type: "image", source: { type: "base64", media_type: fileType, data: fileB64 } });
        }
        messageContent.push({ type: "text", text: `You are an expert clinical lab results interpreter. Analyse the attached blood test report and return a detailed plain-language interpretation.

Return ONLY this JSON (no markdown):
{
  "labSummary": "string",
  "overallScore": 75,
  "biomarkers": [{"name":"string","value":"string","referenceRange":"string","optimalRange":"string","status":"optimal|normal|borderline|concerning|critical","category":"string","interpretation":"string"}],
  "keyFindings": ["string"],
  "recommendedTests": ["string"],
  "doctorTalkingPoints": ["string"],
  "retestPlan": {"timeframe":"string","reason":"string","markersToRetest":["string"],"expectedImprovements":"string"},
  "mealPlan": {
    "goal": "string",
    "keyNutrients": ["string"],
    "generalGuidelines": ["string"],
    "days": [
      {"day":1,"dayName":"Monday","breakfast":{"meal":"string","why":"string"},"lunch":{"meal":"string","why":"string"},"dinner":{"meal":"string","why":"string"},"snack":{"meal":"string","why":"string"}},
      {"day":2,"dayName":"Tuesday","breakfast":{"meal":"string","why":"string"},"lunch":{"meal":"string","why":"string"},"dinner":{"meal":"string","why":"string"},"snack":{"meal":"string","why":"string"}},
      {"day":3,"dayName":"Wednesday","breakfast":{"meal":"string","why":"string"},"lunch":{"meal":"string","why":"string"},"dinner":{"meal":"string","why":"string"},"snack":{"meal":"string","why":"string"}},
      {"day":4,"dayName":"Thursday","breakfast":{"meal":"string","why":"string"},"lunch":{"meal":"string","why":"string"},"dinner":{"meal":"string","why":"string"},"snack":{"meal":"string","why":"string"}},
      {"day":5,"dayName":"Friday","breakfast":{"meal":"string","why":"string"},"lunch":{"meal":"string","why":"string"},"dinner":{"meal":"string","why":"string"},"snack":{"meal":"string","why":"string"}},
      {"day":6,"dayName":"Saturday","breakfast":{"meal":"string","why":"string"},"lunch":{"meal":"string","why":"string"},"dinner":{"meal":"string","why":"string"},"snack":{"meal":"string","why":"string"}},
      {"day":7,"dayName":"Sunday","breakfast":{"meal":"string","why":"string"},"lunch":{"meal":"string","why":"string"},"dinner":{"meal":"string","why":"string"},"snack":{"meal":"string","why":"string"}}
    ]
  }
}` });

        const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-6",
            max_tokens: 8000,
            messages: [{ role: "user", content: messageContent }],
          }),
        });

        const claudeData = await claudeRes.json();
        const reportText = claudeData.content.map((c) => c.text || "").join("");
        reportJson = JSON.parse(reportText.replace(/```json|```/g, "").trim());
        console.log("Report generated successfully");
      } catch (claudeErr) {
        console.error("Claude generation failed:", claudeErr);
        // Continue without report — webhook will handle it
      }
    }

    const baseUrl = "https://healthdecoded.netlify.app";

    // Store report as string in metadata (Mollie allows up to 1KB of metadata)
    // We'll store a truncated version and send full email from webhook
    const reportStr = reportJson ? JSON.stringify(reportJson) : "";
    
    // Mollie metadata has limits, so we store a flag and email directly
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
        webhookUrl: `${baseUrl}/.netlify/functions/payment-webhook`,
        metadata: { 
          email, 
          reportType,
          hasReport: reportJson ? "true" : "false",
          // Store report in chunks if needed - Mollie metadata supports up to 1KB per field
          report: reportStr.substring(0, 900),
          report2: reportStr.substring(900, 1800),
          report3: reportStr.substring(1800, 2700),
          report4: reportStr.substring(2700, 3600),
          report5: reportStr.substring(3600, 4500),
          report6: reportStr.substring(4500, 5400),
          report7: reportStr.substring(5400, 6300),
          report8: reportStr.substring(6300, 7200),
          report9: reportStr.substring(7200, 8100),
          report10: reportStr.substring(8100, 9000),
          report11: reportStr.substring(9000, 9900),
          report12: reportStr.substring(9900, 10800),
          report13: reportStr.substring(10800, 11700),
          report14: reportStr.substring(11700, 12600),
          report15: reportStr.substring(12600, 13500),
          report16: reportStr.substring(13500, 14400),
        },
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
