#!/bin/bash

# Get the access token using gcloud CLI
ACCESS_TOKEN=$(gcloud auth print-access-token)

if [ $? -eq 0 ]; then
    echo "Your Google Cloud access token is:"
    echo $ACCESS_TOKEN
    echo
    echo "Add this token to your .env.local file as GOOGLE_CLOUD_ACCESS_TOKEN"
else
    echo "Failed to get access token. Make sure you:"
    echo "1. Have gcloud CLI installed"
    echo "2. Are logged in (run 'gcloud auth login')"
    echo "3. Have selected the correct project (run 'gcloud config set project YOUR_PROJECT_ID')"
fi 