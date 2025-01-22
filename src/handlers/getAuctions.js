import AWS from 'aws-sdk';
import { catchBlockCode, commonMiddlewares } from 'auction-service-common';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const getAuctions = async (event) => {
  let auctions;

  try {
    const result = await dynamoDB.scan({ TableName: process.env.AUCTIONS_TABLE_NAME }).promise();
    auctions = result.Items;
  } catch (error) {
    catchBlockCode(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auctions)
  };
};

export const handler = commonMiddlewares(getAuctions);