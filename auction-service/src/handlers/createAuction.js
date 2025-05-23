import { v4 } from 'uuid';
import AWS from 'aws-sdk';
import { catchBlockCode, commonMiddlewares } from 'auction-service-common';
import validator from '@middy/validator';
import createAuctionSchema from '../lib/schemas/createAuctionSchema';
import { transpileSchema } from '@middy/validator/transpile';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Create auction for 1hour
const createAuction = async (event) => {
  try {
    const { title } = event.body;
    const { email } = event.requestContext.authorizer;
    const now = new Date();
    const endDate = new Date();
    endDate.setHours(endDate.getHours() + 1);

    const auction = {
      id: v4(),
      title,
      status: 'OPEN',
      seller: email,
      createdAt: now.toISOString(),
      endingAt: endDate.toISOString(),
      highestBid: {
        amount: 0
      }
    };

    // Updation
    await dynamoDB.put({
      // Environment variable
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Item: auction
    }).promise();

    // 201: Resource created
    return {
      statusCode: 201,
      body: JSON.stringify({ auction })
    };
  } catch (error) {
    catchBlockCode(error);
  }
};

export const handler = commonMiddlewares(createAuction)
  .use(validator({
    eventSchema: transpileSchema(createAuctionSchema),
    ajvOptions: {
      useDefaults: true,
      strict: false
    }
  }));