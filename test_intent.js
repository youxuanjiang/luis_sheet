const queryString = require('querystring');
const parse = require('./util/for_test/_parse');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const getDBIntents = require('./util/for_get_db_intents/_get_db_intents');
const clc = require('cli-color');

// LUIS Configure
const {
  LUISstagingSlotKey,
  LUISendpoint,
  LUISversionId,
  LUISappId,
  googleSheetForTest,
} = require('./config_LUIS.js');

let answers;
const csv_data_error = [];
const csv_data_correct = [];
const csvWriterError = createCsvWriter({
  path: 'test_intent_error.csv',
  header: [
    {id: 'question', title: 'Question'},
    {id: 'intent', title: 'Intent'},
  ]
});

const csvWriterCorrect = createCsvWriter({
  path: 'test_intent_correct.csv',
  header: [
    {id: 'question', title: 'Question'},
    {id: 'intent', title: 'Intent'},
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
  const model = await parse(googleSheetForTest);
  const {
    informations,
    answers
  } = model;

  // console.log(answers);

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
      answer.intent = await getDBIntents(new ConfigGetDBIntent(answer.question).getConfig(), informations);
      if(answer.intent != '無法判斷'){
        // console.log(clc.green(`${answer.question} : ${answer.intent}`));
        if(!answer.intent.includes('/')){
          console.error(clc.green(`${answer.question} : ${answer.intent}`));
          csv_data_error.push(answer);
        }else{
          csv_data_correct.push(answer);
        }
      }else{
        console.error(clc.green(`${answer.question} : ${answer.intent}`));
        csv_data_error.push(answer);
      }
    });
    await sleep(5000);
  }
};

turn_sheet_to_csv()
.then(() => {
  csvWriterError.writeRecords(csv_data_error);
  csvWriterCorrect.writeRecords(csv_data_correct);
})
.then(() => {
  console.log('The CSV file was written successfully');
})
.catch((err) => {
  console.log(err.message);
});
