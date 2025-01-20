import middy from '@middy/core';
import httpJsonBosyParser from '@middy/http-json-body-parser';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpErrorHandler from '@middy/http-error-handler';

const commonMiddleware = (handler) => middy(handler)
  .use([
    // Stringified body obj 
    httpJsonBosyParser(),
    // Prevents from Cannot read properties of undefined error by adding those objects
    httpEventNormalizer(),
    // Error Handling
    httpErrorHandler()
  ]);

export default commonMiddleware;