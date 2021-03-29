const {GoogleSpreadsheet} = require('google-spreadsheet');
const merge = require('deepmerge');
// Check: https://sites.google.com/jes.mlc.edu.tw/ljj/linebot實做/申請google-sheet-api
const creds = require('../../cred.json');

const listOfAnswersAndQuestionsPair = (rows) => {
  const answers = [];
  const informations = {};
  let tmp_intent;
  for (const row of rows) {
    if (row.Intent != '') {
      tmp_intent = row.Intent;
      informations[row.Intent] = [];
      informations[row.Intent].push(row.information);
      // console.log(informations[row.Intent]);
    } else {
      if (row.information != '') {
        informations[tmp_intent].push(row.information);
        // console.log(informations[tmp_intent]);
      }
    }
    if (row.question != '') {
      answers.push({
        question: row.question,
      });
    }
  }
  return {informations, answers};
}

const convert = async (googleSheet) => {
  const doc = new GoogleSpreadsheet(googleSheet);
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  // console.log(doc.index);
  const sheet = doc.sheetsByIndex;
  // console.log(sheet[0].getRows());
  const sheetLength = sheet.length;
  // console.log(sheetLength);

  console.log('Start parsing Google Sheet...');
  let answers = [];
  let informations = {};

  for (let i = 0; i < sheetLength; i += 1) {
    const rows = await sheet[i].getRows();
    const listedOfAnswersAndQuestionsPair = listOfAnswersAndQuestionsPair(rows);
    answers = answers.concat(listedOfAnswersAndQuestionsPair.answers);
    informations = merge(informations, listedOfAnswersAndQuestionsPair.informations)
  }

  const model = {informations, answers};
  console.log('parse done.');
  return model;
};

module.exports = convert;
