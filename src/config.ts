import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
  return {
    bucketName: process.env.BUCKET_NAME,
    bucketRegion: process.env.BUCKET_REGION,
    accessKey: process.env.ACCESS_KEY,
    secretKey: process.env.SECRET_KEY,
    bucketUrl: process.env.BUCKET_URL,
    hello: process.env.HELLO_WORLD,
  };
});
