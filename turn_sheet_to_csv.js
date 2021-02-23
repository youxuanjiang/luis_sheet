const queryString = require('querystring');
const parse = require('./util/for_get_answer/_parse');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const getDBIntents = require('./util/for_get_db_intents/_get_db_intents');

// LUIS Configure
const {
  LUISstagingSlotKey,
  LUISendpoint,
  LUISversionId,
  LUISappId,
  googleSheetForAnswer,
} = require('./config_LUIS.js');

let answers;
const csv_data = [];
const csvWriter = createCsvWriter({
  path: 'interview_information.csv',
  header: [
    {id: 'question', title: 'Question'},
    {id: 'answer', title: 'Answer|'},
  ]
});

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

// Parse CSV, parameter is the address of the google sheet
const turn_sheet_to_csv = async () => {
  const model = await parse(googleSheetForAnswer);
  const {
    informations,
    answers
  } = model;

  const answerBatchs = [];
  let answerBatch = [];
  let batchIndex = 0;
  answers.forEach((answer) => {
    batchIndex++;
    answerBatch.push(answer);
    if (batchIndex % 12 === 0) {
      answerBatchs.push(answerBatch);
      answerBatch = [];
    }
  });

  if (answerBatch !== []) {
    answerBatchs.push(answerBatch);
    answerBatch = [];
  }

  // 批次的去送出request
  for (let i = 0; i < answerBatchs.length; i++) {
    // forEach能平行的去跑
    answerBatchs[i].forEach(async (answer) => {
      // console.log(question);
      // input: query question, return: precise intent
      answer.question = await getDBIntents(new ConfigGetDBIntent(answer.question).getConfig(), informations);
      answer.answer = `${answer.answer}|`;
      if(answer.question != '無法判斷'){
        csv_data.push(answer);
        console.log(answer);
      }
    });
    await sleep(5000);
  }
};

turn_sheet_to_csv()
.then(() => {
  csvWriter.writeRecords(csv_data);
})
.then(() => {
  console.log('The CSV file was written successfully');
})
.catch((err) => {
  console.log(err.message);
});
