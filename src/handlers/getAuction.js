import AWS from 'aws-sdk';
import createError from 'http-errors';
import { commonMiddlewares } from 'auction-service-common';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const getAuction = async (event) => {
    let auction;
    const { id } = event.pathParameters;
    try {
        const result = await dynamoDB.get({ TableName: process.env.AUCTIONS_TABLE_NAME, Key: { id } }).promise();
        auction = result.Item;
    } catch (error) {
        console.error(error);
        throw new createError.InternalServerError(error);
    } finally {
        if (!auction) {
            throw new createError.NotFound(`Auction not found with mentioned ID : ${id}`);
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify(auction)
    }
}

export const handler = commonMiddlewares(getAuction);