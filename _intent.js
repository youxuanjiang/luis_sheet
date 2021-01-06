const request = require('requestretry');
// time delay between requests
const delayMS = 1000;

// retry recount
const maxRetry = 5;

// retry request if error or 429 received
const retryStrategy = (err, response, r_section_a, r_section_b) => {
  // console.log(`[${r_section_b.body.name}] statusCode is ${response.statusCode}`);
  const shouldRetry = err || response.statusCode >= 400;
  if (shouldRetry) {
    console.log(`Retry intent ${r_section_b.body.name}...`);
  }
  return shouldRetry;
};

// Send JSON as the body of the POST request to the API
const callAddIntent = async options => {
  try {
    const intent = options.body.name;
    // console.log(`starting adding ${intent} to LUIS...`);
    const response = await request(options);
    if (response.statusCode < 400) {
      // await suc();
      console.log(
       `intent ${intent} succeed with status code  ${response.statusCode}`
      );
      // console.log(`The number of request attempts: ${response.attempts}\n`);
    } else if (response.statusCode >= 400) {
      // await fai();
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
const addIntents = async(config) => {
  const intentPromise = [];
  console.log('\nStart adding intents...');
  config.intentHeaderList.forEach( header => {
    console.log('[', header,']: ',config.intentList[header]);
    config.intentList[header].forEach( intent => {
      // JSON for the request body
      const jsonBody = {
        name: intent,
      };
      // Create an intent
      intentPromise.push(callAddIntent({
        url: config.uri,
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': config.LUISSubscriptionKey,
        },
        json: true,
        body: jsonBody,
        maxAttempts: maxRetry,
        retryDelay: delayMS,
        retryStrategy,
      }));
      // console.log('[', header,']: ',config.intentList[header], 'DONE!');
    });
  });
  await Promise.all(intentPromise);
  // console.log(`Success = ${succeed}\nFail = ${fail}\n`);
};

module.exports = addIntents;
