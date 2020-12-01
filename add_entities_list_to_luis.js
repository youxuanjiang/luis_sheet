const parse = require('./_parse_entities_list');
const addEntities = require('./_entity_list');

// LUIS Configure
const {
  LUISauthoringKey,
  LUISappName,
  LUISendpoint,
  LUISappCulture,
  LUISversionId,
  LUISappId,
} = require('./config_LUIS.js');

const googleSheetLocation = '1Lpnn__jjdgTmKL-g1rV5q1yJ2nHdK99Urd8SlAY5KZw';

/* add entities parameters */
var configAddEntities = {
  LUISSubscriptionKey: LUISauthoringKey,
  LUISappId,
  LUISversionId,
  enrityHeaderList: [],
  entityList: [],
  entityAliasList: {},
  uri: `${LUISendpoint}luis/authoring/v3.0-preview/apps/${LUISappId}/versions/${LUISversionId}/closedlists`,
};

parse(googleSheetLocation)
  .then(model => {
    configAddEntities.enrityHeaderList = model.entity_header;
    configAddEntities.entityList = model.entities;
    configAddEntities.entityAliasList = model.alias;
    return addEntities(configAddEntities);
  })
  .catch(err => {
    console.log(err.message);
  });
