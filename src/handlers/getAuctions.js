import AWS from 'aws-sdk';
import middy from '@middy/core'
import httpJsonBosyParser from '@middy/http-json-body-parser'
import httpEventNormalizer from '@middy/http-event-normalizer'
import httpErrorHandler from '@middy/http-error-handler';
import createError from 'http-errors';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const getAuctions = async (event) => {
    let auctions;

    try {
        const result = await dynamoDB.scan({ TableName: process.env.AUCTIONS_TABLE_NAME }).promise();
        auctions = result.Items;
    } catch (error) {
        console.error(error);
        throw new createError.InternalServerError(error);
    }

    return {
        statusCode: 200,
        body: JSON.stringify(auctions)
    }
}

export const handler = middy(getAuctions)
    // Stringified body obj 
    .use(httpJsonBosyParser())
    // Prevents from Cannot read properties of undefined error by adding those objects
    .use(httpEventNormalizer())
    // Error Handling
    .use(httpErrorHandler())