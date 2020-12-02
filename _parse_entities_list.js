const { GoogleSpreadsheet } = require('google-spreadsheet');
const merge = require('deepmerge');
const { promisify } = require('util');
// Check: https://sites.google.com/jes.mlc.edu.tw/ljj/linebot實做/申請google-sheet-api
const creds = require('./cred.json');

function listOfEntitiesAndAlias(rows, entity_header) {
  let alias = {};
  let entities = {};
  let tmp_entity;
  alias[entity_header] = {};
  entities[entity_header] = [];
  // console.log(rows.length);

  for (const row of rows) {

    if(row.entity != ''){
      tmp_entity = row.entity;
      entities[entity_header].push(row.entity);
      alias[entity_header][row.entity] = [];
      alias[entity_header][row.entity].push(row.alias);
    }else{
      alias[entity_header][tmp_entity].push(row.alias);
    }
  }
  return { entities, alias };
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
  const entity_header = [];
  let entities = {};
  let alias = {};

  for (let i = 0; i < sheetLength; i += 1) {
    entity_header.push(sheet[i]._rawProperties.title);
    const rows = await sheet[i].getRows();
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
