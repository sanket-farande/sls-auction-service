import AWS from 'aws-sdk';
import createError from 'http-errors';
import { commonMiddlewares } from 'auction-service-common';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export async function getAuctionById(id) {
    const result = await dynamoDB.get({ TableName: process.env.AUCTIONS_TABLE_NAME, Key: { id } }).promise();
    const auction = result.Item;
    return auction;
}

const getAuction = async (event) => {
    const { id } = event.pathParameters;
    let auction;

    try {
        auction = await getAuctionById(id);
    } catch (error) {
        console.error(error);
        throw new createError.InternalServerError(error);
    }

    if (!auction) {
        throw new createError.NotFound(`Auction not found with mentioned ID : ${id}`);
    }

    return {
        statusCode: 200,
        body: JSON.stringify(auction)
    };
};

export const handler = commonMiddlewares(getAuction);