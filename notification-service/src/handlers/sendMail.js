const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: 'eu-west-1' });
const { catchBlockCode } = require('auction-service-common');

async function sendMail(event) {
    try {
        const record = event.Records[0];
        console.log(`Processing record`, record);

        const { subject, body, recipient } = JSON.parse(record.body);

        const params = {
            Source: 'teknasvideos@gmail.com',
            Destination: {
                ToAddresses: [recipient],
            },
            Message: {
                Body: {
                    Text: {
                        Data: body
                    }
                },
                Subject: {
                    Data: subject
                }
            }
        };
        const result = await ses.sendEmail(params).promise();
        console.log(result);
        return result;
    } catch (error) {
        catchBlockCode(error);
    }
}

export const handler = sendMail;