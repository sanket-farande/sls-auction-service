import AWS from 'aws-sdk';
import createError from 'http-errors';
import { catchBlockCode, commonMiddlewares } from 'auction-service-common';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export async function getAuctionById(id) {
  const result = await dynamoDB.get({ TableName: process.env.AUCTIONS_TABLE_NAME, Key: { id } }).promise();
  const auction = result.Item;
  return auction;
}

const getAuction = async (event) => {
  try {
    let auction;
    const { id } = event.pathParameters;
    auction = await getAuctionById(id);
    if (!auction) {
      throw new createError.NotFound(`Auction not found with mentioned ID : ${id}`);
    }

    // 200: OK
    return {
      statusCode: 200,
      body: JSON.stringify(auction)
    };
  } catch (error) {
    catchBlockCode(error);
  }
};

export const handler = commonMiddlewares(getAuction);