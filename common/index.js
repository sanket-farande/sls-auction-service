import middy from '@middy/core';
import httpJsonBosyParser from '@middy/http-json-body-parser';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpErrorHandler from '@middy/http-error-handler';
import createError from 'http-errors';

export const commonMiddlewares = (handler) => middy(handler)
  .use([
    // Stringified body obj
    httpJsonBosyParser(),
    // Prevents from Cannot read properties of undefined error by adding those objects
    httpEventNormalizer(),
    // Error Handling
    httpErrorHandler()
  ]);

export const catchBlockCode = (error) => {
  let errmsg = error;
  if (error instanceof createError.HttpError) {
    throw error;
  }
  if (typeof error === 'object') {
    errmsg = error.message;
  }
  console.error(`Error in catch block : `, error, errmsg);
  throw new createError.InternalServerError(errmsg);
}