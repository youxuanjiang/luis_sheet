const request = require('requestretry');
// time delay between requests
const delayMS = 5000;

// retry recount
const maxRetry = 5;

// retry request if error or 429 received
const retryStrategy = (err, response) => {
  const shouldRetry = err || response.statusCode >= 400;
  // if (shouldRetry) console.log('retrying add intent...');
  return shouldRetry;
};

// Send JSON as the body of the POST request to the API
const callAddIntent = async options => {
  try {
    const intent = options.body.name;
    // console.log(`starting adding ${intent}, ${count}`);

    const response = await request(options);
    if (response.statusCode < 400) {
      await suc();
      // console.log(
      //  `intent ${intent} succeed with status code  ${response.statusCode}`
      // );
      console.log(`The number of request attempts: ${response.attempts}\n`);
    } else if (response.statusCode >= 400) {
      await fai();
      console.log(
        `intent ${intent} fail with status code  ${response.statusCode}`
      );
    }
    return response;
  } catch (err) {
    console.log(`Error in callAddIntent:  ${err.message}`);
    return err;
  }
};

// Call add-intents
const addIntents = async config => {
  const intentPromises = [];
  const url = config.uri.replace('default_id', config.LUISappId);

  console.log('\nStart adding intents...');

  config.intentList.forEach(intent => {
    // JSON for the request body
    const jsonBody = {
      name: intent,
    };

    // Create an intent
    const addIntentPromise = callAddIntent({
      // uri: config.uri,
      url,
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': config.LUISSubscriptionKey,
      },
      json: true,
      body: jsonBody,
      maxAttempts: maxRetry,
      retryDelay: delayMS,
      retryStrategy,
    });

    intentPromises.push(addIntentPromise);
  });

  await Promise.all(intentPromises);
  console.log('Add intents done.');
  console.log(`Success = ${succeed}\nFail = ${fail}\n`);
};

module.exports = addIntents;
