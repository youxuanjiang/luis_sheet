
const LUISauthoringKey = 'a7cf54f299e941ca87ce65df37516193';
const LUISstagingSlotKey = '24263bf86d1e47f3bce3be875cea9a42';
const LUISappName = 'NCTU-CAMPUS-QA';
const LUISendpoint = 'https://westus.api.cognitive.microsoft.com/';
const LUISappCulture = 'zh-cn'; // dont need to change
const LUISversionId = '0.1'; // dont need to change
const LUISappId = '9047e1d2-81ec-4d8c-84f0-d627ed1afd39';

const BDRCMssql = {
  user: 'BDRC_admin',
  password: '@Big533',
  server: '140.113.135.23',
  database: 'ChatbotDB',
  options: {
    encrypt: false,
    enableArithAbort: true
  }
}

const googleSheetForIntent = '1DhuejVf8Q4O_6zyHiv3VjPvETnPt1jNtNhSrTXngEbg';
const googleSheetForEntity = '1N3WnrBEFJA2-EzPBPaZfAChS4Rc3oQeBOG3gyHPWkwk';
const googleSheetForTest = '1-3nFrrE65vqtgeiZ2VZlI3HYhdWjCpGPDeyhw2GQRPs';
const googleSheetForAnswer = '1fLltkbYdqd6hgkA748ubMTJDYBqJFraC-y5bltF_62k';
// const googleSheetForAnswer = '1AF78vH-s7RSRaZIwSd2UdBk0227vs5u8VXaiZom-OE4';
const googleSheetForInformation = '1-3nFrrE65vqtgeiZ2VZlI3HYhdWjCpGPDeyhw2GQRPs';
// const googleSheetForInformation = '13QVuA7srU9YvZgzdwnNFZDkZ5fLgIgznUyfn_Bpwhy4';
module.exports = {
  LUISauthoringKey,
  LUISstagingSlotKey,
  LUISappName,
  LUISendpoint,
  LUISappCulture,
  LUISversionId,
  LUISappId,
  BDRCMssql,
  googleSheetForIntent,
  googleSheetForEntity,
  googleSheetForTest,
  googleSheetForAnswer,
  googleSheetForInformation,
};
