const parse = require('./util/for_get_db_intents/_parse');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const {
  googleSheetForInformation,
} = require('./config_LUIS.js');

const csv_data = [];
const csvWriter = createCsvWriter({
  path: 'intent_information.csv',
  header: [
    {id: 'intent', title: 'Intent'},
    {id: 'information', title: 'Information|'},
  ]
});

const get_information_csv = async () => {
  const model = await parse(googleSheetForInformation);
  const {
    informations,
    intents,
  } = model;

  intents.forEach((intent) => {
    informations[intent].forEach((information) => {
      csv_data.push({intent: intent, information: `${information}|`});
      console.log({intent: intent, information: `${information}|`});
    });
  });
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
