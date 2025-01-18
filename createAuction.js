import { v4 } from 'uuid';
import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export const createAuction = async (event) => {
  const { title } = JSON.parse(event.body);
  const now = new Date();

  const auction = {
    id: v4(),
    title,
    status: 'OPEN',
    createdAt: now.toISOString()
  }

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
};
