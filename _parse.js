const { GoogleSpreadsheet } = require('google-spreadsheet');
const merge = require('deepmerge');
const { promisify } = require('util');
// Check: https://sites.google.com/jes.mlc.edu.tw/ljj/linebot實做/申請google-sheet-api
const creds = require('./cred.json');

function listOfIntentsAndQuestions(rows) {
  const questions = {};
  const intents = [];
  console.log(rows.length);
  for (const row of rows) {
    if(row.intent != ''){
      intents.push(row.intent);
      questions[row.intent] = [];
      questions[intents[intents.length - 1]].push(row.question);
    }else{
      questions[intents[intents.length - 1]].push(row.question);
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
  const intents = [];
  let questions = {};

  for (let i = 0; i < sheetLength; i += 1) {
    //console.log(sheet[i]);
    const rows = await sheet[i].getRows();
    const listedIntentsAndQuestions = listOfIntentsAndQuestions(rows);
    questions = merge(questions, listedIntentsAndQuestions.questions);
    intents.push.apply(intents, listedIntentsAndQuestions.intents);
  }

  const model = {
    intents,
    questions,
  };
  console.log('parse done.');
  return model;
};

module.exports = convert;
