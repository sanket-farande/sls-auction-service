import { v4 } from 'uuid';
import AWS from 'aws-sdk';
import middy from '@middy/core'
import httpJsonBosyParser from '@middy/http-json-body-parser'
import httpEventNormalizer from '@middy/http-event-normalizer'
import httpEventHandler from '@middy/http-error-handler'
import httpErrorHandler from '@middy/http-error-handler';
import createError from 'http-errors';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const createAuction = async (event) => {
  const { title } = event.body;
  const now = new Date();

  const auction = {
    id: v4(),
    title,
    status: 'OPEN',
    createdAt: now.toISOString()
  }

  try {
    await dynamoDB.put({
      // Environment variable
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Item: auction
    }).promise();
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  // 201: Resource created
  return {
    statusCode: 201,
    body: JSON.stringify({ auction })
  };
};

export const handler = middy(createAuction)
  // Stringified body obj 
  .use(httpJsonBosyParser())
  // Prevents from Cannot read properties of undefined error by adding those objects
  .use(httpEventNormalizer())
  // Error Handling
  .use(httpErrorHandler())