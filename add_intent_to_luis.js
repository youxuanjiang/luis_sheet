const parse = require('./_parse');
const addIntents = require('./_intent');
const upload = require('./_upload');


// LUIS Configure
const {
  LUISauthoringKey,
  LUISappName,
  LUISendpoint,
  LUISappCulture,
  LUISversionId,
  LUISappId,
  googleSheetLocation,
} = require('./config_LUIS.js');

let intents = {};
let intent_header = [];
let questions = {};

/* add utterances parameters */
const configAddUtterances = {
  LUISSubscriptionKey: LUISauthoringKey,
  LUISappId,
  LUISversionId,
  questions,
  intentHeaderList: [],
  intentList: [],
  uri: `${LUISendpoint}luis/authoring/v3.0-preview/apps/${LUISappId}/versions/${LUISversionId}/examples`,
};

/* add intents parameters */
const configAddIntents = {
  LUISSubscriptionKey: LUISauthoringKey,
  LUISappId,
  LUISversionId,
  intentHeaderList: [],
  intentList: [],
  uri: `${LUISendpoint}luis/authoring/v3.0-preview/apps/${LUISappId}/versions/${LUISversionId}/intents`,
};

// Parse CSV, parameter is the address of the google sheet

parse(googleSheetLocation)
  .then(model => {
    // Save intent and questions names from parse
    intent_header = model.intent_header;
    intents = model.intents;
    questions = model.questions;
    // Add intents
    configAddIntents.intentHeaderList = intent_header;
    configAddIntents.intentList = intents;
    return addIntents(configAddIntents);
  })
  .then(() => {
    // Add example utterances to the intents in the app
    configAddUtterances.intentHeaderList = intent_header;
    configAddUtterances.intentList = intents;
    configAddUtterances.questions = questions;
    return upload(configAddUtterances);
  })
  .catch(err => {
    console.log(err.message);
  });
