#!/bin/bash

#Test script, runs jshint, starts the server, runs mocha and coverage,
#shutdowns the server and then creates coverage reports. Also results
#are outputted to terminal

#Colors
red="\e[0;31m"
lgreen="\e[92m"
dgray="\e[90m"
NC="\e[0m"

#Server binds to port 80, run with sudo (sudo npm test)
if [ "$(whoami)" != "root" ]; then
  echo -e ${red} "Error: Try running command as root/admin\n" ${NC}
  exit 1
fi

rm -rf ./.coverage_data # Remove previous coverage data
rm -rf ./public/coverage # Remove previous coverage report

echo -e ${lgreen} "Executing jshint..." ${NC}
./node_modules/jshint/bin/jshint ./lib > ./test/style_result.txt #Run jshint for all files inside lib
jshintErrors=$(tail -2 ./test/style_result.txt | head -2)
echo -e "jshint reported" ${red} ${jshintErrors} ${NC}

curl http://localhost/kill/after/tests > /dev/null 2>&1 #Call kill route on running server
sleep 1 #Wait 1 second
echo -e ${lgreen} "Starting Server and running tests..." ${NC}
#Start the server in the background
echo -e ${dgray}
./node_modules/cover/bin/cover run app.js -- --nc > ./test/log.json &
sleep 3 #Wait 3 seconds
rm -rf ./jail/tmp/* #Clean jail tmp dir
echo -e ${NC}
#Run mocha tests
./node_modules/cover/bin/cover run ./node_modules/mocha/bin/_mocha -- -R spec --recursive
echo -e ${lgreen} "Terminating Server..." ${NC}
curl http://localhost/kill/after/tests > /dev/null 2>&1 #Call kill route on server
sleep 1 #Wait 1 second

./node_modules/cover/bin/cover combine #Combine reports
./node_modules/cover/bin/cover report
./node_modules/cover/bin/cover report html

echo -e ${lgreen} "Coverage & Mocha Test Done" ${NC}