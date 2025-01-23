import { v4 } from 'uuid';
import AWS from 'aws-sdk';
import { catchBlockCode, commonMiddlewares } from 'auction-service-common';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const createAuction = async (event) => {
  const { title } = event.body;
  const now = new Date();
  const endDate = new Date();
  endDate.setHours(endDate.getHours() + 1);

  const auction = {
    id: v4(),
    title,
    status: 'OPEN',
    createdAt: now.toISOString(),
    endingAt: endDate.toISOString(),
    highestBid: {
      amount: 0
    }
  };

  try {
    await dynamoDB.put({
      // Environment variable
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Item: auction
    }).promise();
  } catch (error) {
    catchBlockCode(error);
  }

  // 201: Resource created
  return {
    statusCode: 201,
    body: JSON.stringify({ auction })
  };
};

export const handler = commonMiddlewares(createAuction);