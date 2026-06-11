// netlify/functions/payment-webhook.js
// Called by Mollie when payment status changes
// On success: generates full report via Claude + sends PDF by email via Resend

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const params = new URLSearchParams(event.body);
    const paymentId = params.get('id');

    if (!paymentId) {
      return { statusCode: 400, body: 'Missing payment ID' };
    }

    // Verify payment status with Mollie
    const paymentResponse = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${process.env.MOLLIE_API_KEY}` },
    });

    const payment = await paymentResponse.json();

    // Only process paid payments
    if (payment.status !== 'paid') {
      return { statusCode: 200, body: 'Payment not paid yet' };
    }

    const { email, reportType, reportData } = payment.metadata;

    if (!email) {
      return { statusCode: 400, body: 'Missing email in payment metadata' };
    }

    // Generate full report via Claude
    const reportPrompt = buildReportPrompt(reportType, reportData);
    
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{ role: 'user', content: reportPrompt }],
      }),
    });

    const claudeData = await claudeResponse.json();
    const reportText = claudeData.content?.map(c => c.text || '').join('') || '';

    let report;
    try {
      report = JSON.parse(reportText.replace(/```json|```/g, '').trim());
    } catch (e) {
      report = { summary: reportText, error: 'Could not parse structured report' };
    }

    // Build HTML email with the report
    const emailHtml = buildEmailHtml(report, reportType, email);

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'HealthDecoded <onboarding@resend.dev>',
        to: [email],
        subject: reportType === 'lab'
          ? 'Your Blood Test Analysis — HealthDecoded'
          : 'Your Health Consultation Report — HealthDecoded',
        html: emailHtml,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log('Email sent:', emailResult);

    return { statusCode: 200, body: 'OK' };

  } catch (error) {
    console.error('webhook error:', error);
    return { statusCode: 500, body: error.message };
  }
};

function buildReportPrompt(reportType, reportDataStr) {
  const base = reportDataStr || '{}';
  
  if (reportType === 'lab') {
    return `You are an expert clinical lab results interpreter and nutritionist. 
Generate a complete, detailed health report based on the blood test data provided.

Return ONLY valid JSON with this structure:
{"labSummary":"string","overallScore":number,"biomarkers":[{"name":"string","value":"string","referenceRange":"string","optimalRange":"string","status":"optimal|normal|borderline|concerning|critical","category":"string","interpretation":"string"}],"keyFindings":["string"],"retestPlan":{"timeframe":"string","reason":"string","markersToRetest":["string"],"expectedImprovements":"string"},"mealPlan":{"goal":"string","keyNutrients":["string"],"generalGuidelines":["string"],"days":[{"day":1,"dayName":"Monday","breakfast":{"meal":"string","why":"string"},"lunch":{"meal":"string","why":"string"},"dinner":{"meal":"string","why":"string"},"snack":{"meal":"string","why":"string"}}]},"recommendedTests":["string"],"doctorTalkingPoints":["string"]}

Patient data: ${base}
Return ONLY valid JSON. No markdown.`;
  }

  return `You are an advanced AI health education assistant. Generate a complete health consultation report.

Return ONLY valid JSON:
{"urgency":{"level":1,"label":"string","color":"green","message":"string","showActions":true},"summary":"string","healthScore":{"metabolic":70,"weight":70,"sleep":70,"overall":70},"actionCards":[{"finding":"string","severity":"borderline","explanation":"string","actions":[{"type":"otc","title":"string","detail":"string","dose":"string","doNotUseIf":["string"],"pharmacistNote":"string"}],"retestIn":"string"}],"concerns":[{"name":"string","confidence":"Medium","reasoning":"string"}],"suggestedTests":[{"test":"string","reason":"string"}],"doctorQuestions":["string"],"homeEssentials":[{"item":"string","reason":"string"}]}

