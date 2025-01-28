import AWS from 'aws-sdk';
import { catchBlockCode, commonMiddlewares } from 'auction-service-common';
import validator from '@middy/validator';
import getAuctionsSchema from '../lib/schemas/getAuctionsSchema';
import { transpileSchema } from '@middy/validator/transpile';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const getAuctions = async (event) => {
  let auctions;
  let { status } = event.queryStringParameters;
  let params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    KeyConditionExpression: '#status = :status',
    IndexName: 'statusAndEndDate',
    ExpressionAttributeValues: {
      ':status': status
    },
    ExpressionAttributeNames: {
      '#status': 'status'
    }
  };
  try {
    const result = await dynamoDB.query(params).promise();
    auctions = result.Items;
  } catch (error) {
    catchBlockCode(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auctions)
  };
};

export const handler = commonMiddlewares(getAuctions)
  .use(validator({
    eventSchema: transpileSchema(getAuctionsSchema),
    ajvOptions: {
      useDefaults: true,
      strict: false
    }
  }));