import AWS from 'aws-sdk';
import createError from 'http-errors';
import { commonMiddlewares } from 'auction-service-common';

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

export const handler = commonMiddlewares(getAuctions);