Patient data: ${base}
Return ONLY valid JSON. No markdown.`;
}

function buildEmailHtml(report, reportType, email) {
  const isLab = reportType === 'lab';
  
  const statusColors = {
    optimal: '#16a34a', normal: '#0369a1', borderline: '#ca8a04',
    concerning: '#ea580c', critical: '#dc2626'
  };

  let biomarkersHtml = '';
  if (isLab && report.biomarkers?.length > 0) {
    const categories = [...new Set(report.biomarkers.map(b => b.category))];
    categories.forEach(cat => {
      biomarkersHtml += `<h3 style="color:#1A5276;font-size:16px;margin:24px 0 12px;">${cat}</h3>`;
      report.biomarkers.filter(b => b.category === cat).forEach(b => {
        const col = statusColors[b.status] || '#64748b';
        biomarkersHtml += `
          <div style="border:1px solid #e2e8f0;border-radius:8px;margin-bottom:12px;overflow:hidden;">
            <div style="background:#f8fafc;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;">
              <div>
                <strong style="color:#0f172a;">${b.name}</strong>
                <span style="color:#64748b;font-size:13px;margin-left:10px;">Your value: <strong style="color:${col};">${b.value}</strong>${b.referenceRange ? ` · Ref: ${b.referenceRange}` : ''}${b.optimalRange ? ` · Optimal: ${b.optimalRange}` : ''}</span>
              </div>
              <span style="background:white;color:${col};border:1px solid ${col};border-radius:8px;padding:2px 10px;font-size:12px;font-weight:700;">${b.status}</span>
            </div>
            <div style="padding:12px 14px;font-size:13px;color:#374151;line-height:1.6;">${b.interpretation}</div>
          </div>`;
      });
    });
  }

  let actionCardsHtml = '';
  if (!isLab && report.actionCards?.length > 0) {
    report.actionCards.forEach(card => {
      actionCardsHtml += `
        <div style="border:1.5px solid #e2e8f0;border-radius:10px;margin-bottom:14px;overflow:hidden;">
          <div style="background:#f8fafc;padding:10px 14px;">
            <strong style="color:#0f172a;">${card.finding}</strong>
            ${card.retestIn ? `<span style="float:right;font-size:11px;color:#64748b;">Retest in ${card.retestIn}</span>` : ''}
          </div>
          <div style="padding:12px 14px;font-size:13px;color:#374151;">${card.explanation}</div>
          ${card.actions?.map(a => `
            <div style="margin:0 14px 10px;padding:10px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;">
              <strong style="color:#16a34a;">💊 ${a.title}</strong><br>
              <span style="font-size:12px;color:#374151;">${a.detail}</span>
              ${a.dose ? `<br><span style="font-size:11px;color:#16a34a;font-weight:600;">📏 ${a.dose}</span>` : ''}
              ${a.pharmacistNote ? `<br><span style="font-size:11px;color:#ea580c;">🏪 Ask pharmacist: ${a.pharmacistNote}</span>` : ''}
            </div>`).join('') || ''}
        </div>`;
    });
  }

  let mealPlanHtml = '';
  if (isLab && report.mealPlan?.days?.length > 0) {
    mealPlanHtml = `
      <h2 style="color:#1A5276;font-size:20px;border-bottom:2px solid #2E86C1;padding-bottom:8px;margin-top:32px;">🥗 Your 7-Day Meal Plan</h2>
      <p style="color:#166534;background:#dcfce7;padding:10px;border-radius:6px;"><strong>Goal:</strong> ${report.mealPlan.goal}</p>
      ${report.mealPlan.days.map(d => `
        <div style="border:1px solid #bbf7d0;border-radius:8px;margin-bottom:10px;overflow:hidden;">
          <div style="background:#16a34a;padding:8px 14px;color:white;font-weight:700;">Day ${d.day} — ${d.dayName}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:10px;">
            ${[['🌅 Breakfast', d.breakfast], ['☀️ Lunch', d.lunch], ['🌙 Dinner', d.dinner], ['🍎 Snack', d.snack]].map(([label, meal]) => meal ? `
              <div style="background:#f0fdf4;border-radius:6px;padding:8px;">
                <div style="font-size:11px;font-weight:700;color:#16a34a;">${label}</div>
                <div style="font-size:12px;font-weight:600;color:#1e293b;">${meal.meal}</div>
                <div style="font-size:11px;color:#64748b;font-style:italic;">${meal.why}</div>
              </div>` : '').join('')}
          </div>
        </div>`).join('')}`;
  }

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:Arial,sans-serif;background:#f0f9ff;margin:0;padding:20px;">
  <div style="max-width:680px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0f172a,#1e3a5f);padding:32px 32px 24px;">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;color:#7dd3fc;text-transform:uppercase;margin-bottom:6px;">HealthDecoded</div>
      <h1 style="color:white;font-size:24px;margin:0 0 8px;">${isLab ? 'Your Blood Test Analysis' : 'Your Health Consultation Report'}</h1>
      <p style="color:#94a3b8;font-size:13px;margin:0;">AI-generated educational content · Not a medical diagnosis</p>
    </div>

    <div style="padding:32px;">
      
      <!-- Disclaimer -->
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin-bottom:24px;font-size:12px;color:#92400e;">
        <strong>Important:</strong> This report is generated by AI for educational purposes only. It is not a diagnosis and does not replace consultation with a qualified healthcare professional. Always discuss your results with your doctor or pharmacist.
      </div>

      ${isLab && report.overallScore ? `
      <!-- Score -->
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;width:80px;height:80px;border-radius:50%;background:${report.overallScore >= 70 ? '#dcfce7' : report.overallScore >= 50 ? '#fef9c3' : '#fee2e2'};border:3px solid ${report.overallScore >= 70 ? '#16a34a' : report.overallScore >= 50 ? '#ca8a04' : '#dc2626'};line-height:80px;font-size:24px;font-weight:800;color:${report.overallScore >= 70 ? '#16a34a' : report.overallScore >= 50 ? '#ca8a04' : '#dc2626'};">${report.overallScore}</div>
        <div style="font-size:12px;color:#64748b;margin-top:4px;">Overall Score</div>
      </div>` : ''}

      ${!isLab && report.urgency ? `
      <!-- Urgency -->
      <div style="border-radius:12px;padding:16px;margin-bottom:20px;background:${report.urgency.color === 'green' ? '#dcfce7' : report.urgency.color === 'yellow' ? '#fef9c3' : report.urgency.color === 'orange' ? '#fff7ed' : '#fee2e2'};border:2px solid ${report.urgency.color === 'green' ? '#16a34a' : report.urgency.color === 'yellow' ? '#ca8a04' : report.urgency.color === 'orange' ? '#ea580c' : '#dc2626'};">
        <div style="font-size:13px;font-weight:700;">Urgency Level ${report.urgency.level}/5 — ${report.urgency.label}</div>
        <div style="font-size:13px;margin-top:6px;">${report.urgency.message}</div>
      </div>` : ''}

      <!-- Summary -->
      ${report.summary || report.labSummary ? `
      <div style="background:#f0f9ff;border:1.5px solid #bae6fd;border-radius:10px;padding:16px;margin-bottom:24px;font-size:14px;color:#0369a1;line-height:1.6;">
        ${report.summary || report.labSummary}
      </div>` : ''}

      ${isLab && report.keyFindings?.length > 0 ? `
      <h2 style="color:#1A5276;font-size:20px;border-bottom:2px solid #2E86C1;padding-bottom:8px;">🎯 Key Findings</h2>
      ${report.keyFindings.map((f, i) => `<div style="padding:8px 12px;background:#f0f9ff;border-left:3px solid #0ea5e9;margin-bottom:8px;font-size:13px;border-radius:4px;">${i + 1}. ${f}</div>`).join('')}` : ''}

      ${biomarkersHtml ? `<h2 style="color:#1A5276;font-size:20px;border-bottom:2px solid #2E86C1;padding-bottom:8px;margin-top:32px;">🔬 Biomarker Analysis</h2>${biomarkersHtml}` : ''}

      ${actionCardsHtml ? `<h2 style="color:#1A5276;font-size:20px;border-bottom:2px solid #2E86C1;padding-bottom:8px;margin-top:32px;">🎯 Action Plan</h2>${actionCardsHtml}` : ''}

      ${mealPlanHtml}

      ${report.doctorTalkingPoints?.length > 0 || report.doctorQuestions?.length > 0 ? `
      <h2 style="color:#1A5276;font-size:20px;border-bottom:2px solid #2E86C1;padding-bottom:8px;margin-top:32px;">💬 What to Discuss with Your Doctor</h2>
      ${(report.doctorTalkingPoints || report.doctorQuestions || []).map(q => `<div style="padding:8px 12px;background:#f0f9ff;border-left:3px solid #0ea5e9;margin-bottom:8px;font-size:13px;border-radius:4px;">${q}</div>`).join('')}` : ''}

      ${isLab && report.retestPlan ? `
      <h2 style="color:#1A5276;font-size:20px;border-bottom:2px solid #2E86C1;padding-bottom:8px;margin-top:32px;">🔁 When to Retest</h2>
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px;">
        <strong style="color:#ca8a04;">Recommended: ${report.retestPlan.timeframe}</strong><br>
        <span style="font-size:13px;">${report.retestPlan.reason}</span><br>
        <span style="font-size:13px;"><strong>Expected improvements:</strong> ${report.retestPlan.expectedImprovements}</span>
      </div>` : ''}

      <!-- Upsell -->
      <div style="background:#faf5ff;border:1.5px solid #e9d5ff;border-radius:12px;padding:20px;margin-top:32px;text-align:center;">
        <div style="font-size:15px;font-weight:700;color:#7c3aed;margin-bottom:8px;">
          ${isLab ? 'Want a deeper analysis?' : 'Want to analyse your blood tests too?'}
        </div>
        <div style="font-size:13px;color:#6b21a8;margin-bottom:14px;">
          ${isLab ? 'Combine your blood results with symptoms, medications, and health history for a complete consultation.' : 'Upload your blood test for a detailed biomarker-by-biomarker analysis with meal plan.'}
        </div>
        <a href="https://healthdecoded.netlify.app" style="background:#7c3aed;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">
          ${isLab ? '🩺 Start Full Consultation — €9.90' : '🔬 Analyse My Blood Test — €4.90'}
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;text-align:center;">
      <div style="font-size:13px;font-weight:700;color:#0ea5e9;margin-bottom:4px;">HealthDecoded</div>
      <div style="font-size:11px;color:#94a3b8;">healthdecoded.netlify.app · AI-generated educational content only · Not a medical device</div>
      <div style="font-size:11px;color:#94a3b8;margin-top:4px;">Always consult a qualified healthcare professional</div>
    </div>
  </div>
</body>
</html>`;
}
