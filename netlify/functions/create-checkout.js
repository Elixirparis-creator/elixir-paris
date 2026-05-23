exports.handler = async function(event) {
  if(event.httpMethod !== 'POST') {
    return {statusCode:405, body:'Method Not Allowed'};
  }

  const SUMUP_API_KEY = process.env.SUMUP_API_KEY;
  
  let body;
  try {
    body = JSON.parse(event.body);
  } catch(e) {
    return {statusCode:400, body: JSON.stringify({error:'Invalid JSON'})};
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
        description: description || 'Élixir Paris',
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
      headers: {'Access-Control-Allow-Origin': '*'},
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
