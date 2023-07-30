#!/bin/bash
if [[ -d /home/bitnami/www/image-uploader-devchallenges-io/dist ]] ; then
  cd /home/bitnami/www/image-uploader-devchallenges-io/dist
  forever stop main.js
fi
cd /
rm -rf /home/bitnami/www/image-uploader-devchallenges-io