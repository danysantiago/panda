#!/bin/bash

mkdir $1
cd $1
git init
touch README
git add README
tar -xvzf ../$2
git add *
git commit -m 'first commit'
git remote add origin http://$3:$4@pandagitlab.sytes.net/$5/$1.git
git push -u origin master
cd ..
rm -rf $1