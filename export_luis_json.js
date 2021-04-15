const request = require('requestretry');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
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

const csv_data = [];
const csvWriter = createCsvWriter({
  path: 'intent_utterances.csv',
  header: [
    {id: 'intent', title: 'Intent'},
    {id: 'utterance', title: 'Utterance'},
  ]
});

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
    fs.writeFileSync('luis.json',JSON.stringify(response));
});

const luisFile = fs.readFileSync('luis.json');
const intentUtter = JSON.parse(luisFile).body.utterances;
fs.writeFileSync('utter.json',JSON.stringify(intentUtter));
// let utter = {};
intentUtter.forEach((data) => {
  // if(utter[data.intent] == undefined){
  //   utter[data.intent] = [];
  // }
  // utter[data.intent].push(data.text);
  csv_data.push({intent: data.intent, utterance: data.text});
});
csvWriter.writeRecords(csv_data);
