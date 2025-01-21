import AWS from 'aws-sdk';
import createError from 'http-errors';
import { commonMiddlewares } from 'auction-service-common';
import { getAuctionById } from './getAuction';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const placeBid = async (event) => {
  const { id } = event.pathParameters;
  const { amount } = event.body;
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set highestBid.amount = :amount',
    ExpressionAttributeValues: {
      ':amount': amount
    },
    ReturnValues: 'ALL_NEW'
  };

  let updatedAuction;

  try {
    // Validation
    const auction = await getAuctionById(id);
    if (!auction) {
      throw new createError.NotFound(`Auction not found with mentioned ID : ${id}`);
    }
    if (amount <= auction?.highestBid?.amount) {
      throw new createError.Forbidden(`Your bid must be higher than current amount ${auction.highestBid.amount}`);
    }

    // Updation
    const result = await dynamoDB.update(params).promise();
    updatedAuction = result.Attributes;
  } catch (error) {
    if (error instanceof createError.HttpError) {
      throw error;
    }
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction)
  };
};

export const handler = commonMiddlewares(placeBid);