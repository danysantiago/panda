#!/bin/bash
# usage: ./createRepo.sh 1 2 3 4 5
# 1: project name (required)
# 2: username (required)
# 3: password (required)
# 4: project owner username (required)
# 5: archive file (project skeleton) (optional)

mkdir $1 #create temp project directory

cd $1 #move to temp directory

git init #initialize git repository

touch README #create dummy read me file

git add README #add dummy read me to git tracking files

if [ $# -eq 5 ] ; then #if archive file
	if [[ "$5" = *.zip* ]] ; then #if .zip
		unzip $5 #decompress zip file
	elif [[ "$5" = *.tar* ]] ; then #if tar file
		tar -xvzf $5 #decompress tar file
	fi
fi

git add * #add all new files to git tracking files

git commit -m 'initial commit' #make initial commit

git remote add origin http://$2:$3@pandagitlab.sytes.net/$4/$1.git #add origin to repository

git push -u origin master #push to master

cd .. #go to original folder
 
rm -rf $1 #remove temp folder