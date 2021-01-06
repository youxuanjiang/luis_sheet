const { GoogleSpreadsheet } = require('google-spreadsheet');
const merge = require('deepmerge');
const { promisify } = require('util');
// Check: https://sites.google.com/jes.mlc.edu.tw/ljj/linebot實做/申請google-sheet-api
const creds = require('./cred.json');

function listOfIntentsAndQuestions(rows, intent_header) {
  let questions = {};
  let intents = {};
  let tmp_intent;
  questions[intent_header] = {};
  intents[intent_header] = [];

  for (const row of rows) {
    if(row.Intent != ''){
      tmp_intent = row.Intent;
      intents[intent_header].push(row.Intent);
      questions[intent_header][row.Intent] = [];
      questions[intent_header][row.Intent].push(row.question);
    }else{
      questions[intent_header][tmp_intent].push(row.question);
    }
  }
  return { intents, questions };
}

const convert = async googleSheet => {
  const doc = new GoogleSpreadsheet(googleSheet);
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  // console.log(doc.index);
  const sheet = doc.sheetsByIndex;
  // console.log(sheet[0].getRows());
  const sheetLength = sheet.length;
  // console.log(sheetLength);

  console.log('Start parsing Google Sheet...');
  let intent_header = [];
  let intents = {};
  let questions = {};

  for (let i = 0; i < sheetLength; i += 1) {
    const rows = await sheet[i].getRows();
    const listedIntentsAndQuestions = listOfIntentsAndQuestions(rows, sheet[i]._rawProperties.title);
    
    intent_header.push(sheet[i]._rawProperties.title);
    questions = merge(questions, listedIntentsAndQuestions.questions);
    intents = merge(intents, listedIntentsAndQuestions.intents);
  }

  const model = {
    intents,
    questions,
    intent_header,
  };
  console.log('parse done.');
  return model;
};

module.exports = convert;
