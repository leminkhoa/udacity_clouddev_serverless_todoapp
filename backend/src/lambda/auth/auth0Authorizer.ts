import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

const jwksUrl = process.env.JWKS_URL

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  logger.info('Verifying token from header')
  /* Extract and Decode JWT from authorization */
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  /* Retrieve JWKS from issuer */
  const response = await Axios.get(jwksUrl);
  const keys = response.data.keys;
  const signingKey = keys.find(key => key.kid === jwt.header.kid);
  if (!signingKey) {
    throw new Error('Cannot find any signingKey that matches header kid')
  }

  /* Extract public key from signingKey */
  const publicKey = signingKey.x5c[0];
  logger.info('Found public key!', publicKey)

  /* Verify and return token */
  const verifiedToken = verify(token, createCert(publicKey), { algorithms: ['RS256'] }) as JwtPayload
  logger.info('verifiedToken: ', verifiedToken)
  return verifiedToken
}


function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}


function createCert(key) {
  key = key.match(/.{1,64}/g).join('\n');
  return `-----BEGIN CERTIFICATE-----\n${key}\n-----END CERTIFICATE-----\n`;
}