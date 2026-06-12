// netlify/functions/create-payment.js
import { getStore } from '@netlify/blobs';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { email, amount, description, reportType, reportData, fileB64, fileType, fileName } = JSON.parse(event.body);

    if (!email || !amount) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing email or amount' }) };
    }

    // Create Mollie payment
    const paymentBody = {
      amount: {
        currency: 'EUR',
        value: amount === '4.90' ? '4.90' : '9.90',
      },
      description: description || `HealthDecoded — ${reportType === 'lab' ? 'Lab Results Report' : 'Health Consultation Report'}`,
      redirectUrl: `${process.env.URL || 'https://healthdecoded.netlify.app'}/.netlify/functions/get-payment?email=${encodeURIComponent(email)}&type=${reportType}`,
      webhookUrl: `${process.env.URL || 'https://healthdecoded.netlify.app'}/.netlify/functions/payment-webhook`,
      metadata: {
        email,
        reportType,
        reportData: JSON.stringify(reportData || {}),
      },
    };

    const mollieResponse = await fetch('https://api.mollie.com/v2/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MOLLIE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentBody),
    });

    const payment = await mollieResponse.json();

    if (!payment.id) {
      console.error('Mollie error:', payment);
      return { statusCode: 500, body: JSON.stringify({ error: 'Payment creation failed' }) };
    }

    // Store file in Netlify Blobs if provided
    if (fileB64 && fileType) {
      try {
        const store = getStore('lab-files');
        await store.set(payment.id, JSON.stringify({
          fileB64,
          fileType,
          fileName: fileName || 'lab-report',
          email,
          reportType,
          reportData: reportData || {},
        }));
        console.log('File stored for payment:', payment.id);
      } catch (blobError) {
        console.error('Blob storage error:', blobError);
        // Continue anyway — report will be generated without file
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ checkoutUrl: payment._links.checkout.href }),
    };

  } catch (error) {
    console.error('create-payment error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
