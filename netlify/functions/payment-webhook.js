// netlify/functions/payment-webhook.js
// Payment is confirmed — read pre-generated report from metadata and email it

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

    // Verify payment with Mollie
    const paymentResponse = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${process.env.MOLLIE_API_KEY}` },
    });

    const payment = await paymentResponse.json();
    console.log('Payment status:', payment.status);

    if (payment.status !== 'paid') {
      return { statusCode: 200, body: 'Payment not paid yet' };
    }

    const { email, reportType, report, reportReady } = payment.metadata;

    if (!email) {
      return { statusCode: 400, body: 'Missing email in metadata' };
    }

    console.log('Report ready:', reportReady, 'Report length:', report?.length);

    // Parse the pre-generated report
    let reportJson = null;
    if (report && reportReady === 'true') {
      try {
        reportJson = JSON.parse(report);
        console.log('Report parsed successfully');
      } catch (e) {
        console.error('Could not parse report from metadata:', e.message);
      }
    }

    // If no report, generate a basic one now
    if (!reportJson) {
      console.log('No pre-generated report — generating now');
      try {
        const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2000,
            messages: [{
              role: 'user',
              content: reportType === 'lab'
                ? 'Generate a sample blood test educational report. Return ONLY valid JSON: {"labSummary":"Thank you for using HealthDecoded. Your blood test report has been received. For a detailed analysis, please ensure your PDF was properly uploaded.","overallScore":70,"biomarkers":[],"keyFindings":["Please re-upload your blood test for full biomarker analysis"],"retestPlan":{"timeframe":"As recommended by your doctor","reason":"Regular monitoring is important","markersToRetest":["Full blood panel"],"expectedImprovements":"Regular testing helps track your health trends"},"mealPlan":{"goal":"General health optimization","keyNutrients":["Vitamin D","Magnesium","Omega-3"],"generalGuidelines":["Eat a balanced diet rich in vegetables","Stay hydrated with 2L water daily","Include lean proteins with each meal","Limit processed foods and sugar"],"days":[{"day":1,"dayName":"Monday","breakfast":{"meal":"Oatmeal with berries and nuts","why":"High fiber, antioxidants"},"lunch":{"meal":"Grilled chicken salad with olive oil","why":"Lean protein and healthy fats"},"dinner":{"meal":"Salmon with roasted vegetables","why":"Omega-3 and micronutrients"},"snack":{"meal":"Apple with almond butter","why":"Fiber and protein balance"}},{"day":2,"dayName":"Tuesday","breakfast":{"meal":"Greek yogurt with honey and seeds","why":"Protein and probiotics"},"lunch":{"meal":"Lentil soup with whole grain bread","why":"Plant protein and fiber"},"dinner":{"meal":"Chicken stir-fry with brown rice","why":"Balanced macronutrients"},"snack":{"meal":"Handful of mixed nuts","why":"Healthy fats and minerals"}},{"day":3,"dayName":"Wednesday","breakfast":{"meal":"Eggs with spinach and avocado","why":"Protein, iron, and healthy fats"},"lunch":{"meal":"Tuna wrap with vegetables","why":"Lean protein and vitamins"},"dinner":{"meal":"Beef stew with root vegetables","why":"Iron and zinc-rich meal"},"snack":{"meal":"Carrot sticks with hummus","why":"Fiber and plant protein"}},{"day":4,"dayName":"Thursday","breakfast":{"meal":"Smoothie with banana, spinach, protein powder","why":"Nutrients and easy digestion"},"lunch":{"meal":"Quinoa bowl with roasted chickpeas","why":"Complete protein and fiber"},"dinner":{"meal":"Baked cod with sweet potato","why":"Lean protein and beta-carotene"},"snack":{"meal":"Dark chocolate and berries","why":"Antioxidants and mood boost"}},{"day":5,"dayName":"Friday","breakfast":{"meal":"Whole grain toast with eggs and tomatoes","why":"Complex carbs and protein"},"lunch":{"meal":"Vegetable curry with basmati rice","why":"Anti-inflammatory spices"},"dinner":{"meal":"Grilled prawns with asparagus","why":"Protein and folate-rich"},"snack":{"meal":"Yogurt with granola","why":"Calcium and probiotics"}},{"day":6,"dayName":"Saturday","breakfast":{"meal":"Pancakes with fresh fruit — treat yourself","why":"Enjoyment is part of health"},"lunch":{"meal":"Avocado toast with poached eggs","why":"Healthy fats and protein"},"dinner":{"meal":"Roast chicken with seasonal vegetables","why":"Complete protein and micronutrients"},"snack":{"meal":"Fruit salad","why":"Vitamins and hydration"}},{"day":7,"dayName":"Sunday","breakfast":{"meal":"Full cooked breakfast with eggs, beans, mushrooms","why":"Weekly protein boost"},"lunch":{"meal":"Homemade vegetable soup","why":"Micronutrients and hydration"},"dinner":{"meal":"Pasta with tomato sauce and vegetables","why":"Energy and lycopene"},"snack":{"meal":"Herbal tea and a small piece of cake","why":"Relaxation and mindfulness"}}]},"recommendedTests":["Full blood count","Vitamin D","Ferritin","TSH thyroid","HbA1c glucose","Lipid panel"],"doctorTalkingPoints":["Ask about your specific values and what they mean for you","Discuss whether any supplements are appropriate","Ask when to schedule your next blood test"]}'
                : 'Generate a basic health consultation report. Return ONLY valid JSON: {"urgency":{"level":1,"label":"Self-manageable","color":"green","message":"Based on the information provided, your symptoms appear manageable with lifestyle modifications.","showActions":true},"summary":"Thank you for using HealthDecoded. Your health consultation has been processed. Please find your personalised recommendations below.","healthScore":{"metabolic":70,"weight":70,"sleep":65,"overall":68},"actionCards":[{"finding":"General Health Optimisation","severity":"informational","explanation":"Based on your profile, we recommend focusing on foundational health habits that will improve your overall wellbeing.","actions":[{"type":"lifestyle","title":"Daily movement routine","detail":"Aim for 30 minutes of moderate exercise 5 days per week. Walking, swimming, or cycling are excellent starting points.","dose":"","doNotUseIf":[],"pharmacistNote":""},{"type":"diet","title":"Anti-inflammatory diet","detail":"Increase vegetables to half your plate at each meal. Reduce processed foods and sugar. Add omega-3 rich foods 3x per week.","dose":"","doNotUseIf":[],"pharmacistNote":""}],"retestIn":"3 months"}],"concerns":[{"name":"Preventive health monitoring","confidence":"Medium","reasoning":"Regular health checks allow early detection of any developing conditions."}],"suggestedTests":["Full blood count","Vitamin D","Thyroid TSH","HbA1c","Lipid panel","Ferritin"],"doctorQuestions":["What preventive health screens are recommended for my age?","Are there any specific tests you recommend based on my family history?","What lifestyle changes would have the biggest impact on my health?"],"homeEssentials":[{"item":"Blood pressure monitor","reason":"Track cardiovascular health at home"},{"item":"Vitamin D supplement","reason":"Most people are deficient, especially in winter"}]}'
            }],
          }),
        });
        const cd = await claudeResponse.json();
        const rt = cd.content?.map(c => c.text || '').join('') || '';
        reportJson = JSON.parse(rt.replace(/```json|```/g, '').trim());
      } catch(e) {
        console.error('Fallback report generation failed:', e.message);
        reportJson = { labSummary: 'Your report was received. Please contact support if you need assistance.', summary: 'Your report was received.' };
      }
    }

    // Build and send email
    const emailHtml = buildEmailHtml(reportJson, reportType);

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'HealthDecoded <onboarding@resend.dev>',
        to: [email],
        subject: reportType === 'lab' ? 'Your Blood Test Analysis — HealthDecoded' : 'Your Health Consultation Report — HealthDecoded',
        html: emailHtml,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log('Email sent:', emailResult);
    return { statusCode: 200, body: 'OK' };

  } catch (error) {
    console.error('webhook error:', error.message);
    return { statusCode: 500, body: error.message };
  }
};

function buildEmailHtml(report, reportType) {
  const isLab = reportType === 'lab';
  const statusColors = { optimal:'#16a34a', normal:'#0369a1', borderline:'#ca8a04', concerning:'#ea580c', critical:'#dc2626' };

  let biomarkersHtml = '';
  if (isLab && report.biomarkers?.length > 0) {
    const categories = [...new Set(report.biomarkers.map(b => b.category))];
    categories.forEach(cat => {
      biomarkersHtml += `<h3 style="color:#1A5276;font-size:16px;margin:24px 0 12px;">${cat}</h3>`;
      report.biomarkers.filter(b => b.category === cat).forEach(b => {
        const col = statusColors[b.status] || '#64748b';
        biomarkersHtml += `<div style="border:1px solid #e2e8f0;border-radius:8px;margin-bottom:12px;overflow:hidden;">
          <div style="background:#f8fafc;padding:10px 14px;">
            <strong style="color:#0f172a;">${b.name}</strong>
            <span style="color:#64748b;font-size:13px;margin-left:10px;">Value: <strong style="color:${col};">${b.value}</strong>${b.referenceRange ? ` · Ref: ${b.referenceRange}` : ''}${b.optimalRange ? ` · Optimal: ${b.optimalRange}` : ''}</span>
            <span style="float:right;background:white;color:${col};border:1px solid ${col};border-radius:8px;padding:2px 10px;font-size:12px;font-weight:700;">${b.status}</span>
          </div>
          <div style="padding:12px 14px;font-size:13px;color:#374151;line-height:1.6;">${b.interpretation}</div>
        </div>`;
      });
    });
  }

  let mealPlanHtml = '';
  if (isLab && report.mealPlan?.days?.length > 0) {
    mealPlanHtml = `<h2 style="color:#1A5276;font-size:20px;border-bottom:2px solid #2E86C1;padding-bottom:8px;margin-top:32px;">🥗 Your 7-Day Meal Plan</h2>
    <p style="color:#166534;background:#dcfce7;padding:10px;border-radius:6px;margin-bottom:12px;"><strong>Goal:</strong> ${report.mealPlan.goal}</p>
    ${report.mealPlan.days.map(d => `<div style="border:1px solid #bbf7d0;border-radius:8px;margin-bottom:10px;overflow:hidden;">
      <div style="background:#16a34a;padding:8px 14px;color:white;font-weight:700;">Day ${d.day} — ${d.dayName}</div>
      <table width="100%" style="border-collapse:collapse;padding:10px;">
        <tr>${[['🌅 Breakfast',d.breakfast],['☀️ Lunch',d.lunch]].map(([l,m]) => m ? `<td width="50%" style="background:#f0fdf4;border-radius:6px;padding:8px;vertical-align:top;"><div style="font-size:11px;font-weight:700;color:#16a34a;">${l}</div><div style="font-size:12px;font-weight:600;color:#1e293b;">${m.meal}</div><div style="font-size:11px;color:#64748b;font-style:italic;">${m.why}</div></td>` : '<td></td>').join('')}</tr>
        <tr>${[['🌙 Dinner',d.dinner],['🍎 Snack',d.snack]].map(([l,m]) => m ? `<td width="50%" style="background:#f0fdf4;border-radius:6px;padding:8px;vertical-align:top;"><div style="font-size:11px;font-weight:700;color:#16a34a;">${l}</div><div style="font-size:12px;font-weight:600;color:#1e293b;">${m.meal}</div><div style="font-size:11px;color:#64748b;font-style:italic;">${m.why}</div></td>` : '<td></td>').join('')}</tr>
      </table>
    </div>`).join('')}`;
  }

  let actionCardsHtml = '';
  if (!isLab && report.actionCards?.length > 0) {
    report.actionCards.forEach(card => {
      actionCardsHtml += `<div style="border:1.5px solid #e2e8f0;border-radius:10px;margin-bottom:14px;overflow:hidden;">
        <div style="background:#f8fafc;padding:10px 14px;"><strong>${card.finding}</strong>${card.retestIn ? `<span style="float:right;font-size:11px;color:#64748b;">Retest in ${card.retestIn}</span>` : ''}</div>
        <div style="padding:12px 14px;font-size:13px;color:#374151;">${card.explanation}</div>
        ${(card.actions||[]).map(a => `<div style="margin:0 14px 10px;padding:10px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;">
          <strong style="color:#16a34a;">${a.title}</strong><br>
          <span style="font-size:12px;">${a.detail}</span>
          ${a.dose ? `<br><span style="font-size:11px;color:#16a34a;font-weight:600;">📏 ${a.dose}</span>` : ''}
          ${a.pharmacistNote ? `<br><span style="font-size:11px;color:#ea580c;">🏪 ${a.pharmacistNote}</span>` : ''}
        </div>`).join('')}
      </div>`;
    });
  }

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#f0f9ff;margin:0;padding:20px;">
<div style="max-width:680px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
  <div style="background:linear-gradient(135deg,#0f172a,#1e3a5f);padding:32px 32px 24px;">
    <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;color:#7dd3fc;text-transform:uppercase;margin-bottom:6px;">HEALTHDECODED</div>
    <h1 style="color:white;font-size:24px;margin:0 0 8px;">${isLab ? 'Your Blood Test Analysis' : 'Your Health Consultation Report'}</h1>
    <p style="color:#94a3b8;font-size:13px;margin:0;">AI-generated educational content · Not a medical diagnosis</p>
  </div>
  <div style="padding:32px;">
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin-bottom:24px;font-size:12px;color:#92400e;">
      <strong>Important:</strong> This report is AI-generated for educational purposes only. Not a diagnosis. Always consult a healthcare professional.
    </div>
    ${isLab && report.overallScore ? `<div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:80px;height:80px;border-radius:50%;background:${report.overallScore>=70?'#dcfce7':report.overallScore>=50?'#fef9c3':'#fee2e2'};border:3px solid ${report.overallScore>=70?'#16a34a':report.overallScore>=50?'#ca8a04':'#dc2626'};line-height:80px;font-size:24px;font-weight:800;color:${report.overallScore>=70?'#16a34a':report.overallScore>=50?'#ca8a04':'#dc2626'};">${report.overallScore}</div>
      <div style="font-size:12px;color:#64748b;margin-top:4px;">Overall Score</div>
    </div>` : ''}
    ${report.summary||report.labSummary ? `<div style="background:#f0f9ff;border:1.5px solid #bae6fd;border-radius:10px;padding:16px;margin-bottom:24px;font-size:14px;color:#0369a1;line-height:1.6;">${report.summary||report.labSummary}</div>` : ''}
    ${isLab&&report.keyFindings?.length>0 ? `<h2 style="color:#1A5276;font-size:20px;border-bottom:2px solid #2E86C1;padding-bottom:8px;">🎯 Key Findings</h2>${report.keyFindings.map((f,i)=>`<div style="padding:8px 12px;background:#f0f9ff;border-left:3px solid #0ea5e9;margin-bottom:8px;font-size:13px;border-radius:4px;">${i+1}. ${f}</div>`).join('')}` : ''}
    ${biomarkersHtml ? `<h2 style="color:#1A5276;font-size:20px;border-bottom:2px solid #2E86C1;padding-bottom:8px;margin-top:32px;">🔬 Biomarker Analysis</h2>${biomarkersHtml}` : ''}
    ${actionCardsHtml ? `<h2 style="color:#1A5276;font-size:20px;border-bottom:2px solid #2E86C1;padding-bottom:8px;margin-top:32px;">🎯 Action Plan</h2>${actionCardsHtml}` : ''}
    ${mealPlanHtml}
    ${(report.doctorTalkingPoints||report.doctorQuestions)?.length>0 ? `<h2 style="color:#1A5276;font-size:20px;border-bottom:2px solid #2E86C1;padding-bottom:8px;margin-top:32px;">💬 Questions for Your Doctor</h2>${(report.doctorTalkingPoints||report.doctorQuestions||[]).map(q=>`<div style="padding:8px 12px;background:#f0f9ff;border-left:3px solid #0ea5e9;margin-bottom:8px;font-size:13px;border-radius:4px;">${q}</div>`).join('')}` : ''}
    ${isLab&&report.retestPlan ? `<h2 style="color:#1A5276;font-size:20px;border-bottom:2px solid #2E86C1;padding-bottom:8px;margin-top:32px;">🔁 When to Retest</h2>
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px;">
      <strong style="color:#ca8a04;">Recommended: ${report.retestPlan.timeframe}</strong><br>
      <span style="font-size:13px;">${report.retestPlan.reason}</span>
    </div>` : ''}
    <div style="background:#faf5ff;border:1.5px solid #e9d5ff;border-radius:12px;padding:20px;margin-top:32px;text-align:center;">
      <div style="font-size:15px;font-weight:700;color:#7c3aed;margin-bottom:8px;">${isLab?'Want a deeper analysis?':'Want to analyse your blood tests too?'}</div>
      <div style="font-size:13px;color:#6b21a8;margin-bottom:14px;">${isLab?'Combine blood results with symptoms, medications, and health history.':'Upload your blood test for a full biomarker analysis.'}</div>
      <a href="https://healthdecoded.netlify.app" style="background:#7c3aed;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">${isLab?'🩺 Start Full Consultation — €9.90':'🔬 Analyse My Blood Test — €4.90'}</a>
    </div>
  </div>
  <div style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;text-align:center;">
    <div style="font-size:13px;font-weight:700;color:#0ea5e9;margin-bottom:4px;">HealthDecoded</div>
    <div style="font-size:11px;color:#94a3b8;">healthdecoded.netlify.app · AI-generated educational content only · Not a medical device</div>
  </div>
</div>
</body></html>`;
}
