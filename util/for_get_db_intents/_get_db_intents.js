const requestPromise = require('request-promise');
const queryString = require('querystring');

// 取得從question中parse出來的entities，再將其送進Entities中查表取得其正式名稱
const callGetList = async (option, informations) => {
  let finalList = '';

  for (const defaultInformation of informations._list) {
    // console.log(informations._query[defaultInformation]);
    const queryParamsForList = {
      'subscription-key': option.LUISstagingSlotKey,
      'verbose': true,
      'query': informations._query[defaultInformation],
    };
    const uri = `${option.LUISendpoint}luis/prediction/v3.0/apps/${option.LUISappId}/slots/staging/predict?${queryString.stringify(queryParamsForList)}`;
    const response = await requestPromise(uri);
    const list = JSON.parse(response).prediction.entities[defaultInformation][0][0];
    // console.log(`${queryList}: ${list}`);
    finalList = finalList.concat(`/${list}`);
  }

  return finalList;
};

const callGetDBIntents = async (options, JSONinformation, defaultInformations) => {
  try {
    const questionEntities = {};
    defaultInformations.forEach((information) => {
      // 先把LUIS從question有判斷出來的第一層Entity確定好
      if (JSONinformation.$instance[information] !== undefined) {
        questionEntities[information] = JSONinformation.$instance[information][0].text;
      }
      // 還是空的代表並沒有在第一層，可能埋在第二層
      if (questionEntities[information] === undefined) {
        defaultInformations.forEach((_information) => {
          if (JSONinformation[_information] !== undefined) {
            if (JSONinformation[_information][0][information] !== undefined) {
              questionEntities[information] = JSONinformation[_information][0].$instance[information][0].text;
            }
          }
        });
      }
      // 沒有在第一層也沒有在第二層代表問句中沒有提到這項資訊
      if (questionEntities[information] === undefined) {
        questionEntities[information] = '預設';
      }
    });

    // 取得entities之正式名稱
    const intentList = await callGetList(options, {
      _query: questionEntities,
      _list: defaultInformations,
    });

    return intentList;
  } catch (err) {
    console.log(`Error in callGetDBIntents: ${err.message}`);
  }
};

// 取得query question真正的intent
const getDBIntents = async (options, informations) => {
  try {
    // console.log(options.question);
    const response = await requestPromise(options.pridictionUri);
    const db_intent = JSON.parse(response).prediction;
    const dbIntentList = await callGetDBIntents(options, db_intent.entities[`${db_intent.topIntent}所需資訊`][0], informations[db_intent.topIntent]);
    console.log(`${options.question}: ${db_intent.topIntent}${dbIntentList}`);
  } catch (err) {
    console.log(`Error in getDBIntents: ${err.message}`);
  }
};

module.exports = getDBIntents;
