#!/bin/bash
cd /var/www/image-uploader-devchallenges-io
npm install
npm run build
cp /var/www/envs/image-uploader-devchallenges-io.env /var/www/image-uploader-devchallenges-io/dist/.env
cd /var/www/image-uploader-devchallenges-io/dist/
forever start main.js