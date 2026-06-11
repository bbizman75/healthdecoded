// netlify/functions/get-payment.js
// Called when user returns from Mollie checkout
// Checks payment status and returns result

export const handler = async (event) => {
  const { id, email, type } = event.queryStringParameters || {};

  if (!id && !email) {
    return {
      statusCode: 302,
      headers: { Location: 'https://healthdecoded.netlify.app?status=error' },
    };
  }

  try {
    // If we have a payment ID, check its status
    if (id) {
      const response = await fetch(`https://api.mollie.com/v2/payments/${id}`, {
        headers: { 'Authorization': `Bearer ${process.env.MOLLIE_API_KEY}` },
      });
      const payment = await response.json();

      if (payment.status === 'paid') {
        return {
          statusCode: 302,
          headers: {
            Location: `https://healthdecoded.netlify.app?status=paid&email=${encodeURIComponent(payment.metadata?.email || email || '')}&type=${type || payment.metadata?.reportType || 'lab'}`,
          },
        };
      }

      if (payment.status === 'failed' || payment.status === 'canceled' || payment.status === 'expired') {
        return {
          statusCode: 302,
          headers: { Location: `https://healthdecoded.netlify.app?status=${payment.status}` },
        };
      }
    }

    // Default — redirect back with pending status
    return {
      statusCode: 302,
      headers: {
        Location: `https://healthdecoded.netlify.app?status=pending&email=${encodeURIComponent(email || '')}&type=${type || 'lab'}`,
      },
    };

  } catch (error) {
    console.error('get-payment error:', error);
    return {
      statusCode: 302,
      headers: { Location: 'https://healthdecoded.netlify.app?status=error' },
    };
  }
};
