#!/bin/bash

mkdir $1
cd $1
git init
touch README
git add README
git commit -m 'first commit'
git remote add origin http://$2:$3@pandagitlab.sytes.net/$4/$1.git
git push -u origin master
cd ..
rm -rf $1