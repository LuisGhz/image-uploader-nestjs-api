import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
  return {
    bucketName: process.env.BUCKET_NAME,
    accessKey: process.env.ACCESS_KEY,
    secretKey: process.env.SECRET_KEY,
  };
});
