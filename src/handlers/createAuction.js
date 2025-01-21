import { v4 } from 'uuid';
import AWS from 'aws-sdk';
import { commonMiddlewares } from 'auction-service-common';
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

export const handler = commonMiddlewares(createAuction);