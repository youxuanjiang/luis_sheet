const parse = require('./util/for_intents/_parse');
const getDBIntents = require('./util/for_intents/_get_db_intents');

const queryString = require('querystring');

// LUIS Configure
const {
  LUISstagingSlotKey, // For Staging State LUIS tool
  LUISendpoint,
  LUISappId,
  googleSheetLocation,
} = require('./config_LUIS.js');

const sleep = ms => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// For test specific question
const queryParams = {
  'subscription-key': LUISstagingSlotKey,
  verbose: true,
  query: '多工所碩士生逕行修讀博士條件',
};

getDBIntents({
              LUISstagingSlotKey,
              question: '多工所碩士生逕行修讀博士條件',
              LUISendpoint,
              LUISappId,
              pridictionUri: `${LUISendpoint}luis/prediction/v3.0/apps/${LUISappId}/slots/staging/predict?${queryString.stringify(queryParams)}`,
            });

// const write_DBintent_to_sheet = async _ => {
//   const model = await parse(googleSheetLocation);
//   const intentHeaderList = model.intent_header;
//   const intentList = model.intents;
//   const questions = model.questions;
//   const questionBatchs = [];
//   let questionBatch = [];
//   const questionIntentPair = {};
//
//   // 每50個queation作為一個批次
//   let batchIndex = 0;
//   intentHeaderList.forEach(intentHeader => {
//     intentList[intentHeader].forEach(intent => {
//       questions[intentHeader][intent].forEach(question => {
//         batchIndex++;
//         questionBatch.push(question);
//         if(batchIndex % 10 === 0){
//           questionBatchs.push(questionBatch);
//           questionBatch = [];
//         }
//         // console.log(`batchIndex: ${batchIndex%20}: ${questionBatch[batchIndex%20]}`);
//       });
//     });
//   });
//
//   if(questionBatch !== []){
//     questionBatchs.push(questionBatch);
//     questionBatch = [];
//   }
//
//   // console.log(questionBatchs.length);
//   for(let i = 0; i < questionBatchs.length; i++){
//     // console.log(`batchIndex ${i}: ${questionBatchs[i]}`);
//     questionBatchs[i].forEach(question => {
//       // Create query string
//       const queryParams = {
//         'subscription-key': LUISstagingSlotKey,
//         verbose: true,
//         query: question,
//       };
//       getDBIntents({
//         LUISstagingSlotKey,
//         question,
//         LUISendpoint,
//         LUISappId,
//         pridictionUri: `${LUISendpoint}luis/prediction/v3.0/apps/${LUISappId}/slots/staging/predict?${queryString.stringify(queryParams)}`,
//       });
//     });
//     await sleep(3000);
//   }
// }
//
// write_DBintent_to_sheet();
