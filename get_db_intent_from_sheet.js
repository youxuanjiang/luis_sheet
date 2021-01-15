const queryString = require('querystring');
const parse = require('./util/for_get_db_intents/_parse');
const getDBIntents = require('./util/for_get_db_intents/_get_db_intents');

// LUIS Configure
const {
  LUISstagingSlotKey, // For Staging State LUIS tool
  LUISendpoint,
  LUISappId,
  googleSheetForTest,
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

const sleep = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

// For test specific question
// getDBIntents(new ConfigGetDBIntent('多工所碩士生逕行修讀博士條件').getConfig());

const get_DB_intents_from_sheet = async () => {
  const model = await parse(googleSheetForTest);
  const {informations} = model;
  const {questions} = model;
  const questionBatchs = [];
  let questionBatch = [];
  // const questionIntentPair = {};
  // For test specific question
  // getDBIntents(new ConfigGetDBIntent('如何透過甄試入學進入資管所碩士班').getConfig(), informations);
  // 每12個queation作為一個批次
  let batchIndex = 0;
  questions.forEach((question) => {
    batchIndex++;
    questionBatch.push(question);
    if (batchIndex % 12 === 0) {
      questionBatchs.push(questionBatch);
      questionBatch = [];
    }
  });

  if (questionBatch !== []) {
    questionBatchs.push(questionBatch);
    questionBatch = [];
  }

  // 批次的去送出request
  for (let i = 0; i < questionBatchs.length; i++) {
    // forEach能平行的去跑
    questionBatchs[i].forEach((question) => {
      // console.log(question);
      // input: query question, return: precise intent
      getDBIntents(new ConfigGetDBIntent(question).getConfig(), informations);
    });
    await sleep(3000);
  }
};

get_DB_intents_from_sheet();
