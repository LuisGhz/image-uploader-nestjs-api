#!/bin/bash
cd /home/bitnami/image-uploader-devchallenges-io
npm install
npm run build
cp /home/bitnami/envs/image-uploader-devchallenges-io.env /home/bitnami/image-uploader-devchallenges-io/dist/.env
cd /home/bitnami/image-uploader-devchallenges-io/dist/
forever start main.js