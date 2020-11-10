const parse = require('./_parse');
const addIntents = require('./_intent');
const upload = require('./_upload');

// LUIS Configure
const LUISauthoringKey = 'ENTER YOUR PREDICTION KEY';
const LUISappName = 'ENTER YOUR APP NAME';
const LUISendpoint = 'ENTER THE ADDRESS (THE ONE WITH LOCATION)';
const LUISappCulture = 'en-us'; // dont need to change
const LUISversionId = '0.1'; // dont need to change
const LUISappId = 'ENTER YOUR APP ID';
const googleSheetLocation = 'ENTER YOUR GOOGLE SHEET LOCATION';

let intents = [];
let questions = [];

/* add utterances parameters */
const configAddUtterances = {
  LUISSubscriptionKey: LUISauthoringKey,
  LUISappId,
  LUISversionId,
  questions,
  intents,
  uri: `${LUISendpoint}luis/authoring/v3.0-preview/apps/${LUISappId}/versions/${LUISversionId}/examples`,
};

/* create app parameters */
const configCreateApp = {
  LUISSubscriptionKey: LUISauthoringKey,
  LUISversionId,
  appName: LUISappName,
  culture: LUISappCulture,
  uri: `${LUISendpoint}luis/authoring/v3.0-preview/apps/`,
};

/* add intents parameters */
const configAddIntents = {
  LUISSubscriptionKey: LUISauthoringKey,
  LUISappId,
  LUISversionId,
  intentList: intents,
  uri: `${LUISendpoint}luis/authoring/v3.0-preview/apps/${LUISappId}/versions/${LUISversionId}/intents`,
};

// Parse CSV, parameter is the address of the google sheet
parse(googleSheetLocation)
  .then(model => {
    // Save intent and questions names from parse
    intents = model.intents;
    questions = model.questions;
  })
  .then(appId => {
    LUISappId = appId;
    // Add intents
    configAddIntents.LUISappId = LUISappId;
    configAddIntents.intentList = intents;
    return addIntents(configAddIntents);
  })
  .then(() => {
    // Add example utterances to the intents in the app
    configAddUtterances.LUISappId = LUISappId;
    configAddUtterances.intents = intents;
    configAddUtterances.questions = questions;
    return upload(configAddUtterances);
  })
  .catch(err => {
    console.log(err.message);
  });
