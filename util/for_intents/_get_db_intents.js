const requestPromise = require('request-promise');
const queryString = require('querystring');

// 取得從question中parse出來的entities，再將其送進Entities中查表取得其正式名稱
const callGetList = async (option, informations) => {
  let finalList = '';
  for (let i = 0; i < informations._query.length; i++) {
    const queryParamsForList = {
      'subscription-key': option.LUISstagingSlotKey,
      verbose: true,
      query: informations._query[i],
    };
    const uri = `${option.LUISendpoint}luis/prediction/v3.0/apps/${option.LUISappId}/slots/staging/predict?${queryString.stringify(queryParamsForList)}`;
    const response = await requestPromise(uri);
    const queryList = informations._list[i];
    const list = JSON.parse(response).prediction.entities[queryList][0][0];
    console.log(`${queryList}: ${list}`);
    finalList = finalList.concat(`/${list}`)
  }
  return finalList;
};

// 從經判斷是「入學相關」的question中取得其entities
const getAdmissionInformationIntent = async (options, admission_information) => {
  // 入學相關 information (entities)
  const admissionInformation = {
    department: undefined,
    identity: undefined,
    class: undefined,
    admission_way: undefined,
    information: undefined,
  };

  if(admission_information.$instance.單位名稱 != undefined)
    admissionInformation.department = admission_information.$instance.單位名稱[0].text;
  if(admission_information.$instance.學生身份 != undefined)
    admissionInformation.identity = admission_information.$instance.學生身份[0].text;
  if(admission_information.$instance.申請班別 != undefined)
    admissionInformation.class = admission_information.$instance.申請班別[0].text;
  if(admission_information.$instance.入學管道 != undefined)
    admissionInformation.admission_way = admission_information.$instance.入學管道[0].text;
  if(admission_information.$instance.具體入學資訊 != undefined)
    admissionInformation.information = admission_information.$instance.具體入學資訊[0].text;

  if (admissionInformation.class == undefined) {
    if(admission_information.單位名稱 != undefined)
      if(admission_information.單位名稱[0].$instance != undefined)
        admissionInformation.class = admission_information.單位名稱[0].$instance.申請班別[0].text;
    if(admissionInformation.class == undefined) {
      admissionInformation.class = '大學部';
    }
  }

  if (admissionInformation.identity == undefined) {
    if(admission_information.申請班別 != undefined)
      if(admission_information.申請班別[0].$instance != undefined)
        admissionInformation.identity = admission_information.申請班別[0].$instance.學生身份[0].text;
    if (admissionInformation.identity == undefined) {
      admissionInformation.identity = '一般生';
    }
  }

  if (admissionInformation.admission_way == undefined) {
    if(admission_information.具體入學資訊 != undefined){
      if(admission_information.具體入學資訊[0].$instance != undefined){
        admissionInformation.admission_way = admission_information.具體入學資訊[0].$instance.入學管道[0].text;
      }
    }
    if (admissionInformation.admission_way == undefined) {
      admissionInformation.admission_way = '沒指定';
    }
  }

  // 取得entities之正式名稱
  const intentList = await callGetList(options, {
    _query: new Array(admissionInformation.department, admissionInformation.identity, admissionInformation.class, admissionInformation.admission_way, admissionInformation.information),
    _list: new Array('單位名稱', '學生身份', '班別', '入學管道', '具體入學資訊'),
  });

  return `入學相關${intentList}`;
};

// 從經判斷是「申請文件繳交」的question中取得其entities
const getDocumentSubmitionIntent = async(options, doc_submition_information) => {
  // 申請文件繳交 information (entities)
  const docSubmitionInformation = {
    category: undefined,
  };

  if(doc_submition_information.$instance.文件類別 != undefined)
    docSubmitionInformation.category = doc_submition_information.$instance.文件類別[0].text;

  // 取得entities之正式名稱
  const intentList = await callGetList(options, {
    _query: new Array(docSubmitionInformation.category),
    _list: new Array('文件類別'),
  });

  return `申請文件繳交${intentList}`;
}

// 從經判斷是「各單位逕博申請資訊」的question中取得其entities
const getDiameterIntent = async(options, diameter_information) => {
  // 申請文件繳交 information (entities)
  const diameterInformation = {
    department: undefined,
    class: undefined,
    information: undefined,
  };

  if(diameter_information.$instance.單位名稱 != undefined)
    diameterInformation.department = diameter_information.$instance.單位名稱[0].text;
  if(diameter_information.$instance.班別 != undefined)
    diameterInformation.class = diameter_information.$instance.班別[0].text;
  if(diameter_information.$instance.逕博資訊 != undefined)
    diameterInformation.information = diameter_information.$instance.逕博資訊[0].text;

  if (diameterInformation.class == undefined) {
    if(diameter_information.單位名稱 != undefined)
      if(diameter_information.單位名稱[0].$instance != undefined)
        diameterInformation.class = diameter_information.單位名稱[0].$instance.班別[0].text;
    if(diameterInformation.class == undefined) {
      diameterInformation.class = '碩士班';
    }
  }

  // 取得entities之正式名稱
  const intentList = await callGetList(options, {
    _query: new Array(diameterInformation.department, diameterInformation.class, diameterInformation.information),
    _list: new Array('單位名稱', '班別', '逕博資訊'),
  });

  return `各單位逕博申請資訊${intentList}`;
}

// 取得句子真正的intent
const getDBIntents = async (options) => {
  try {
    // console.log(options.question);
    const response = await requestPromise(options.pridictionUri);
    const db_intent = JSON.parse(response).prediction;
    if (db_intent.topIntent == '入學相關') {
      const dbIntentList = await getAdmissionInformationIntent(options, db_intent.entities.入學相關所需資訊[0]);
      console.log(`${options.question}: ${dbIntentList}`);
      return dbIntentList;
    }
    else if (db_intent.topIntent == '申請文件繳交') {
      const dbIntentList = await getDocumentSubmitionIntent(options, db_intent.entities.申請文件繳交所需資訊[0]);
      console.log(`${options.question}: ${dbIntentList}`);
      return dbIntentList;
    }
    else if (db_intent.topIntent == '各單位逕博申請資訊') {
      const dbIntentList = await getDiameterIntent(options, db_intent.entities.各單位逕博申請資訊所需資訊[0]);
      console.log(`${options.question}: ${dbIntentList}`);
      return dbIntentList;
    }
  } catch (err) {
    console.log(`Error in getDBIntents: ${err.message}`);
  }
};

module.exports = getDBIntents;
