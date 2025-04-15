import AWS from 'aws-sdk';
const dynamodb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

// Close auctions and inform bidder and seller
export async function closeAuction(auction) {
    const { id } = auction;
    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
        UpdateExpression: 'set #status = :status',
        ExpressionAttributeValues: {
            ':status': 'CLOSED'
        },
        ExpressionAttributeNames: {
            '#status': 'status'
        }
    };
    await dynamodb.update(params).promise();

    const { title, seller, highestBid } = auction;
    const { amount, bidder } = highestBid;

    console.log(`Informing bidder ${bidder} and seller ${seller} for an auction ${JSON.stringify(auction)}`);

    const notifyBidder = sqs.sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
            subject: 'You won an Auction!',
            recipient: bidder,
            body: `Whooo! you got an item ${title} for ${amount}`,
        })
    }).promise();
    const notifySeller = sqs.sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
            subject: 'Your item has been sold!',
            recipient: seller,
            body: `Whooo! your item ${title} has been sold for ${amount}`,
        })
    }).promise();

    return Promise.all([notifyBidder, notifySeller]);
}