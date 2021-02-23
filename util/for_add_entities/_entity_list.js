const request = require('requestretry');

// time delay between requests
const delayMS = 1000;

// retry recount
const maxRetry = 5;

// retry request if error or 429 received
const retryStrategy = async (err, response, r_section_a, r_section_b) => {
  if(response.statusCode === 201)console.log(`[${r_section_b.body.name}] statusCode is ${response.statusCode}`);
  const shouldRetry = err || response.statusCode >= 400;
  // console.log(r_section_b);
  if (response.statusCode === 400) {
    // When the entity has already created.
    // console.log(`[${r_section_b.body.name}] Entity list has already exsit.`);

    // console.log(`[${r_section_b.body.name}] Get id...`);
    const option = {
      url: r_section_b.url,
      fullResponse: false,
      method: 'GET',
      headers: r_section_b.headers,
    };
    // To get the id of that entity.
    const result_get = await request(option);
    let id_get;
    for (let i = 0; i < JSON.parse(result_get).length; i++) {
      // console.log(JSON.parse(result_get)[i]);
      if (JSON.parse(result_get)[i].name == r_section_b.body.name) {
        id_get = JSON.parse(result_get)[i].id;
      }
    }
    // Delete it.
    // console.log(`[${r_section_b.body.name}] Deleting ...`);
    const d_entity_uri = `${r_section_b.url}/${id_get}`;
    // console.log(`[${r_section_b.body.name}] id is ${id_get}`);
    // console.log(d_entity_uri);
    await request({
      url: d_entity_uri,
      fullResponse: false,
      method: 'DELETE',
      headers: r_section_b.headers,
    });
    // console.log(`[${r_section_b.body.name}] Updating...`);
  }

  return shouldRetry;
};

// Send JSON as the body of the POST request to the API
const callAddEntity = async (options) => {
  try {
    console.log(`[${options.body.name}] uploading to LUIS...`);
    const response = await request(options);
    console.log(`[${options.body.name}] finish uploading with response ${response}`);
    return {response};
  } catch (err) {
    console.log(`error in callAddEntity: ${err.message}`);
  }
};

// main function to call
// Call add-entities
const addEntities = async (config) => {
  config.enrityHeaderList.forEach(async (header) => {
    const sublists = [];
    config.entityList[header].forEach((entity) => {
      try {
        config.entityName = entity;
        config.entityAlias = config.entityAliasList[header][entity];

        sublists.push({
          canonicalForm: config.entityName,
          list: config.entityAlias,
        });

        // console.log(`[${header}] ${entity} with alias ${config.entityAlias}.`);
      } catch (err) {
        console.log(`Error in addEntities:  ${err.message} `);
        // throw err;
      }
    }, this);

    const jsonBody = {
      name: header,
      sublists,
    };

    await callAddEntity({
      url: config.uri,
      fullResponse: false,
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': config.LUISSubscriptionKey,
      },
      json: true,
      body: jsonBody,
      maxAttempts: maxRetry,
      retryDelay: delayMS,
      retryStrategy,
    });
    // let response = result;// await fse.writeJson(createResults.json, results);
    // return response;
  }, this);
};

module.exports = addEntities;
