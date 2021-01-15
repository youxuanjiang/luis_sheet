const parse = require('./util/for_add_entities/_parse');
const addEntities = require('./util/for_add_entities/_entity_list');

// LUIS Configure
const {
  LUISauthoringKey,
  LUISendpoint,
  LUISversionId,
  LUISappId,
} = require('./config_LUIS.js');

const googleSheetLocation = '1N3WnrBEFJA2-EzPBPaZfAChS4Rc3oQeBOG3gyHPWkwk';

/* add entities parameters */
const configAddEntities = {
  LUISSubscriptionKey: LUISauthoringKey,
  LUISappId,
  LUISversionId,
  enrityHeaderList: [],
  entityList: [],
  entityAliasList: {},
  uri: `${LUISendpoint}luis/authoring/v3.0-preview/apps/${LUISappId}/versions/${LUISversionId}/closedlists`,
};

parse(googleSheetLocation)
    .then((model) => {
      configAddEntities.enrityHeaderList = model.entity_header;
      configAddEntities.entityList = model.entities;
      configAddEntities.entityAliasList = model.alias;
      console.log('------------------------------------[parse done]-------------------------------------');
      return addEntities(configAddEntities);
    })
    .catch((err) => {
      console.log(err.message);
    });
