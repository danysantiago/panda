#!/bin/bash
# usage: ./createRepo.sh 1 2 3 4 5
# 1: project name (required)
# 2: username (required)
# 3: password (required)
# 4: project owner username (required)
# 5: archive file (project skeleton) (optional)

tmpDir=`mktemp -d --tmpdir="../../tmp/"` #Create tmp folder

mkdir -p $tmpDir"/"$1 #create temp project directory

cd $tmpDir"/"$1 #move to temp directory

git init #initialize git repository

touch README #create dummy read me file

git add README #add dummy read me to git tracking files

if [ $# -eq 5 ] ; then #if archive file
	if [[ "$5" = *.zip ]] ; then #if .zip
		unzip $5 #decompress zip file
	elif [[ "$5" = *.tar.gz ]] ; then #if tar file
		tar -xzf $5 #decompress tar file
	fi
fi

git add * #add all new files to git tracking files

git commit -m 'Initial commit' #make initial commit

git remote add origin http://$2:$3@pandagitlab.sytes.net/$4/$1.git #add origin to repository

#SUPER SKETCHY VALUE
sleep 5 #Wait 5 seconds for propagation

git push origin master #push to master
 
rm -rf $tmpDir #remove temp folder