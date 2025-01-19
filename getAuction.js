import AWS from 'aws-sdk';
import middy from '@middy/core'
import httpJsonBosyParser from '@middy/http-json-body-parser'
import httpEventNormalizer from '@middy/http-event-normalizer'
import httpErrorHandler from '@middy/http-error-handler';
import createError from 'http-errors';

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

export const handler = middy(getAuction)
    // Stringified body obj 
    .use(httpJsonBosyParser())
    // Prevents from Cannot read properties of undefined error by adding those objects
    .use(httpEventNormalizer())
    // Error Handling
    .use(httpErrorHandler())