const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: 'eu-west-1' });
const { catchBlockCode } = require('auction-service-common');

async function sendMail(event) {
    try {
        const params = {
            Source: 'teknasvideos@gmail.com',
            Destination: {
                ToAddresses: ['teknasvideos@gmail.com'],
            },
            Message: {
                Body: {
                    Text: {
                        Data: 'Hello from AWS SES practice'
                    }
                },
                Subject: {
                    Data: 'AWS SES Test Mail'
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