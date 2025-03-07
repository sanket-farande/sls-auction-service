import AWS from 'aws-sdk';
import createError from 'http-errors';
import { commonMiddlewares, catchBlockCode } from 'auction-service-common';
import { getAuctionById } from './getAuction';
import validator from '@middy/validator';
import placeBidSchema from '../lib/schemas/placeBidSchema';
import { transpileSchema } from '@middy/validator/transpile';

const placeBid = async (event) => {
  let updatedAuction;

  try {
    const dynamoDB = new AWS.DynamoDB.DocumentClient();
    const { id } = event.pathParameters;
    const { amount } = event.body;
    const { email } = event.requestContext.authorizer;
    const params = {
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Key: { id },
      UpdateExpression: 'set highestBid.amount = :amount, highestBid.bidder = :bidder',
      ExpressionAttributeValues: {
        ':amount': amount,
        ':bidder': email
      },
      ReturnValues: 'ALL_NEW'
    };

    // Validation
    const auction = await getAuctionById(id);
    if (!auction) {
      throw new createError.NotFound(`Auction not found with mentioned ID : ${id}`);
    }
    if (auction.status === 'CLOSED') {
      throw new createError.Forbidden(`Cannot place a bid on closed auctions`);
    }
    if (amount <= auction?.highestBid?.amount) {
      throw new createError.Forbidden(`Your bid must be higher than current amount ${auction.highestBid.amount}`);
    }
    if (email === auction?.highestBid?.bidder) {
      throw new createError.Forbidden(`You are already the highest bidder`);
    }
    if (email === auction?.seller) {
      throw new createError.Forbidden(`You cannot bid for your own auction`);
    }

    // Updation
    const result = await dynamoDB.update(params).promise();
    updatedAuction = result.Attributes;
  } catch (error) {
    catchBlockCode(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction)
  };
};

export const handler = commonMiddlewares(placeBid)
  .use(validator({
    eventSchema: transpileSchema(placeBidSchema),
    ajvOptions: {
      useDefaults: true,
      strict: false
    }
  }));