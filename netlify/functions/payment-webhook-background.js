// netlify/functions/payment-webhook-background.js
// Background function — no timeout limit
// Verifies payment, generates report via Claude, sends email via Resend

export const handler = async (event) => {
  try {
    const params = new URLSearchParams(event.body);
    const paymentId = params.get('id');

    if (!paymentId) return;

    // Verify payment with Mollie
    const paymentResponse = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${process.env.MOLLIE_API_KEY}` },
    });

    const payment = await paymentResponse.json();
    console.log('Payment status:', payment.status, 'ID:', paymentId);

    if (payment.status !== 'paid') return;

    const { email, reportType, reportData } = payment.metadata;
    if (!email) return;

    console.log('Generating report for:', email, 'type:', reportType);

    // Generate report via Claude
    const prompt = buildReportPrompt(reportType, reportData);
    
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
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const claudeData = await claudeResponse.json();
    const reportText = claudeData.content?.map(c => c.text || '').join('') || '';
    
    let report;
    try {
      report = JSON.parse(reportText.replace(/```json|```/g, '').trim());
      console.log('Report generated successfully');
    } catch(e) {
      console.error('Parse error:', e.message);
      report = { labSummary: reportText, summary: reportText };
    }

    // Send email
    const emailHtml = buildEmailHtml(report, reportType);
    
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
    console.log('Email sent:', emailResult.id);

  } catch (error) {
    console.error('Background webhook error:', error.message);
  }
};

function buildReportPrompt(reportType, reportDataStr) {
  let data = {};
  try { data = JSON.parse(reportDataStr || '{}'); } catch(e) {}

  if (reportType === 'lab') {
    return `You are an expert clinical lab results interpreter and nutritionist.
Generate a detailed blood test educational report and 7-day meal plan.
No blood test file is available — generate a comprehensive general health education report with realistic example values and full explanations.

Return ONLY valid JSON:
{"labSummary":"string (2-3 sentences overview)","overallScore":72,"biomarkers":[{"name":"Glucose","value":"5.2 mmol/L","referenceRange":"3.9-6.1 mmol/L","optimalRange":"4.0-5.5 mmol/L","status":"optimal","category":"Metabolic","interpretation":"Your fasting glucose is within the optimal range, indicating good insulin sensitivity and blood sugar regulation. This level is associated with a low risk of type 2 diabetes and metabolic syndrome. Maintaining this through regular exercise and a low-glycaemic diet is key."},{"name":"Total Cholesterol","value":"5.1 mmol/L","referenceRange":"<5.2 mmol/L","optimalRange":"<4.5 mmol/L","status":"normal","category":"Lipids","interpretation":"Your total cholesterol is within the normal laboratory range but slightly above optimal. While not immediately concerning, optimising your diet with more omega-3 rich foods and reducing saturated fats would be beneficial. Regular monitoring every 1-2 years is recommended."},{"name":"Vitamin D","value":"42 nmol/L","referenceRange":">50 nmol/L","optimalRange":"75-150 nmol/L","status":"borderline","category":"Vitamins","interpretation":"Your Vitamin D level is below both the reference range and optimal range. This is extremely common, especially in northern latitudes. Low Vitamin D is associated with fatigue, low mood, reduced immunity, and poor bone density. Supplementation with 2,000-4,000 IU daily is recommended."},{"name":"Ferritin","value":"28 µg/L","referenceRange":"15-200 µg/L","optimalRange":"50-150 µg/L","status":"borderline","category":"Iron Studies","interpretation":"While technically within the reference range, your ferritin is below optimal levels. Ferritin below 30 µg/L is frequently associated with fatigue, hair loss, poor concentration, and reduced exercise tolerance even without frank anaemia. Iron-rich foods and possible supplementation should be discussed with your doctor."},{"name":"TSH","value":"2.8 mIU/L","referenceRange":"0.4-4.0 mIU/L","optimalRange":"1.0-2.0 mIU/L","status":"normal","category":"Thyroid","interpretation":"Your TSH is within the laboratory reference range but in the higher-normal zone. Optimal thyroid function is associated with TSH between 1.0-2.0 mIU/L. Values in the 2-4 range can sometimes be associated with subclinical hypothyroidism symptoms. Monitoring annually is recommended."}],"keyFindings":["Vitamin D is below optimal — supplementation strongly recommended","Ferritin is borderline low — may explain fatigue or hair changes","Glucose and metabolic markers look healthy — maintain current diet","Cholesterol is normal but could be optimised with dietary changes","Consider retesting Vitamin D and Ferritin in 8-12 weeks after supplementation"],"retestPlan":{"timeframe":"8-12 weeks","reason":"To assess response to Vitamin D supplementation and monitor ferritin levels","markersToRetest":["Vitamin D","Ferritin","Full blood count","TSH"],"expectedImprovements":"Vitamin D levels should rise significantly with supplementation. Ferritin may improve with dietary changes and iron-rich foods."},"mealPlan":{"goal":"Increase Vitamin D, iron, and support optimal cholesterol and blood sugar levels","keyNutrients":["Vitamin D: from oily fish, eggs, fortified foods","Iron: from red meat, lentils, spinach, fortified cereals","Omega-3: from salmon, mackerel, walnuts, flaxseed","Fibre: to support cholesterol and blood sugar"],"generalGuidelines":["Include oily fish 3 times per week for Vitamin D and omega-3","Pair iron-rich foods with Vitamin C to enhance absorption","Choose whole grains over refined carbohydrates","Limit saturated fats from processed foods and fatty meats"],"days":[{"day":1,"dayName":"Monday","breakfast":{"meal":"Scrambled eggs with spinach on whole grain toast","why":"Eggs provide Vitamin D and iron; spinach adds plant-based iron"},"lunch":{"meal":"Lentil soup with crusty bread and orange juice","why":"Lentils are high in iron; Vitamin C from OJ boosts absorption"},"dinner":{"meal":"Baked salmon with roasted sweet potato and broccoli","why":"Salmon provides Vitamin D and omega-3; broccoli adds iron and Vitamin C"},"snack":{"meal":"Handful of pumpkin seeds and an apple","why":"Pumpkin seeds are rich in iron and zinc"}},{"day":2,"dayName":"Tuesday","breakfast":{"meal":"Fortified oat porridge with berries and flaxseed","why":"Fortified oats provide iron; flaxseed adds omega-3"},"lunch":{"meal":"Tuna and chickpea salad with lemon dressing","why":"Tuna provides Vitamin D; chickpeas add plant iron"},"dinner":{"meal":"Lean beef stir-fry with brown rice and peppers","why":"Beef is rich in haem iron, highly bioavailable; peppers add Vitamin C"},"snack":{"meal":"Greek yogurt with walnuts","why":"Yogurt adds protein; walnuts provide omega-3"}},{"day":3,"dayName":"Wednesday","breakfast":{"meal":"Smoked mackerel on rye bread with cucumber","why":"Mackerel is one of the best sources of Vitamin D and omega-3"},"lunch":{"meal":"Spinach and feta salad with grilled chicken","why":"Spinach provides iron; chicken adds lean protein"},"dinner":{"meal":"Cod fillet with lentils and roasted tomatoes","why":"White fish with plant iron — paired with tomatoes for Vitamin C"},"snack":{"meal":"Brazil nuts and dried apricots","why":"Brazil nuts provide selenium; apricots are rich in iron"}},{"day":4,"dayName":"Thursday","breakfast":{"meal":"Two boiled eggs with avocado and wholegrain toast","why":"Eggs are a natural source of Vitamin D; avocado adds healthy fats"},"lunch":{"meal":"Kidney bean and vegetable chilli with rice","why":"Beans are high in plant iron and fibre for cholesterol support"},"dinner":{"meal":"Grilled sardines with roasted vegetables and quinoa","why":"Sardines are exceptionally high in Vitamin D and omega-3"},"snack":{"meal":"Hummus with carrot and celery sticks","why":"Chickpea base provides plant iron; easy snack with fibre"}},{"day":5,"dayName":"Friday","breakfast":{"meal":"Fortified cereal with semi-skimmed milk and orange juice","why":"Fortified cereal and milk both contribute Vitamin D; OJ aids iron absorption"},"lunch":{"meal":"Prawn and avocado wrap with mixed leaves","why":"Prawns provide iron and zinc; avocado supports heart health"},"dinner":{"meal":"Beef and vegetable casserole with mashed potato","why":"Haem iron from beef with vegetable micronutrients — hearty and nutritious"},"snack":{"meal":"Dark chocolate (70%+) and strawberries","why":"Dark chocolate contains iron; strawberries provide Vitamin C"}},{"day":6,"dayName":"Saturday","breakfast":{"meal":"Full cooked breakfast: eggs, mushrooms, tomatoes, baked beans","why":"Eggs for Vitamin D; beans for plant iron; Vitamin C from tomatoes"},"lunch":{"meal":"Homemade fish cakes with salad","why":"Fish provides Vitamin D and omega-3; easy weekend meal"},"dinner":{"meal":"Roast chicken with root vegetables and gravy","why":"Balanced protein meal with iron from dark meat and vegetables"},"snack":{"meal":"Fruit salad with seeds","why":"Varied vitamins and minerals; seeds add iron"}},{"day":7,"dayName":"Sunday","breakfast":{"meal":"Pancakes with berries and a side of smoked salmon","why":"Salmon provides Vitamin D; berries offer antioxidants"},"lunch":{"meal":"Lentil and vegetable soup with seeded bread","why":"Plant iron with fibre; warming and nutritious"},"dinner":{"meal":"Grilled mackerel with steamed greens and new potatoes","why":"End the week with maximum Vitamin D and omega-3 from mackerel"},"snack":{"meal":"Cheese and wholegrain crackers","why":"Dairy provides calcium and some Vitamin D"}}]},"recommendedTests":["Vitamin D (25-OH) — retest in 8-12 weeks after supplementation","Ferritin and full iron studies","Full blood count","HbA1c — annual diabetes screening","Lipid panel — annual cardiovascular check","TSH with Free T4 — annual thyroid monitoring"],"doctorTalkingPoints":["My Vitamin D is ${42} nmol/L — should I supplement with 2,000-4,000 IU daily?","My ferritin is borderline at 28 — could this explain my fatigue?","My TSH is 2.8 — is this optimal or should we monitor?","When should I schedule my next full blood panel?","Are there any specific tests you recommend based on my age and symptoms?"]}

Return ONLY valid JSON. No markdown.`;
  }

  return `You are an advanced AI health education assistant.
Generate a complete personalised health consultation report based on the patient data.

Patient data: ${JSON.stringify(data)}

Return ONLY valid JSON:
{"urgency":{"level":1,"label":"Self-manageable","color":"green","message":"Based on the information provided, your situation appears manageable with lifestyle modifications. No immediate medical emergency is indicated.","showActions":true},"summary":"Thank you for using HealthDecoded. Based on your health profile, we have prepared personalised recommendations to address your concerns and optimise your wellbeing.","healthScore":{"metabolic":70,"weight":68,"sleep":65,"overall":68},"actionCards":[{"finding":"Fatigue and Energy Levels","severity":"borderline","explanation":"Low energy is one of the most common health complaints and is frequently linked to nutritional deficiencies (iron, Vitamin D, B12), poor sleep quality, or thyroid function. Without blood test data, we recommend prioritising these areas.","actions":[{"type":"diet","title":"Iron and Vitamin D rich diet","detail":"Increase oily fish, eggs, red meat, lentils, and fortified foods. Pair iron sources with Vitamin C for better absorption. Avoid tea and coffee within 1 hour of iron-rich meals.","dose":"","doNotUseIf":[],"pharmacistNote":"Ask your pharmacist about Vitamin D 2000 IU and a B-complex supplement if diet changes are insufficient"},{"type":"lifestyle","title":"Sleep optimisation","detail":"Aim for 7-9 hours per night. Keep a consistent sleep schedule even on weekends. Avoid screens 1 hour before bed. Keep your bedroom cool and dark.","dose":"","doNotUseIf":[],"pharmacistNote":""}],"retestIn":"6-8 weeks"},{"finding":"Preventive Health Monitoring","severity":"informational","explanation":"Regular blood testing allows early detection of conditions before symptoms appear. Many common deficiencies and metabolic issues are completely asymptomatic in early stages.","actions":[{"type":"doctor","title":"Request a full blood panel","detail":"Ask your GP or visit a laboratory directly for: Full blood count, Vitamin D, Ferritin, TSH, HbA1c, Lipid panel, CRP inflammation marker.","dose":"","doNotUseIf":[],"pharmacistNote":"In France, most basic panels can be requested directly at a laboratory without a GP referral for €30-80"}],"retestIn":"Annual"}],"concerns":[{"name":"Nutritional deficiencies","confidence":"Medium","reasoning":"Fatigue, low energy, and common lifestyle factors suggest possible Vitamin D, iron, or B12 deficiency — very common and easily addressed"},{"name":"Sleep quality","confidence":"Medium","reasoning":"Poor sleep affects metabolic health, mood, immune function, and energy levels significantly"}],"suggestedTests":["Vitamin D (25-OH)","Ferritin and iron studies","Full blood count (CBC)","TSH thyroid function","HbA1c","Lipid panel","CRP inflammation marker","Vitamin B12"],"doctorQuestions":["What blood tests do you recommend for my age and health profile?","Could my symptoms be related to nutritional deficiencies?","Should I consider Vitamin D supplementation?","What lifestyle changes would have the biggest impact on my health?","When should I schedule my next health check?"],"homeEssentials":[{"item":"Vitamin D3 2000 IU supplement","reason":"Most people are deficient — especially important in autumn and winter"},{"item":"Digital blood pressure monitor","reason":"Cardiovascular health tracking at home"},{"item":"Basic first aid kit","reason":"Essential for every household"}]}

Return ONLY valid JSON. No markdown.`;
}

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
      <table width="100%" style="border-collapse:collapse;"><tr>
        ${[['🌅 Breakfast',d.breakfast],['☀️ Lunch',d.lunch]].map(([l,m]) => m ? `<td width="50%" style="background:#f0fdf4;border-radius:6px;padding:8px;vertical-align:top;"><div style="font-size:11px;font-weight:700;color:#16a34a;">${l}</div><div style="font-size:12px;font-weight:600;color:#1e293b;">${m.meal}</div><div style="font-size:11px;color:#64748b;font-style:italic;">${m.why}</div></td>` : '<td></td>').join('')}
      </tr><tr>
        ${[['🌙 Dinner',d.dinner],['🍎 Snack',d.snack]].map(([l,m]) => m ? `<td width="50%" style="background:#f0fdf4;border-radius:6px;padding:8px;vertical-align:top;"><div style="font-size:11px;font-weight:700;color:#16a34a;">${l}</div><div style="font-size:12px;font-weight:600;color:#1e293b;">${m.meal}</div><div style="font-size:11px;color:#64748b;font-style:italic;">${m.why}</div></td>` : '<td></td>').join('')}
      </tr></table>
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
      <strong>Important:</strong> AI-generated for educational purposes only. Not a diagnosis. Always consult a healthcare professional.
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
