export async function handler(event) {
  console.log("payment-webhook triggered");

  try {
    const params = new URLSearchParams(event.body);
    const paymentId = params.get("id");

    if (!paymentId) {
      console.error("No payment ID");
      return { statusCode: 200, body: "OK" };
    }

    const MOLLIE_API_KEY = process.env.MOLLIE_API_KEY;
    const mollieRes = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${MOLLIE_API_KEY}` },
    });
    const payment = await mollieRes.json();

    console.log("Payment status:", payment.status);
    if (payment.status !== "paid") return { statusCode: 200, body: "OK" };

    const meta = payment.metadata || {};
    const email = meta.email;
    const reportType = meta.reportType || "lab";
    const isLab = reportType === "lab";

    if (!email) {
      console.error("No email in metadata");
      return { statusCode: 200, body: "OK" };
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    // Reassemble report from chunks
    const reportStr = [
      meta.report, meta.report2, meta.report3, meta.report4,
      meta.report5, meta.report6, meta.report7, meta.report8,
      meta.report9, meta.report10, meta.report11, meta.report12,
      meta.report13, meta.report14, meta.report15, meta.report16
    ].filter(Boolean).join("");

    let report = null;
    if (reportStr) {
      try {
        report = JSON.parse(reportStr);
        console.log("Report reassembled successfully");
      } catch (e) {
        console.error("Failed to parse report:", e.message);
      }
    }

    // Build email HTML
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
                <span style="font-size:12px;color:#64748b;margin-left:10px;">Value: <strong style="color:${sc.color};">${b.value}</strong>${b.referenceRange ? ` · Ref: ${b.referenceRange}` : ""}${b.optimalRange ? ` · Optimal: ${b.optimalRange}` : ""}</span>
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
        ${report.keyFindings?.length ? `<h2 style="color:#0369a1;font-size:16px;margin:24px 0 10px;border-bottom:2px solid #e2e8f0;padding-bottom:6px;">🎯 Key Findings</h2>${report.keyFindings.map((f, i) => `<div style="margin-bottom:8px;padding:8px 12px;background:#f0f9ff;border-left:3px solid #0ea5e9;border-radius:4px;font-size:13px;">${i + 1}. ${f}</div>`).join("")}` : ""}
        <h2 style="color:#7c3aed;font-size:16px;margin:24px 0 10px;border-bottom:2px solid #e2e8f0;padding-bottom:6px;">🔬 Biomarker Analysis</h2>
        ${biomarkersHtml}
        ${report.retestPlan ? `
          <h2 style="color:#ca8a04;font-size:16px;margin:24px 0 10px;border-bottom:2px solid #e2e8f0;padding-bottom:6px;">🔁 When to Retest</h2>
          <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px;">
            <div style="font-size:16px;font-weight:800;color:#ca8a04;margin-bottom:6px;">Recommended: ${report.retestPlan.timeframe}</div>
            <div style="font-size:13px;margin-bottom:8px;">${report.retestPlan.reason}</div>
            <div style="font-size:13px;"><strong>Expected improvements:</strong> ${report.retestPlan.expectedImprovements}</div>
          </div>` : ""}
        ${mealPlanHtml}
        ${report.doctorTalkingPoints?.length ? `
          <h2 style="color:#0369a1;font-size:16px;margin:24px 0 10px;border-bottom:2px solid #e2e8f0;padding-bottom:6px;">💬 What to Discuss with Your Doctor</h2>
          ${report.doctorTalkingPoints.map((q) => `<div style="font-size:13px;padding:8px 12px;background:#f0f9ff;border-radius:5px;border-left:3px solid #0ea5e9;margin-bottom:6px;">${q}</div>`).join("")}` : ""}
      `;
    } else {
      reportHtml = `<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:20px;font-size:14px;color:#9a3412;">
        <strong>Note:</strong> Your report could not be generated automatically. Please contact support and we will generate and send your report manually within 24 hours. We apologize for the inconvenience.
      </div>`;
    }

    // Send full report email
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
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

    console.log("Report email sent to:", email);
    return { statusCode: 200, body: "OK" };
  } catch (err) {
    console.error("payment-webhook error:", err);
    return { statusCode: 200, body: "OK" };
  }
}
