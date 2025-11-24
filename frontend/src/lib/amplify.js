import { Amplify } from 'aws-amplify';

const region = import.meta.env.VITE_AWS_REGION;
const userPoolId = import.meta.env.VITE_COG_USER_POOL_ID;
const userPoolClientId = import.meta.env.VITE_COG_CLIENT_ID;

if (!region || !userPoolId || !userPoolClientId) {
  console.error('Missing AWS/Cognito env vars in .env');
} else {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,   // v6 key name
        region,
        loginWith: { email: true, username: false, phone: false },
      },
    },
  });
}
