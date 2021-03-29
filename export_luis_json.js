const request = require('requestretry');
// LUIS configExportLUISure
const {
  LUISauthoringKey,
  LUISendpoint,
  LUISversionId,
  LUISappId,
} = require('./config_LUIS.js');

const jsonBody = {
  format: "json",
}
// time delay between requests
const delayMS = 1000;
// retry recount
const maxRetry = 5;
// retry request if error or 429 received
const retryStrategy = (err, response) => {
  const shouldRetry = err || response.statusCode > 400;
  return shouldRetry;
};

const configExportLUIS = {
  LUISSubscriptionKey: LUISauthoringKey,
  LUISappId,
  LUISversionId,
  LUISendpoint,
  uri: `${LUISendpoint}luis/authoring/v3.0-preview/apps/${LUISappId}/versions/${LUISversionId}/export?`,
};

request({
  url: configExportLUIS.uri,
  method: 'GET',
  headers: {
    'Ocp-Apim-Subscription-Key': configExportLUIS.LUISSubscriptionKey,
  },
  json: true,
  maxAttempts: maxRetry,
  retryDelay: delayMS,
  retryStrategy,
}).then((response) => {
    console.log(response);
});
