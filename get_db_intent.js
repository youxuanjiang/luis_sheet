const queryString = require('querystring');
const parse = require('./util/for_get_db_intents/_parse');
const getDBIntents = require('./util/for_get_db_intents/_get_db_intents');

// LUIS Configure
const {
  LUISstagingSlotKey, // For Staging State LUIS tool
  LUISendpoint,
  LUISappId,
  googleSheetForInfo,
} = require('./config_LUIS.js');

// why use class: 因為此資料會平行的被使用，如果用Global Variable的話會有RAW的問題
const ConfigGetDBIntent = class {
  constructor(query_context) {
    this.queryParams = {
      'subscription-key': LUISstagingSlotKey,
      'verbose': true,
      'query': query_context,
    };

    this.config = {
      LUISstagingSlotKey,
      question: query_context,
      LUISendpoint,
      LUISappId,
      pridictionUri: `${LUISendpoint}luis/prediction/v3.0/apps/${LUISappId}/slots/staging/predict?${queryString.stringify(this.queryParams)}`,
    };
  }

  getConfig() {
    return this.config;
  }
}

const getDBIntent = async (mtext) => {
  const db_intent = await getDBIntents(new ConfigGetDBIntent(mtext).getConfig());
  process.stdout.write(db_intent);
};

getDBIntent(process.argv[2]);
