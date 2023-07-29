#!/bin/bash
cd /var/www/image-uploader-devchallenges-io
/opt/bitnami/node/bin/npm install
/opt/bitnami/node/bin/npm run build
cp /var/www/envs/image-uploader-devchallenges-io.env /var/www/image-uploader-devchallenges-io/dist/.env
cd /var/www/image-uploader-devchallenges-io/dist/
forever start main.js