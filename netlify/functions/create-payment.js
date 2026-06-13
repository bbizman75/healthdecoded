// netlify/functions/create-payment.js
// Fast — just creates the Mollie payment, no Claude call
// Claude report is generated in the browser BEFORE this is called

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { email, amount, description, reportType, report } = JSON.parse(event.body);

    if (!email || !amount) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing email or amount' }) };
    }

    const reportStr = report ? JSON.stringify(report) : '';
    const reportReady = reportStr.length > 10 ? 'true' : 'false';

    console.log('Creating payment for:', email, 'reportReady:', reportReady, 'reportSize:', reportStr.length);

    const paymentBody = {
      amount: { currency: 'EUR', value: amount === '4.90' ? '4.90' : '9.90' },
      description: description || `HealthDecoded — ${reportType === 'lab' ? 'Lab Results Report' : 'Health Consultation Report'}`,
      redirectUrl: `${process.env.URL || 'https://healthdecoded.netlify.app'}/.netlify/functions/get-payment?email=${encodeURIComponent(email)}&type=${reportType}`,
      webhookUrl: `${process.env.URL || 'https://healthdecoded.netlify.app'}/.netlify/functions/payment-webhook`,
      metadata: {
        email,
        reportType,
        reportReady,
        report: reportStr.substring(0, 16000),
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
      console.error('Mollie error:', JSON.stringify(payment));
      return { statusCode: 500, body: JSON.stringify({ error: 'Payment creation failed' }) };
    }

    console.log('Payment created:', payment.id);
    return { statusCode: 200, body: JSON.stringify({ checkoutUrl: payment._links.checkout.href }) };

  } catch (error) {
    console.error('create-payment error:', error.message);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
