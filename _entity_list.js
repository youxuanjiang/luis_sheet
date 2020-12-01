const request = require("requestretry");

// time delay between requests
const delayMS = 1000;

// retry recount
const maxRetry = 5;

// retry request if error or 429 received
const retryStrategy = async (err, response, r_section_a, r_section_b) => {
  console.log(`${r_section_b.body.name}: ${response.statusCode}`);
  const shouldRetry = err || response.statusCode >= 400;
  // console.log(r_section_b);
  if (shouldRetry){
    // When the entity has already created.
    console.log(`Entity list \"${r_section_b.body.name}\" has already exsit.`);

    var jsonBody = {
        "name": r_section_b.body.name,
    };

    console.log(`Get \"${r_section_b.body.name}\" id...`);
    // To get the id of that entity.
    let result = await request({
        url: r_section_b.url,
        fullResponse: false,
        method: 'GET',
        headers: r_section_b.headers,
        json: true,
        body: jsonBody,
    });
    console.log(`\"${r_section_b.body.name}\" id is ${result[0].id}`);
    // Delete it.
    console.log(`deleting \"${r_section_b.body.name}\"...`);
    const d_entity_uri = `${r_section_b.url}/${result[0].id}`;
    // console.log(d_entity_uri);
    result = await request({
        url: d_entity_uri,
        fullResponse: false,
        method: 'DELETE',
        headers: r_section_b.headers,
    });
    console.log(`Updating \"${r_section_b.body.name}\"...`);
  }

  return shouldRetry;
};

// Send JSON as the body of the POST request to the API
var callAddEntity = async (options) => {
    try {
        console.log(`uploading \"${options.body.name}\" to LUIS...`);
        var response = await request(options);
        console.log(`finish uploading \"${options.body.name}\" with response ${response}`);
        return { response: response };

    } catch (err) {
        console.log(`error in callAddEntity: ${err.message}`);
    }
}

// main function to call
// Call add-entities
var addEntities = (config) => {
    config.enrityHeaderList.forEach(async (header) => {
      const sublists = [];
      config.entityList[header].forEach(function (entity) {
          try {
              config.entityName = entity;
              config.entityAlias = config.entityAliasList[header][entity];

              sublists.push({
                "canonicalForm": config.entityName,
                "list": config.entityAlias,
              });

              console.log(`${header}: ${entity} with alias ${config.entityAlias}.`);

          } catch (err) {
              console.log(`Error in addEntities:  ${err.message} `);
              //throw err;
          }
      }, this);


      var jsonBody = {
          "name": header,
          "sublists": sublists,
      };

      let result = await callAddEntity({
          url: config.uri,
          fullResponse: false,
          method: 'POST',
          headers: {
              'Ocp-Apim-Subscription-Key': config.LUISSubscriptionKey
          },
          json: true,
          body: jsonBody,
          maxAttempts: maxRetry,
          retryDelay: delayMS,
          retryStrategy: retryStrategy
      });
      let response = result;// await fse.writeJson(createResults.json, results);
    }, this);
}

module.exports = addEntities;
