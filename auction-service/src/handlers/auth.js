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

// JWT based auth and allowing access to the lambdas
export const handler = async (event) => {
  try {
    // Validation
    if (!event.authorizationToken) {
      throw new createError.Unauthorized();
    }

    const token = event.authorizationToken.replace('Bearer ', '');
    const claims = jwt.verify(token, process.env.AUTH0_PUBLIC_KEY);
    const policy = generatePolicy(claims.sub, event.methodArn);

    // API gateway needs reponse in this format
    const policyDoc = {
      ...policy,
      context: claims
    };
    return policyDoc;
  } catch (error) {
    // This way error handling wont work as it returns {message: null} through API Gateway
    catchBlockCode(error);
  }
};