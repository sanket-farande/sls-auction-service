import jwt from 'jsonwebtoken';
import { catchBlockCode } from 'auction-service-common';
import createError from 'http-errors';

const generatePolicy = function (principalId, methodArn) {
    const apiGatewayWildcard = methodArn.split('/', 2).join('/') + '/*';
    return {
        principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [{
                Action: 'execute-api:Invoke',
                Effect: 'Allow',
                Resource: apiGatewayWildcard
            }]
        }
    };
};

export const handler = async (event) => {
    try {
        if (!event.authorizationToken) {
            throw new createError.Unauthorized();
        }
        const token = event.authorizationToken.replace('Bearer ', '');
        const claims = jwt.verify(token, process.env.AUTH0_PUBLIC_KEY);
        const policy = generatePolicy(claims.sub, event.methodArn);
        const policyDoc = {
            ...policy,
            context: claims
        };
        return policyDoc;
    } catch (error) {
        catchBlockCode(error);
    }
};