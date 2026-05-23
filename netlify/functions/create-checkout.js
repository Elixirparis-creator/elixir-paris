exports.handler = async function(event) {
  // Gérer CORS preflight
  if(event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if(event.httpMethod !== 'POST') {
    return {statusCode: 405, body: 'Method Not Allowed'};
  }

  const SUMUP_API_KEY = process.env.SUMUP_API_KEY;

  if(!SUMUP_API_KEY) {
    return {
      statusCode: 500,
      headers: {'Access-Control-Allow-Origin': '*'},
      body: JSON.stringify({error: 'API key missing'})
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch(e) {
    return {
      statusCode: 400,
      headers: {'Access-Control-Allow-Origin': '*'},
      body: JSON.stringify({error: 'Invalid JSON'})
    };
  }

  const {amount, currency, description, reference} = body;

  try {
    const response = await fetch('https://api.sumup.com/v0.1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + SUMUP_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        checkout_reference: reference || 'EP-' + Date.now(),
        amount: amount,
        currency: currency || 'EUR',
        description: description || 'Elixir Paris',
        merchant_code: 'MD4EAQHK',
        hosted_checkout: {
          enabled: true
        }
      })
    });

    const data = await response.json();

    if(!response.ok) {
      return {
        statusCode: response.status,
        headers: {'Access-Control-Allow-Origin': '*'},
        body: JSON.stringify({error: data})
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        checkout_url: data.hosted_checkout_url,
        checkout_id: data.id
      })
    };

  } catch(err) {
    return {
      statusCode: 500,
      headers: {'Access-Control-Allow-Origin': '*'},
      body: JSON.stringify({error: err.message})
    };
  }
};
