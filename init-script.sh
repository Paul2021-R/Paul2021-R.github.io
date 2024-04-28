#! /bin/sh

pwd

cd blog

if [ -d "node_modules" ]; then
  echo "npm install has ben successfull"
else
  echo "npm install failed or has not been run."
  npm install
fi

npm run start