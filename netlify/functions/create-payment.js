// netlify/functions/create-payment.js
// Generates the full report BEFORE payment, stores it in Mollie metadata

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { email, amount, description, reportType, reportData, fileB64, fileType } = JSON.parse(event.body);

    if (!email || !amount) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing email or amount' }) };
    }

    // Step 1: Generate full report NOW via Claude (before payment)
    let reportJson = null;
    try {
      const userContent = [];

      if (fileB64 && fileType) {
        if (fileType === 'application/pdf') {
          userContent.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: fileB64 } });
        } else {
          userContent.push({ type: 'image', source: { type: 'base64', media_type: fileType, data: fileB64 } });
        }
      }

      userContent.push({ type: 'text', text: buildReportPrompt(reportType, reportData) });

      const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 4000,
          messages: [{ role: 'user', content: userContent }],
        }),
      });

      const claudeData = await claudeResponse.json();
      const reportText = claudeData.content?.map(c => c.text || '').join('') || '';
      reportJson = JSON.parse(reportText.replace(/```json|```/g, '').trim());
      console.log('Report generated successfully before payment');
    } catch (reportError) {
      console.error('Report generation error:', reportError.message);
    }

    // Step 2: Store report in Mollie metadata and create payment
    const reportStr = reportJson ? JSON.stringify(reportJson) : '';

    const paymentBody = {
      amount: { currency: 'EUR', value: amount === '4.90' ? '4.90' : '9.90' },
      description: description || `HealthDecoded — ${reportType === 'lab' ? 'Lab Results Report' : 'Health Consultation Report'}`,
      redirectUrl: `${process.env.URL || 'https://healthdecoded.netlify.app'}/.netlify/functions/get-payment?email=${encodeURIComponent(email)}&type=${reportType}`,
      webhookUrl: `${process.env.URL || 'https://healthdecoded.netlify.app'}/.netlify/functions/payment-webhook`,
      metadata: {
        email,
        reportType,
        reportReady: reportJson ? 'true' : 'false',
        report: reportStr.substring(0, 16000),
      },
    };

    const mollieResponse = await fetch('https://api.mollie.com/v2/payments', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.MOLLIE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentBody),
    });

    const payment = await mollieResponse.json();

    if (!payment.id) {
      console.error('Mollie error:', payment);
      return { statusCode: 500, body: JSON.stringify({ error: 'Payment creation failed' }) };
    }

    console.log('Payment created:', payment.id);
    return { statusCode: 200, body: JSON.stringify({ checkoutUrl: payment._links.checkout.href }) };

  } catch (error) {
    console.error('create-payment error:', error.message);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

function buildReportPrompt(reportType, reportData) {
  const data = reportData || {};
  if (reportType === 'lab') {
    return `You are an expert clinical lab results interpreter and nutritionist. Analyse the attached blood test report and return a detailed interpretation with a 7-day meal plan.
Return ONLY valid JSON:
{"labSummary":"string","overallScore":75,"biomarkers":[{"name":"string","value":"string","referenceRange":"string","optimalRange":"string","status":"optimal|normal|borderline|concerning|critical","category":"string","interpretation":"string"}],"keyFindings":["string"],"retestPlan":{"timeframe":"string","reason":"string","markersToRetest":["string"],"expectedImprovements":"string"},"mealPlan":{"goal":"string","keyNutrients":["string"],"generalGuidelines":["string"],"days":[{"day":1,"dayName":"Monday","breakfast":{"meal":"string","why":"string"},"lunch":{"meal":"string","why":"string"},"dinner":{"meal":"string","why":"string"},"snack":{"meal":"string","why":"string"}},{"day":2,"dayName":"Tuesday","breakfast":{"meal":"string","why":"string"},"lunch":{"meal":"string","why":"string"},"dinner":{"meal":"string","why":"string"},"snack":{"meal":"string","why":"string"}},{"day":3,"dayName":"Wednesday","breakfast":{"meal":"string","why":"string"},"lunch":{"meal":"string","why":"string"},"dinner":{"meal":"string","why":"string"},"snack":{"meal":"string","why":"string"}},{"day":4,"dayName":"Thursday","breakfast":{"meal":"string","why":"string"},"lunch":{"meal":"string","why":"string"},"dinner":{"meal":"string","why":"string"},"snack":{"meal":"string","why":"string"}},{"day":5,"dayName":"Friday","breakfast":{"meal":"string","why":"string"},"lunch":{"meal":"string","why":"string"},"dinner":{"meal":"string","why":"string"},"snack":{"meal":"string","why":"string"}},{"day":6,"dayName":"Saturday","breakfast":{"meal":"string","why":"string"},"lunch":{"meal":"string","why":"string"},"dinner":{"meal":"string","why":"string"},"snack":{"meal":"string","why":"string"}},{"day":7,"dayName":"Sunday","breakfast":{"meal":"string","why":"string"},"lunch":{"meal":"string","why":"string"},"dinner":{"meal":"string","why":"string"},"snack":{"meal":"string","why":"string"}}]},"recommendedTests":["string"],"doctorTalkingPoints":["string"]}
Return ONLY valid JSON. No markdown.`;
  }
  return `You are an advanced AI health education assistant. Generate a complete health consultation report.
Return ONLY valid JSON:
{"urgency":{"level":1,"label":"Self-manageable","color":"green","message":"string","showActions":true},"summary":"string","healthScore":{"metabolic":70,"weight":70,"sleep":70,"overall":70},"actionCards":[{"finding":"string","severity":"borderline","explanation":"string","actions":[{"type":"diet","title":"string","detail":"string","dose":"","doNotUseIf":[],"pharmacistNote":""}],"retestIn":"string"}],"concerns":[{"name":"string","confidence":"Medium","reasoning":"string"}],"suggestedTests":[{"test":"string","reason":"string"}],"doctorQuestions":["string"],"homeEssentials":[{"item":"string","reason":"string"}]}
Patient data: ${JSON.stringify(data)}
Return ONLY valid JSON. No markdown.`;
}
