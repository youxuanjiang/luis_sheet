const requestPromise = require('request-promise');
const queryString = require('querystring');
const clc = require('cli-color');

const Connection = require('mssql').ConnectionPool;
const Request = require('mssql').Request;

const BDRCMssql = require('../../config_LUIS.js')

const connection = new Connection(BDRCMssql);

var if_need_building_name = false;

// 從資料庫中取得該intent所需要的information
const getInformation = async (intent) => {
  const information = [];
  const response = await new Request(connection).query("SELECT Information from dbo.intent_information WHERE Intent LIKE '%" + intent + "%';");
  // const response = await new Request(connection).query("SELECT Information from dbo.intent_information WHERE Intent = '\n♥學校各部門連絡方式';");
  // console.log(response);
  response.recordset.forEach((info) => {
    information.push(info.Information);
  });
    // // // console.log(information);
  return information;
};

// 取得從question中parse出來的entities，再將其送進Entities中查表取得其正式名稱
const callGetList = async (informations, if_campus_exist, if_department_exist) => {
  let finalList = '';
  // console.log(information);
  for (const defaultInformation of informations._list) {
    // console.log(informations._query);
    const response = await new Request(connection).query("SELECT Information from dbo.information_table WHERE Class = '\n" + defaultInformation +"' AND Alias = '" + informations._query[defaultInformation] + "';");
    // console.logs(response);
    let list = '';
    if(response.recordset[0] !== undefined) list = response.recordset[0].Information;
    // console.log(`list: ${list}`);
    if(defaultInformation === '校區') {
      if_campus_exist = true;
      if(list === '沒指定'){
        if_campus_exist = false;
      }
      // 只要是「門禁」或「場地租借」，直接送給大樓名稱
      else if(if_need_building_name){
        if (list === '台北校區') {
          let building_name = await callGetList(
            {
              _list: ['大樓名稱'],
              _query: {
                '大樓名稱': list,
              },
            },
            if_campus_exist,
            if_department_exist
          );
          finalList = `${building_name.finalList}`;
        }
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
      // 只要是「門禁」或「場地租借」，直接送給大樓名稱
      else if(if_need_building_name){
        if (list !== '沒指定') {
          let building_name = await callGetList(
            {
              _list: ['大樓名稱'],
              _query: {
                '大樓名稱': list,
              },
            },
            if_campus_exist,
            if_department_exist
          );
          finalList = `${building_name.finalList}`;
        }
        else{
          if_department_exist = false;
        }
      }
      // 反之就是使用者已經有輸入相關資訊了
      else {
        // 檢查「校區的資訊有沒有已經存在」
        if(!if_campus_exist){
          // console.log('hey campus');
          let result_campus = await callGetList({
              _list: ['校區'],
              _query: {
                '校區': list,
              },
            },
            if_campus_exist,
            if_department_exist
          );
          let campus = result_campus.finalList;
          if_campus_exist = result_campus.if_campus_exist;
          if_department_exist = result_campus.if_department_exist;
          // console.log(campus);
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
        if(if_need_building_name){
          let building_name = await callGetList(
            {
              _list: ['大樓名稱'],
              _query: {
                '大樓名稱': list,
              },
            },
            if_campus_exist,
            if_department_exist
          );
          finalList = `${building_name.finalList}`;
        }
        // 先判斷有沒有已經有「單位名稱(學院、處室)的資訊了」
        // 如果不存在，則直接拿目前已經轉好的「單位內組別」去查表，取得「單位名稱」
        else if(!if_department_exist){
          // console.log(`Send ${list} to \'單位名稱\'`);
          let resule_department = await callGetList({
              _list: ['單位名稱'],
              _query: {
                '單位名稱': list,
              },
            },
            if_campus_exist,
            if_department_exist
          );
          let department = resule_department.finalList;
          if_campus_exist = resule_department.if_campus_exist;
          if_department_exist = resule_department.if_department_exist;
          // console.log(department);
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

        if(if_need_building_name){
          // 如果單位內組別是空的話，不需要回傳沒指定，因為門禁跟借東西都不需要這項資訊
        }
        // 如果「單位名稱」也是空的話，記得要補回「沒指定」給他
        else if(!if_department_exist){
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
    // 從單位名稱推到大樓名稱
    else if(defaultInformation === '大樓名稱'){
      if (list !== '沒指定') {
        finalList = `/${list}`;
      }
    }
    // 從公車停靠站點推回校區
    else if(defaultInformation === '公車停靠站點'){
      if (list !== '沒指定') {
        // 檢查「校區的資訊有沒有已經存在」
        if(!if_campus_exist){
          // console.log(10);
          let result_campus = await callGetList(
            {
              _list: ['校區'],
              _query: {
                '校區': list,
              },
            },
            if_campus_exist,
            if_department_exist
          );
          let campus = result_campus.finalList;
          if_campus_exist = result_campus.if_campus_exist;
          if(campus === '')campus = '/沒指定';
          finalList = finalList.concat(`${campus}/${list}`);
        }
        else{
          // console.log(11);
          finalList = finalList.concat(`/${list}`);
        }
      }
      // 若沒有找到公車停靠站點
      else {
        if(if_campus_exist){
          finalList = finalList.concat(`/${list}`);
        }else{
          finalList = finalList.concat(`/沒指定/${list}`);
        }
      }
    }
    // 如果並非「校區」、「單位名稱」、「單位內組別」、「大樓名稱」或「公車停靠站點」的CASE就直接將list回傳
    else {
      finalList = finalList.concat(`/${list}`);
    }
    // finalList = finalList.concat(`/${response.recordset[0].Information}`);
  }

  return {
    finalList,
    if_campus_exist,
    if_department_exist,
  };
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
    const intentList = await callGetList({
      _query: questionEntities,
      _list: defaultInformations,
    }, false, false);

    return intentList.finalList;
  } catch (err) {
    // console.log(`Error in callGetDBIntents: ${err.message}`);
  }
};

// 取得query question真正的intent
const getDBIntents = async (options) => {
  try {
    const start_time = new Date()/1000;
    const response = await requestPromise(options.pridictionUri);
    const after_luis_time = new Date()/1000;
    // console.log(`LUIS time: ${after_luis_time - start_time}`);
    const db_intent = JSON.parse(response).prediction;
    if(db_intent.topIntent == 'None' ||  db_intent.intents[db_intent.topIntent].score < 0.8){
      const after_parse_intent = new Date()/1000;
      // console.log(`Acknowledge Breakdown time: ${after_parse_intent - after_information_time}`);
      return options.question;
    };

    await connection.connect();
    const information = await getInformation(db_intent.topIntent);
    const after_information_time = new Date()/1000;
    // console.log(`Get information time: ${after_information_time - after_luis_time}`);
    let JSONinformation = {};
    let dbIntentList = '';
    // console.log(information);
    // console.log(db_intent.entities);
    // if( db_intent.intents[db_intent.topIntent].score < 0.8)return '無法判斷';
    // if(db_intent.entities[`${db_intent.topIntent}所需資訊`] !== undefined){
      // dbIntentList = await callGetDBIntents(options, db_intent.entities[`${db_intent.topIntent}所需資訊`][0], information, `${db_intent.topIntent}所需資訊`);
    // }
    // console.log(information);
    if(information[0] !== ''){
      if (db_intent.topIntent === '能租借之場地或設備一覽' || db_intent.topIntent === '門禁卡申請') {
        if_need_building_name = true;
      }
      dbIntentList = await callGetDBIntents(options, db_intent.entities, information, '所需資訊');
    }
    // dbIntentList = await callGetDBIntents(options, db_intent.entities, information, '所需資訊');
    connection.close();
    const after_parse_intent = new Date()/1000;
    // console.log(`Get real information time: ${after_parse_intent - after_information_time}`);
    // return db_intent.topIntent;
	// console.log(db_intent.topIntent)

    return `${db_intent.topIntent}${dbIntentList}`;
    // // // console.log(`${options.question}: ${db_intent.topIntent}${dbIntentList}`);
  } catch (err) {
    // // console.log(`Error in getDBIntents: ${err.message}`);
  }
};

module.exports = getDBIntents;
