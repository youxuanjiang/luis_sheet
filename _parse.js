const { GoogleSpreadsheet } = require('google-spreadsheet');
const merge = require('deepmerge');
const { promisify } = require('util');
// Check: https://sites.google.com/jes.mlc.edu.tw/ljj/linebot實做/申請google-sheet-api
const creds = require('LOCATION TO YOUR CRED');

function listOfIntentsAndQuestions(cells) {
  const questions = {};
  const intents = [];
  for (const cell of cells) {
    if (cell.col === 1) {
      intents.push(cell.value);
      questions[cell.value] = [];
    } else {
      questions[intents[intents.length - 1]].push(cell.value);
    }
  }
  return { intents, questions };
}

const convert = async googleSheet => {
  const doc = new GoogleSpreadsheet(googleSheet);
  // await promisify(doc.useServiceAccountAuth)(creds);
  const info = await promisify(doc.getInfo)();
  const sheetLength = info.worksheets.length;
  const sheet = info.worksheets;

  console.log('Start parsing Google Sheet...');
  const intents = [];
  let questions = {};

  for (let i = 0; i < sheetLength; i += 1) {
    const cells = await promisify(sheet[i].getCells)({
      'min-row': 2,
      'min-col': 1,
      'return-empty': false,
    });
    const listedIntentsAndQuestions = listOfIntentsAndQuestions(cells);
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
