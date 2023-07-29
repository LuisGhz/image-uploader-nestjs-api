#!/bin/bash
if [[ -d /var/www/image-uploader-devchallenges-io/dist ]] ; then
  cd /var/www/image-uploader-devchallenges-io/dist
  forever stop main.js
fi
cd /
rm -rf /var/www/image-uploader-devchallenges-io