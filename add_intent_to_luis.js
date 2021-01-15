const parse = require('./util/for_add_intents/_parse');
const addIntents = require('./util/for_add_intents/_intent');
const upload = require('./util/for_add_intents/_upload');

// LUIS Configure
const {
  LUISauthoringKey,
  LUISendpoint,
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
  LUISendpoint,
  questions: {},
  intentHeaderList: [],
  intentList: {},
  uri: `${LUISendpoint}luis/authoring/v3.0-preview/apps/${LUISappId}/versions/${LUISversionId}/examples`,
};

/* add intents parameters */
const configAddIntents = {
  LUISSubscriptionKey: LUISauthoringKey,
  LUISappId,
  LUISversionId,
  LUISendpoint,
  intentHeaderList: [],
  intentList: [],
  uri: `${LUISendpoint}luis/authoring/v3.0-preview/apps/${LUISappId}/versions/${LUISversionId}/intents`,
};

// Parse CSV, parameter is the address of the google sheet

parse(googleSheetLocation)
    .then((model) => {
    // Save intent and questions names from parse
      intent_header = model.intent_header;
      intents = model.intents;
      questions = model.questions;
      // Add intents
      configAddIntents.intentHeaderList = intent_header;
      configAddIntents.intentList = intents;
      return addIntents(configAddIntents);
    })
    .then((if_no_err) => {
    // Add example utterances to the intents in the app
      configAddUtterances.intentHeaderList = intent_header;
      configAddUtterances.intentList = intents;
      configAddUtterances.questions = questions;
      if (if_no_err) return upload(configAddUtterances);
    })
    .catch((err) => {
      console.log(err.message);
    });
