import { getStore } from "@netlify/blobs";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const { fileB64, fileType, fileName, reportType, email } = JSON.parse(event.body);

    if (!fileB64 || !fileType) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing file data" }) };
    }

    const key = `report_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const store = getStore({ name: "report-data", consistency: "strong" });

    await store.setJSON(key, {
      fileB64,
      fileType,
      fileName,
      reportType,
      email,
      createdAt: new Date().toISOString(),
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    };
  } catch (err) {
    console.error("store-report-data error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to store data" }) };
  }
}
