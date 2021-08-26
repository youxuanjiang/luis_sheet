const parse = require('../util/for_add_entities/_parse');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const {
  googleSheetForEntity,
} = require('../config_LUIS.js');

const csv_data = [];
const csvWriter = createCsvWriter({
  path: `information_table.csv`,
  header: [
    {id: 'class', title: 'Class'},
    {id: 'information', title: 'Information'},
    {id: 'alias', title: 'Alias|'},
  ]
});

const get_information_csv = async () => {
  try{
    const model = await parse(googleSheetForEntity, process.argv.slice(2));
    const {
      entity_header,
      entities,
      alias
    } = model;

    entity_header.forEach((header) => {

      entities[header].forEach((entity) => {
        alias[header][entity].forEach((other_name) => {
          csv_data.push({class: header, information: entity, alias: `${other_name}|`});
          console.log({class: header, information: entity, alias: `${other_name}|`});
        });
      });
    });
  }catch (err){
    console.log(`Error in get_information_csv: ${err.message}`);
  }
};

get_information_csv()
.then(() => {
  csvWriter.writeRecords(csv_data);
})
.then(() => {
  console.log('The CSV file was written successfully');
})
.catch((err) => {
  console.log(err.message);
});
