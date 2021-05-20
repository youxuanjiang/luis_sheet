const {GoogleSpreadsheet} = require('google-spreadsheet');
const merge = require('deepmerge');
// Check: https://sites.google.com/jes.mlc.edu.tw/ljj/linebot實做/申請google-sheet-api
const creds = require('../../cred.json');

const listOfEntitiesAndAlias = (rows, entity_header) => {
  const alias = {};
  const entities = {};
  let tmp_entity;
  alias[entity_header] = {};
  entities[entity_header] = [];
  // console.log(rows.length);

  for (const row of rows) {
    if (row.entity != '') {
      tmp_entity = row.entity;
      entities[entity_header].push(row.entity);
      alias[entity_header][row.entity] = [];
      alias[entity_header][row.entity].push(row.alias);
    } else {
      alias[entity_header][tmp_entity].push(row.alias);
    }
  }
  return {entities, alias};
}

const convert = async (googleSheet, headerList) => {
  const doc = new GoogleSpreadsheet(googleSheet);
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  // console.log(headerList);
  // console.log(doc.index);
  const sheet = doc.sheetsByIndex;
  // console.log(sheet[0].getRows());
  let sheetLength;
  if(headerList.length == 0){
    sheetLength = sheet.length;
  }
  else {
    sheetLength = headerList.length;
  }
  // console.log(sheetLength);

  console.log('Start parsing Google Sheet...');
  const entity_header = [];
  let entities = {};
  let alias = {};

  for (let i = 0; i < sheetLength; i += 1) {
    if(headerList.length == 0){
      entity_header.push(sheet[i]._rawProperties.title);
    }
    else {
      entity_header.push(headerList[i]);
    }

    let j = i;
    if(headerList.length != 0){
      while(sheet[j]._rawProperties.title != headerList[i]){
        j++;
      }
    }
    const rows = await sheet[j].getRows();
    const listedentitiesAndalias = listOfEntitiesAndAlias(rows, entity_header[i]);

    alias = merge(alias, listedentitiesAndalias.alias);
    entities = merge(entities, listedentitiesAndalias.entities);
  }

  // console.log(entity_header);
  // console.log(entities);
  // console.log(alias);

  const model = {
    entity_header,
    entities,
    alias,
  };
  return model;
};

module.exports = convert;
