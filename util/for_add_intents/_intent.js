const request = require('requestretry');
// time delay between requests
const delayMS = 1000;

// retry recount
const maxRetry = 5;

// check if get error when upload intents
let no_err = true;

// retry request if error or 429 received
const retryStrategy = (err, response) => {
  const shouldRetry = err || response.statusCode > 400;
  return shouldRetry;
};

// Send JSON as the body of the POST request to the API
const callAddIntent = async (options) => {
  try {
    const intent = options.body.name;
    const response = await request(options);

    // Check if add intent to LUIS succeess or not
    if (response.statusCode > 400) {
      no_err = false;
      console.log(
          `intent ${intent} fail with status code  ${response.statusCode}`,
      );
    }else if (response.statusCode == 400) {
      console.log(
          `intent ${intent} fail with status code  ${response.statusCode}`,
      );
    }
    return response;
  } catch (err) {
    console.log(`Error in callAddIntent:  ${err.message}`);
    return err;
  }
};

// Call add-intents
const addIntents = async (config) => {
  const intentPromise = [];
  console.log('\nStart adding intents...');
  // 表單上的每個分頁
  config.intentHeaderList.forEach((header) => {
    // 同一分頁中的每一個intent
    config.intentList[header].forEach((intent) => {
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
    });
  });

  await Promise.all(intentPromise);
  if (no_err) {
    console.log('add intents done.');
  }
  return no_err;
};

module.exports = addIntents;
