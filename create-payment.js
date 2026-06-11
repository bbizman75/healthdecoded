// netlify/functions/create-payment.js
// Creates a Mollie payment and returns the checkout URL

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { email, amount, description, reportType, reportData } = JSON.parse(event.body);

    if (!email || !amount) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing email or amount' }) };
    }

    // Store report data temporarily in payment metadata
    // We'll retrieve it in the webhook after payment
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
        reportData: JSON.stringify(reportData).substring(0, 1000), // Mollie metadata limit
      },
    };

    const response = await fetch('https://api.mollie.com/v2/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MOLLIE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentBody),
    });

    const payment = await response.json();

    if (!payment._links?.checkout?.href) {
      console.error('Mollie error:', payment);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to create payment', details: payment }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentId: payment.id,
        checkoutUrl: payment._links.checkout.href,
      }),
    };

  } catch (error) {
    console.error('create-payment error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
