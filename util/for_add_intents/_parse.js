const {GoogleSpreadsheet} = require('google-spreadsheet');
const merge = require('deepmerge');
// Check: https://sites.google.com/jes.mlc.edu.tw/ljj/linebot實做/申請google-sheet-api
const creds = require('../../cred.json');

const listOfIntentsAndQuestions = (rows, intent_header) => {
  const questions = {};
  const intents = {};
  const entity_name = {};
  const entity_labels = {};
  let tmp_intent;
  questions[intent_header] = {};
  intents[intent_header] = [];

  for (const row of rows) {
    entity_labels[row.question] = [];
    if (row.Intent != '') {
      tmp_intent = row.Intent;
      entity_name[tmp_intent] = [];
      entity_name[tmp_intent].push(`所需資訊`);
    }
    if (row.information != ''){
      entity_name[tmp_intent].push(`${row.information}${entity_name[tmp_intent][0]}`)
    }
  }

  for (const row of rows) {
    if (row.Intent != '') {
      tmp_intent = row.Intent;
      intents[intent_header].push(row.Intent);
      questions[intent_header][row.Intent] = [];
      questions[intent_header][tmp_intent].push(row.question);
      for (const entityName of entity_name[tmp_intent]) {
        if(row[`START${entityName}`] >= 0)
          entity_labels[row.question].push({"entityName": entityName, "startCharIndex": row[`START${entityName}`], "endCharIndex": row[`END${entityName}`]});
      }
    } else {
      questions[intent_header][tmp_intent].push(row.question);
      for (const entityName of entity_name[tmp_intent]) {
        if(row[`START${entityName}`] >= 0)
          entity_labels[row.question].push({"entityName": entityName, "startCharIndex": row[`START${entityName}`], "endCharIndex": row[`END${entityName}`]});
      }
    }
  }
  return {intents, questions, entity_labels};
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
  const intent_header = [];
  let intents = {};
  let questions = {};
  let entity_labels = {};

//   const sheetsJobs = sheet.map(v => {
//     return async () => {
//       const rows = await v.getRows();
//       const listedIntentsAndQuestions = listOfIntentsAndQuestions(rows, v._rawProperties.title);
//       console.log(listedIntentsAndQuestions.intents);
//       intent_header.push(v._rawProperties.title);
//       questions = merge(questions, listedIntentsAndQuestions.questions);
//       intents = merge(intents, listedIntentsAndQuestions.intents);
//       entity_labels = merge(entity_labels, listedIntentsAndQuestions.entity_labels);
//     }
//   }
// );
//
// await Promise.all(sheetsJobs);

for (let i = 0; i < sheetLength; i += 1) {
  const rows = await sheet[i].getRows();
    const listedIntentsAndQuestions = listOfIntentsAndQuestions(rows, sheet[i]._rawProperties.title);
    intent_header.push(sheet[i]._rawProperties.title);
    questions = merge(questions, listedIntentsAndQuestions.questions);
    intents = merge(intents, listedIntentsAndQuestions.intents);
    entity_labels = merge(entity_labels, listedIntentsAndQuestions.entity_labels);
}

  const model = {
    intents,
    questions,
    entity_labels,
    intent_header,
  };
  console.log('parse done.');
  return model;
};

module.exports = convert;
