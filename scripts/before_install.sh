#!/bin/bash
if [[ -d /home/bitnami/image-uploader-devchallenges-io/dist ]] ; then
  cd /home/bitnami/image-uploader-devchallenges-io/dist
  forever stop main.js
fi
cd /
rm -rf /home/bitnami/image-uploader-devchallenges-io