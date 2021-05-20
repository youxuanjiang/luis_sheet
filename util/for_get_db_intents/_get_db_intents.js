const requestPromise = require('request-promise');
const queryString = require('querystring');
const clc = require('cli-color');
const Diff = require('diff');

// 取得從question中parse出來的entities，再將其送進Entities中查表取得其正式名稱
const callGetList = async (option, informations) => {
  let finalList = '';
  let if_department_exist = false;
  let if_campus_exist = false;

  for (const defaultInformation of informations._list) {
    // console.log(informations._query[defaultInformation]);

    const queryParamsForList = {
      'subscription-key': option.LUISstagingSlotKey,
      'verbose': true,
      'query': informations._query[defaultInformation],
    };
    const uri = `${option.LUISendpoint}luis/prediction/v3.0/apps/${option.LUISappId}/slots/staging/predict?${queryString.stringify(queryParamsForList)}`;
    const response = await requestPromise(uri);
    // console.log(defaultInformation);
    // console.log(informations._query[defaultInformation]);
    // console.log(JSON.parse(response).prediction.entities[defaultInformation]);
    let list = '';
    if (JSON.parse(response).prediction.entities[defaultInformation] !== undefined) {
      list = JSON.parse(response).prediction.entities[defaultInformation][0][0];
    }else {
      console.error(clc.red(`${informations._query[defaultInformation]} is not defined in list ${defaultInformation}`));
      return '';
      // console.log("%c ${informations._query[defaultInformation]} is not defined in list ${defaultInformation}",'color: red;');
    }

    if(defaultInformation === '校區') {
      if_campus_exist = true;
      if(list === '沒指定'){
        if_campus_exist = false;
      }
      else {
        finalList = finalList.concat(`/${list}`);
      }
    }
    // 從系所或行政組別名稱判斷是隸屬於哪個單位名稱的
    // 先判斷nput有沒有「學院」或「處室」的資訊
    else if(defaultInformation === '單位名稱'){
      if_department_exist = true;
      // 沒指定代表沒有相關資訊
      if(list === '沒指定'){
        if_department_exist = false;
      }
      // 反之就是使用者已經有輸入相關資訊了
      else {
        // 檢查「校區的資訊有沒有已經存在」
        if(!if_campus_exist){
          let campus = await callGetList(option, {
            _list: ['校區'],
            _query: {
              '校區': list,
            },
          });
          if(campus === '')campus = '/沒指定';
          finalList = finalList.concat(`${campus}/${list}`);
        }
        else{
          finalList = finalList.concat(`/${list}`);
        }
      }
    }
    // 此時判斷到「系所名稱這一塊」
    else if(defaultInformation === '單位內組別'){
      // 如果有抓到「單位內名稱」才要找
      if (list !== '沒指定') {
        // 先判斷有沒有已經有「單位名稱(學院、處室)的資訊了」
        // 如果不存在，則直接拿目前已經轉好的「單位內組別」去查表，取得「單位名稱」
        if(!if_department_exist){
          let department = await callGetList(option, {
            _list: ['單位名稱'],
            _query: {
              '單位名稱': list,
            },
          });
          if(department === '')department = '/沒指定';
          finalList = finalList.concat(`${department}/${list}`);
        }
        // 如果「單位名稱」已經存在則直接將「單位內組別」的名稱接在後面
        else{
          finalList = finalList.concat(`/${list}`);
        }
      }
      // 如果沒有「單位內名稱」的資訊
      else {
        // 如果「單位名稱」也是空的話，記得要補回「沒指定」給他
        if(!if_department_exist){
          // 沒有「單位名稱」，不一定沒有「校區」，因此還是要考慮有「校區」的情況
          if(!if_campus_exist){
            finalList = finalList.concat(`/沒指定/沒指定/沒指定`);
          }
          else{
            finalList = finalList.concat(`/沒指定/沒指定`);
          }
        }
        // 如果有「單位名稱」代表一定有「校區」，所以不需要考慮「校區」
        else{
          finalList = finalList.concat(`/${list}`);
        }
      }
    }
    // 如果並非「校區」、「單位名稱」以及「單位內組別」的CASE就直接將list回傳
    else {
      finalList = finalList.concat(`/${list}`);
    }
  }

  return finalList;
};

const callGetDBIntents = async (options, JSONinformation, defaultInformations, adjustInformation) => {
  try {
    // console.log(defaultInformations);
    // console.log(adjustInformation);
    const questionEntities = {};
    defaultInformations.forEach((information) => {

      // 先把LUIS從question有判斷出來的第一層Entity確定好
      if(JSONinformation.$instance !== undefined){
        if (JSONinformation.$instance[`${information}${adjustInformation}`] !== undefined) {
          questionEntities[information] = JSONinformation.$instance[`${information}${adjustInformation}`][0].text;
          // console.log(questionEntities[information]);
        }
      }
      // // 先把LUIS從question有判斷出來的第一層Entity確定好
      // if(JSONinformation.$instance !== undefined){
      //   if (JSONinformation.$instance[`${information}${adjustInformation}`] !== undefined) {
      //     questionEntities[information] = JSONinformation.$instance[`${information}${adjustInformation}`][0].text;
      //     // console.log(questionEntities[information]);
      //   }
      //   // 還是空的代表並沒有在第一層，可能埋在第二層
      //   if (questionEntities[information] === undefined) {
      //     defaultInformations.forEach((_information) => {
      //       if (JSONinformation[`${_information}${adjustInformation}`] !== undefined) {
      //         if (JSONinformation[`${_information}${adjustInformation}`][0][`_${information}${adjustInformation}`] !== undefined) {
      //           questionEntities[information] = JSONinformation[`${_information}${adjustInformation}`][0].$instance[`_${information}${adjustInformation}`][0].text;
      //         }
      //       }
      //     });
      //   }
      // }
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
    // console.log("%j", db_intent);
    // console.log(informations);
    let JSONinformation = {};
    let dbIntentList = '';
    // console.log(db_intent.entities[`${db_intent.topIntent}所需資訊`][0]);
    if(db_intent.intents[db_intent.topIntent].score < 0.8 || db_intent.topIntent == 'None')return `無法判斷`;
    // if(db_intent.entities[`${db_intent.topIntent}所需資訊`] !== undefined){
    //   dbIntentList = await callGetDBIntents(options, db_intent.entities[`${db_intent.topIntent}所需資訊`][0], informations[db_intent.topIntent], `${db_intent.topIntent}所需資訊`);
    // }
    // console.log(`Test entities of intent "${db_intent.topIntent}" is "${informations[db_intent.topIntent]}"`);

    // 如果該intent沒有Entity的話，就不需要去查Alias Table了
    if(informations[db_intent.topIntent][0] !== '')
      dbIntentList = await callGetDBIntents(options, db_intent.entities, informations[db_intent.topIntent], '所需資訊');
    // console.log(`${options.question}: ${db_intent.topIntent}${dbIntentList}`);
    return `${db_intent.topIntent}${dbIntentList}`;
  } catch (err) {
    console.log(`Error in getDBIntents: ${err.message}`);
  }
};

module.exports = getDBIntents;
