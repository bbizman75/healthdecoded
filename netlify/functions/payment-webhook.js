// Netlify Background Function — 15 minute timeout
// Filename MUST end in -background.mjs

export async function handler(event) {
  console.log("generate-report-background triggered");

  try {
    const { email, reportType, teaser } = JSON.parse(event.body);
    const isLab = reportType === "lab";
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!email || !ANTHROPIC_API_KEY) {
      console.error("Missing email or API key");
      return { statusCode: 200, body: "OK" };
    }

    // Generate report with Claude
    console.log("Calling Claude API...");
    const prompt = isLab
      ? `You are an expert clinical lab results interpreter. Based on this blood test preview: "${teaser}"

Generate a comprehensive health report as if you have full access to the blood test. Make it specific, detailed and educational.

Return ONLY this JSON (no markdown):
{
  "labSummary": "2-3 sentence overall summary",
  "overallScore": 72,
  "biomarkers": [
    {"name":"Complete Blood Count","value":"See report","referenceRange":"varies","optimalRange":"varies","status":"normal","category":"Blood Count","interpretation":"Your complete blood count shows the overall health of your blood cells including red blood cells, white blood cells and platelets. Based on the preview findings, your immune system markers show an interesting pattern worth monitoring."},
    {"name":"White Blood Cell Count","value":"elevated pattern noted","referenceRange":"4.0-11.0 x10³/µL","optimalRange":"5.0-8.0 x10³/µL","status":"borderline","category":"Blood Count","interpretation":"Your white blood cell count shows a pattern that deserves attention. Elevated WBC can indicate your immune system is actively responding to something — this could be a minor infection, inflammation, or stress response. This warrants monitoring and discussion with your doctor."},
    {"name":"Lymphocyte Percentage","value":"see detailed analysis","referenceRange":"20-40%","optimalRange":"25-35%","status":"borderline","category":"Blood Count","interpretation":"Your lymphocyte percentage is at an interesting threshold compared to previous results. Lymphocytes are key immune cells — changes in their percentage can reflect immune system activity, stress, or viral exposure. Tracking this over time is important."}
  ],
  "keyFindings": [
    "Immune system markers showing pattern worth monitoring",
    "Blood cell indicators at interesting thresholds vs previous results",
    "Overall blood health picture is largely reassuring with specific areas to watch"
  ],
  "recommendedTests": [
    "Full repeat blood count in 6-8 weeks to track changes",
    "CRP inflammation marker if not already tested",
    "Vitamin D level if not recently checked"
  ],
  "doctorTalkingPoints": [
    "Ask about the white blood cell pattern and what might be causing it",
    "Request comparison with your February 2023 results",
    "Discuss whether any follow-up testing is recommended"
  ],
  "retestPlan": {
    "timeframe": "6-8 weeks",
    "reason": "To track the patterns identified and ensure values are moving in the right direction",
    "markersToRetest": ["Complete Blood Count", "WBC differential", "Lymphocytes"],
    "expectedImprovements": "With proper nutrition and lifestyle adjustments, immune markers typically normalize within 6-8 weeks"
  },
  "mealPlan": {
    "goal": "Support immune system health and optimize blood cell production",
    "keyNutrients": ["Vitamin C for immune support", "Iron for red blood cell production", "Zinc for immune function", "B12 for cell health"],
    "generalGuidelines": ["Eat a rainbow of vegetables daily", "Include lean proteins at every meal", "Stay well hydrated", "Minimize processed foods and sugar"],
    "days": [
      {"day":1,"dayName":"Monday","breakfast":{"meal":"Greek yogurt with berries and pumpkin seeds","why":"Zinc and antioxidants support immune function"},"lunch":{"meal":"Spinach salad with grilled chicken, chickpeas and lemon dressing","why":"Iron, protein and vitamin C for blood health"},"dinner":{"meal":"Salmon with roasted broccoli and sweet potato","why":"Omega-3s reduce inflammation, vitamin C aids iron absorption"},"snack":{"meal":"Orange and handful of almonds","why":"Vitamin C and healthy fats for sustained energy"}},
      {"day":2,"dayName":"Tuesday","breakfast":{"meal":"Oatmeal with walnuts, banana and cinnamon","why":"Complex carbs and omega-3s for sustained energy and inflammation control"},"lunch":{"meal":"Lentil soup with whole grain bread","why":"Plant-based iron and fiber for gut and blood health"},"dinner":{"meal":"Turkey meatballs with zucchini noodles and tomato sauce","why":"Lean protein and lycopene antioxidants"},"snack":{"meal":"Apple with almond butter","why":"Fiber and healthy fats for blood sugar stability"}},
      {"day":3,"dayName":"Wednesday","breakfast":{"meal":"Scrambled eggs with spinach and whole grain toast","why":"B12, iron and protein essential for blood cell production"},"lunch":{"meal":"Tuna wrap with avocado and mixed greens","why":"Omega-3s and folate support cell health"},"dinner":{"meal":"Chicken stir-fry with bell peppers and brown rice","why":"Vitamin C triples iron absorption from plant sources"},"snack":{"meal":"Kiwi and pumpkin seeds","why":"Vitamin C and zinc for immune strength"}},
      {"day":4,"dayName":"Thursday","breakfast":{"meal":"Smoothie with spinach, frozen berries, banana and protein powder","why":"Iron, antioxidants and protein in one meal"},"lunch":{"meal":"Quinoa bowl with roasted vegetables and hummus","why":"Complete protein and minerals for cell repair"},"dinner":{"meal":"Baked cod with asparagus and quinoa","why":"Lean protein and folate support healthy blood cells"},"snack":{"meal":"Trail mix with nuts and dried cranberries","why":"Mixed nutrients for sustained immune support"}},
      {"day":5,"dayName":"Friday","breakfast":{"meal":"Whole grain pancakes with fresh strawberries","why":"Vitamin C and complex carbs for energy and immunity"},"lunch":{"meal":"Black bean soup with avocado toast","why":"Plant iron, healthy fats and fiber"},"dinner":{"meal":"Grass-fed beef with roasted root vegetables","why":"Heme iron is most bioavailable form for blood health"},"snack":{"meal":"Greek yogurt with honey and walnuts","why":"Probiotics and omega-3s for gut and immune health"}},
      {"day":6,"dayName":"Saturday","breakfast":{"meal":"Vegetable omelette with feta cheese","why":"Protein, B12 and calcium for overall cellular health"},"lunch":{"meal":"Mediterranean grain bowl with chickpeas and tahini","why":"Plant protein, iron and healthy fats"},"dinner":{"meal":"Lamb chops with mint, roasted carrots and couscous","why":"Rich in zinc and B vitamins for immune and blood support"},"snack":{"meal":"Celery with hummus and sunflower seeds","why":"Minerals and protein for cell maintenance"}},
      {"day":7,"dayName":"Sunday","breakfast":{"meal":"Acai bowl with granola, banana and mixed berries","why":"Powerful antioxidants to protect blood cells from oxidative stress"},"lunch":{"meal":"Chicken and vegetable soup with barley","why":"Zinc from chicken, iron from barley, vitamins from vegetables"},"dinner":{"meal":"Baked salmon with dill, steamed broccoli and sweet potato mash","why":"Omega-3s, vitamin C and beta-carotene for complete immune support"},"snack":{"meal":"Dark chocolate and mixed nuts","why":"Magnesium and antioxidants to end the week strong"}}
    ]
  }
}`
      : `You are an AI health consultant. Based on this health consultation preview: "${teaser}"

Generate a comprehensive health consultation report.

Return ONLY this JSON (no markdown):
{
  "urgency": {"level": 2, "label": "Book appointment within 2-4 weeks", "color": "yellow", "message": "Your symptoms indicate patterns worth investigating with a healthcare professional. No immediate emergency, but timely attention is recommended.", "showActions": true},
  "summary": "Based on your consultation, several patterns have been identified that warrant attention. Your symptoms suggest areas where targeted lifestyle interventions and professional guidance could make a significant difference.",
  "healthScore": {"metabolic": 65, "weight": 70, "sleep": 60, "overall": 65},
  "actionCards": [
    {
      "finding": "Symptom Pattern Analysis",
      "severity": "borderline",
      "explanation": "Your reported symptoms show interconnected patterns that are common when the body is under stress or nutritional imbalance. These patterns often respond well to targeted interventions.",
      "actions": [
        {"type": "lifestyle", "title": "Establish consistent sleep schedule", "detail": "Go to bed and wake at the same time daily, even weekends. Poor sleep amplifies almost every other symptom.", "dose": "", "doNotUseIf": [], "pharmacistNote": ""},
        {"type": "diet", "title": "Anti-inflammatory nutrition", "detail": "Reduce processed foods, increase omega-3 rich foods (salmon, walnuts, flaxseed) and colorful vegetables. Aim for 7-9 servings of vegetables and fruit daily.", "dose": "", "doNotUseIf": [], "pharmacistNote": ""},
        {"type": "doctor", "title": "Book a comprehensive check-up", "detail": "Request a full blood panel including CBC, thyroid (TSH), vitamin D, B12, ferritin, glucose and CRP inflammation marker.", "dose": "", "doNotUseIf": [], "pharmacistNote": ""}
      ],
      "retestIn": "6-8 weeks after implementing changes"
    }
  ],
  "concerns": [
    {"name": "Nutritional deficiencies", "confidence": "Medium", "reasoning": "Symptom patterns are consistent with common deficiencies including vitamin D, iron, B12 or magnesium."},
    {"name": "Stress response", "confidence": "Medium", "reasoning": "The combination of symptoms suggests the body may be in a prolonged stress state affecting multiple systems."}
  ],
  "suggestedTests": [
    {"test": "Full blood count (CBC)", "reason": "Baseline for all blood cell levels"},
    {"test": "Thyroid panel (TSH, Free T4)", "reason": "Thyroid affects energy, weight, mood and many other functions"},
    {"test": "Vitamin D", "reason": "Deficiency is extremely common and affects immunity, mood and energy"},
    {"test": "Ferritin (iron stores)", "reason": "Low ferritin causes fatigue and hair loss even without anaemia"},
    {"test": "HbA1c", "reason": "Blood sugar regulation check"},
    {"test": "CRP", "reason": "Silent inflammation marker"}
  ],
  "doctorQuestions": [
    "Could my symptoms be related to a nutritional deficiency?",
    "Would you recommend a full blood panel including thyroid and vitamin levels?",
    "Are there any lifestyle changes you'd prioritize based on my symptoms?",
    "Should I consider seeing a specialist for any of these symptoms?"
  ],
  "homeEssentials": [
    {"item": "Vitamin D3 + K2", "reason": "Deficiency affects up to 80% of people and impacts energy, immunity and mood"},
    {"item": "Magnesium glycinate", "reason": "Most people are deficient — supports sleep, stress response and muscle function"},
    {"item": "Omega-3 fish oil", "reason": "Anti-inflammatory and supports brain, heart and joint health"}
  ]
}`;

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 6000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const claudeData = await claudeRes.json();
    console.log("Claude response status:", claudeRes.status);

    const reportText = claudeData.content?.map((c) => c.text || "").join("") || "";
    let report = null;
    try {
      report = JSON.parse(reportText.replace(/```json|```/g, "").trim());
      console.log("Report parsed successfully");
    } catch (e) {
      console.error("Failed to parse Claude response:", e.message);
      console.error("Raw response:", reportText.substring(0, 500));
    }

    // Build email HTML (copied from original payment-webhook.js)
    let reportHtml = "";

    if (report && isLab && report.labSummary) {
      const statusColors = {
        optimal: { bg: "#dcfce7", color: "#16a34a", label: "Optimal" },
        normal: { bg: "#dbeafe", color: "#1d4ed8", label: "Normal" },
        borderline: { bg: "#fef9c3", color: "#ca8a04", label: "Borderline" },
        concerning: { bg: "#fff7ed", color: "#ea580c", label: "Concerning" },
        critical: { bg: "#fee2e2", color: "#dc2626", label: "Critical" },
      };
      const scoreCol = report.overallScore >= 70 ? "#16a34a" : report.overallScore >= 50 ? "#ca8a04" : "#dc2626";
      const scoreBg = report.overallScore >= 70 ? "#dcfce7" : report.overallScore >= 50 ? "#fef9c3" : "#fee2e2";
      const categories = [...new Set((report.biomarkers || []).map((b) => b.category))];

      let biomarkersHtml = "";
      categories.forEach((cat) => {
        biomarkersHtml += `<h3 style="color:#7c3aed;font-size:15px;margin:20px 0 10px;border-bottom:2px solid #e2e8f0;padding-bottom:6px;">${cat}</h3>`;
        report.biomarkers.filter((b) => b.category === cat).forEach((b) => {
          const sc = statusColors[b.status] || statusColors.normal;
          biomarkersHtml += `
            <div style="border-radius:8px;border:1px solid #e2e8f0;margin-bottom:10px;overflow:hidden;">
              <div style="background:${sc.bg};padding:10px 14px;">
                <strong style="font-size:14px;color:#0f172a;">${b.name}</strong>
                <span style="font-size:12px;color:#64748b;margin-left:8px;">
                  ${b.value ? `Value: <strong style="color:${sc.color};">${b.value}</strong>` : ""}
                  ${b.referenceRange ? ` · Ref: ${b.referenceRange}` : ""}
                  ${b.optimalRange ? ` · Optimal: ${b.optimalRange}` : ""}
                </span>
                <span style="float:right;background:#fff;color:${sc.color};font-size:11px;font-weight:700;padding:2px 8px;border-radius:8px;">${sc.label}</span>
              </div>
              <div style="padding:10px 14px;font-size:13px;color:#374151;line-height:1.6;">${b.interpretation}</div>
            </div>`;
        });
      });

      let mealPlanHtml = "";
      if (report.mealPlan) {
        mealPlanHtml = `
          <h2 style="color:#16a34a;font-size:16px;margin:24px 0 10px;border-bottom:2px solid #e2e8f0;padding-bottom:6px;">🥗 Your 7-Day Meal Plan</h2>
          <div style="background:#dcfce7;border-radius:8px;padding:10px 14px;margin-bottom:14px;font-size:13px;color:#166534;"><strong>Goal:</strong> ${report.mealPlan.goal}</div>
          ${(report.mealPlan.days || []).map((d) => `
            <div style="border:1px solid #bbf7d0;border-radius:8px;margin-bottom:8px;overflow:hidden;">
              <div style="background:#16a34a;padding:8px 12px;font-weight:700;font-size:13px;color:#fff;">Day ${d.day} — ${d.dayName}</div>
              <div style="padding:10px 12px;">
                ${[["🌅 Breakfast", d.breakfast], ["☀️ Lunch", d.lunch], ["🌙 Dinner", d.dinner], ["🍎 Snack", d.snack]].map(([lbl, data]) => data ? `
                  <div style="background:#f0fdf4;border-radius:6px;padding:8px;margin-bottom:6px;">
                    <div style="font-size:11px;font-weight:700;color:#16a34a;">${lbl}</div>
                    <div style="font-size:12px;font-weight:600;color:#1e293b;">${data.meal}</div>
                    <div style="font-size:11px;color:#64748b;font-style:italic;">${data.why}</div>
                  </div>` : "").join("")}
              </div>
            </div>`).join("")}`;
      }

      reportHtml = `
        <div style="background:${scoreBg};border:2px solid ${scoreCol};border-radius:12px;padding:20px;margin-bottom:20px;">
          <div style="display:flex;align-items:center;gap:16px;">
            <div style="width:60px;height:60px;border-radius:50%;background:#fff;border:3px solid ${scoreCol};display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:${scoreCol};flex-shrink:0;">${report.overallScore}</div>
            <div>
              <div style="font-weight:700;font-size:15px;color:#0f172a;margin-bottom:6px;">Overall Health Score</div>
              <div style="font-size:13px;color:#374151;line-height:1.6;">${report.labSummary}</div>
            </div>
          </div>
        </div>
        ${report.keyFindings?.length ? `
          <h2 style="color:#0369a1;font-size:16px;margin:24px 0 10px;border-bottom:2px solid #e2e8f0;padding-bottom:6px;">🎯 Key Findings</h2>
          ${report.keyFindings.map((f, i) => `<div style="margin-bottom:8px;padding:8px 12px;background:#f0f9ff;border-left:3px solid #0ea5e9;border-radius:4px;font-size:13px;">${i + 1}. ${f}</div>`).join("")}` : ""}
        <h2 style="color:#7c3aed;font-size:16px;margin:24px 0 10px;border-bottom:2px solid #e2e8f0;padding-bottom:6px;">🔬 Biomarker Analysis</h2>
        ${biomarkersHtml}
        ${report.retestPlan ? `
          <h2 style="color:#ca8a04;font-size:16px;margin:24px 0 10px;border-bottom:2px solid #e2e8f0;padding-bottom:6px;">🔁 When to Retest</h2>
          <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px;">
            <div style="font-size:16px;font-weight:800;color:#ca8a04;margin-bottom:6px;">Recommended: ${report.retestPlan.timeframe}</div>
            <div style="font-size:13px;margin-bottom:8px;">${report.retestPlan.reason}</div>
            <div style="font-size:13px;"><strong>Expected improvements:</strong> ${report.retestPlan.expectedImprovements}</div>
            ${report.retestPlan.markersToRetest?.length ? `<div style="margin-top:10px;">${report.retestPlan.markersToRetest.map(m => `<span style="display:inline-block;font-size:11px;background:#fff;color:#92400e;padding:3px 10px;border-radius:8px;border:1px solid #fde68a;margin:3px;">${m}</span>`).join("")}</div>` : ""}
          </div>` : ""}
        ${mealPlanHtml}
        ${report.doctorTalkingPoints?.length ? `
          <h2 style="color:#0369a1;font-size:16px;margin:24px 0 10px;border-bottom:2px solid #e2e8f0;padding-bottom:6px;">💬 What to Discuss with Your Doctor</h2>
          ${report.doctorTalkingPoints.map(q => `<div style="font-size:13px;padding:8px 12px;background:#f0f9ff;border-radius:5px;border-left:3px solid #0ea5e9;margin-bottom:6px;">${q}</div>`).join("")}` : ""}
        ${report.recommendedTests?.length ? `
          <h2 style="color:#7c3aed;font-size:16px;margin:24px 0 10px;border-bottom:2px solid #e2e8f0;padding-bottom:6px;">🔬 Recommended Tests</h2>
          ${report.recommendedTests.map(t => `<div style="font-size:13px;margin-bottom:6px;">→ ${t}</div>`).join("")}` : ""}
      `;
    } else if (report && !isLab) {
      const urgColors = {
        green: { bg: "#dcfce7", border: "#16a34a", text: "#14532d" },
        yellow: { bg: "#fef9c3", border: "#ca8a04", text: "#713f12" },
        orange: { bg: "#fff7ed", border: "#ea580c", text: "#7c2d12" },
        red: { bg: "#fee2e2", border: "#dc2626", text: "#7f1d1d" },
      };
      const uc = urgColors[report.urgency?.color] || urgColors.green;
      reportHtml = `
        <div style="background:${uc.bg};border:2px solid ${uc.border};border-radius:12px;padding:16px;margin-bottom:20px;">
          <div style="font-size:17px;font-weight:800;color:${uc.text};">Urgency Level ${report.urgency?.level}/5 — ${report.urgency?.label}</div>
          <div style="font-size:13px;color:${uc.text};line-height:1.6;margin-top:8px;">${report.urgency?.message}</div>
        </div>
        ${report.summary ? `<div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:14px;margin-bottom:16px;font-size:14px;color:#0369a1;line-height:1.6;">${report.summary}</div>` : ""}
        ${report.actionCards?.length ? `
          <h2 style="color:#0f172a;font-size:16px;margin:24px 0 10px;">🎯 Action Plan</h2>
          ${report.actionCards.map(card => `
            <div style="border:1px solid #e2e8f0;border-radius:10px;margin-bottom:12px;overflow:hidden;">
              <div style="background:#f8fafc;padding:10px 14px;font-weight:700;font-size:14px;">${card.finding}</div>
              <div style="padding:10px 14px;font-size:13px;color:#374151;">${card.explanation}</div>
              ${card.actions?.map(a => `<div style="margin:0 14px 10px;background:#f0f9ff;border-radius:8px;padding:10px;"><div style="font-weight:700;font-size:13px;color:#0369a1;">${a.title}</div><div style="font-size:13px;">${a.detail}</div></div>`).join("") || ""}
            </div>`).join("")}` : ""}
        ${report.doctorQuestions?.length ? `
          <h2 style="color:#0369a1;font-size:16px;margin:24px 0 10px;">💬 Questions for Your Doctor</h2>
          ${report.doctorQuestions.map(q => `<div style="font-size:13px;padding:8px 12px;background:#f0f9ff;border-radius:5px;border-left:3px solid #0ea5e9;margin-bottom:6px;">${q}</div>`).join("")}` : ""}
        ${report.suggestedTests?.length ? `
          <h2 style="color:#7c3aed;font-size:16px;margin:24px 0 10px;">🔬 Suggested Tests</h2>
          ${report.suggestedTests.map(t => `<div style="font-size:13px;margin-bottom:6px;">→ <strong>${t.test}</strong> — ${t.reason}</div>`).join("")}` : ""}
      `;
    } else {
      reportHtml = `<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:20px;font-size:14px;color:#9a3412;">
        We encountered an issue generating your report. Please contact us and we will send your report manually within 24 hours.
      </div>`;
    }

    // Send full report email
    console.log("Sending full report email to:", email);
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "HealthDecoded <onboarding@resend.dev>",
        to: email,
        subject: `📊 Your HealthDecoded ${isLab ? "Blood Test Analysis" : "Health Consultation"} Report`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;padding:32px;color:#1e293b;">
            <div style="text-align:center;margin-bottom:32px;">
              <h1 style="color:#0ea5e9;font-size:28px;margin-bottom:8px;">Health<span style="color:#0f172a;">Decoded</span></h1>
              <p style="color:#64748b;font-size:14px;">AI-powered health analysis — educational content only</p>
            </div>
            <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin-bottom:24px;font-size:12px;color:#92400e;">
              <strong>Important:</strong> This report is AI-generated for educational purposes only. Not a medical diagnosis. Always consult a qualified healthcare professional.
            </div>
            <h2 style="color:#0f172a;font-size:20px;margin-bottom:20px;">Your ${isLab ? "Blood Test Analysis" : "Health Consultation"} Report</h2>
            ${reportHtml}
            <div style="margin-top:32px;padding:16px;background:#f1f5f9;border-radius:8px;font-size:11px;color:#64748b;text-align:center;">
              HealthDecoded · AI-generated educational content only · Not a medical device<br/>Always consult a qualified healthcare professional
            </div>
          </div>
        `,
      }),
    });

    console.log("Full report email sent successfully to:", email);
    return { statusCode: 200, body: "OK" };

  } catch (err) {
    console.error("generate-report-background error:", err);
    return { statusCode: 200, body: "OK" };
  }
}
