const {GoogleSpreadsheet} = require('google-spreadsheet');
const merge = require('deepmerge');
// Check: https://sites.google.com/jes.mlc.edu.tw/ljj/linebot實做/申請google-sheet-api
const creds = require('../../cred.json');

// 從sheet中抽出範例問題以及各intent所對應之information
const listOfIntentsAndQuestions = (rows) => {
  try {
    const questions = [];
    const informations = {};
    let tmp_intent;

    for (const row of rows) {
      if (row.Intent != '') {
        tmp_intent = row.Intent;
        questions.push(row.question);
        informations[row.Intent] = [];
        informations[row.Intent].push(row.information);
        // console.log(informations[row.Intent]);
      } else {
        questions.push(row.question);
        if (row.information != '') {
          informations[tmp_intent].push(row.information);
          // console.log(informations[tmp_intent]);
        }
      }
    }
    return {
      questions,
      informations,
    };
  } catch (err) {
    console.log(`Error in listOfIntentsAndQuestions: ${err}`);
  }
};

const convert = async (googleSheet) => {
  try {
    const doc = new GoogleSpreadsheet(googleSheet);
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    // console.log(doc.index);
    const sheet = doc.sheetsByIndex;
    // console.log(sheet[0].getRows());
    const sheetLength = sheet.length;
    // console.log(sheetLength);

    console.log('Start parsing Google Sheet...');
    let questions = [];
    let informations = {};

    for (let i = 0; i < sheetLength; i += 1) {
      const rows = await sheet[i].getRows();
      const listedIntentsAndQuestions = listOfIntentsAndQuestions(rows);
      questions = questions.concat(listedIntentsAndQuestions.questions);
      informations = merge(informations, listedIntentsAndQuestions.informations);
    }

    const model = {
      questions,
      informations,
    };
    console.log('parse done.');
    return model;
  } catch (err) {
    console.log(`Error in convert: ${err}`);
  }
};

module.exports = convert;
