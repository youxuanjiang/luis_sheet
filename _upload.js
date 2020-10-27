// node 7.x
// uses async/await - promises

const request = require('requestretry');

// time delay between requests
const delayMS = 10000;

// retry recount
const maxRetry = 100;

// retry request if error or 429 received
const retryStrategy = (err, response) => {
  const shouldRetry = err || response.statusCode === 429;
  // if (shouldRetry) console.log('retrying add examples...');
  return shouldRetry;
};

const getRequestInBatch = intentsAndQuestions => {
  // break items into pages to fit max batch size
  const pages = [];
  let page = [];
  let exampleId = 0;

  console.log('Starting adding Questions...');

  // 批次，每100個為一個批次，每一百個送一個request出去
  intentsAndQuestions.intents.forEach(intent => {
    // console.log('enter intents for each');
    intentsAndQuestions.questions[intent].forEach(question => {
      // console.log('    enter question for each');
      page.push({
        text: question,
        intentName: intent,
        entityLabels: [],
        ExampleId: (exampleId += 1),
      });
      if (exampleId % 100 === 0) {
        pages.push(page);
        page = [];
      }
    });
  });

  if (page !== []) {
    pages.push(page);
    page = [];
  }

  return pages;
};

// send json batch as post.body to API
const sendBatchToApi = async options => {
  const response = await request(options);
  // console.log(`StatusCode: ${response.statusCode}`);
  // console.log(options.body);
  // return {page: options.body, response:response};
  return { response };
};

// main function to call
const upload = async config => {
  const uploadPromises = [];
  const url = config.uri.replace('default_id', config.LUISappId);

  // 100 requests per batch
  const pages = getRequestInBatch({
    intents: config.intents,
    questions: config.questions,
  });

  // load up promise array
  pages.forEach(_page => {
    const pagePromise = sendBatchToApi({
      url,
      fullResponse: false,
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': config.LUISSubscriptionKey,
      },
      json: true,
      body: _page,
      maxAttempts: maxRetry,
      retryDelay: delayMS,
      retryStrategy,
    });

    uploadPromises.push(pagePromise);
  });

  // execute promise array

  await Promise.all(uploadPromises);
  // console.log(`\n\nResults of all promises = ${JSON.stringify(results)}`);
  console.log('upload done');
};

module.exports = upload;
