import jwksClient from 'jwks-rsa';
import jwt from 'jsonwebtoken';

const client = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/discovery/v2.0/keys`,
});

function getSigningKey(header: jwt.JwtHeader): Promise<string> {
  return new Promise((resolve, reject) => {
    client.getSigningKey(header.kid as string, (err, key) => {
      if (err) return reject(err);
      resolve(key!.getPublicKey());
    });
  });
}

export async function verifyAzureToken(azureToken: string): Promise<{ email: string }> {
  const decoded = await new Promise<any>((resolve, reject) => {
    jwt.verify(
      azureToken,
      (header, callback) => {
        getSigningKey(header)
          .then((key) => callback(null, key))
          .catch((err) => callback(err));
      },
      {
        audience: process.env.AZURE_CLIENT_ID,
        issuer: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0`,
      },
      (err, payload) => {
        if (err) return reject(new Error('Invalid Azure token'));
        resolve(payload);
      }
    );
  });

  const email = decoded.email ?? decoded.preferred_username;
  if (!email) throw new Error('Email not found in Azure token');

  return { email };
}