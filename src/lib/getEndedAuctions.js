import AWS from 'aws-sdk';
const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function getEndedAuctions() {
    const now = new Date();
    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        IndexName: 'statusAndEndDate',
        KeyConditionExpression: '#status = :status AND endingAt <= :now',
        // Values: Replaced in expression runtime
        ExpressionAttributeValues: {
            ':status': 'OPEN',
            ':now': now.toISOString()
        },
        // For reserved words
        ExpressionAttributeNames: {
            '#status': 'status'
        }
    };

    const result = await dynamodb.query(params).promise();
    return result.Items;
}