// node 7.x
// uses async/await - promises

const request = require('requestretry');

// time delay between requests
const delayMS = 1000;

// retry recount
const maxRetry = 5;

// check if get error when upload Questions
var no_err = true;

// retry request if error or 429 received
const retryStrategy = (err, response, r_section_a, r_section_b) => {
  const shouldRetry = err || response.statusCode >= 400;
  return shouldRetry;
};

const getRequestInBatch = intentsAndQuestions => {
  // break items into pages to fit max batch size
  const pages = [];
  let page = [];
  let exampleId = 0;

  console.log('\nStarting adding Questions...');
  // console.log(intentsAndQuestions.intentHeaderList);

  // 批次，每50個為一個批次，每一百個送一個request出去
  intentsAndQuestions.intentHeaderList.forEach( header => {
    // console.log(`enter ${header}`);
    intentsAndQuestions.intentList[header].forEach(intent => {
      // console.log(`enter ${intent}`);
      intentsAndQuestions.questions[header][intent].forEach(question => {
        // console.log(`enter ${question}`);
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
  // Check if any error happened in this batch of questions (examples)
  response.forEach( uttr => {
      if(uttr.hasError){
        console.log(uttr.value);
        no_err = false;
      }
  });
  return { response };
};

// main function to call
const upload = async config => {
  const uploadPromises = [];

  // 100 requests per batch
  const pages = getRequestInBatch({
    intentHeaderList: config.intentHeaderList,
    intentList: config.intentList,
    questions: config.questions,
  });

  // load up promise array
  pages.forEach(async (_page) => {
    uploadPromises.push(sendBatchToApi({
      url: config.uri,
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
    }));
    //console.log(_page);
  });

  // execute promise array

  await Promise.all(uploadPromises);
  // console.log(`\n\nResults of all promises = ${JSON.stringify(results)}`);
  if(no_err)console.log('upload done');
};

module.exports = upload;
