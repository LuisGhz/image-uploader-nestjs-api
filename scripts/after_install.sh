#!/bin/bash
cd /home/bitnami/www/image-uploader-devchallenges-io
npm install
npm run build
cp /home/bitnami/www/envs/image-uploader-devchallenges-io.env /home/bitnami/www/image-uploader-devchallenges-io/dist/.env
cd /home/bitnami/www/image-uploader-devchallenges-io/dist/
forever start main.js