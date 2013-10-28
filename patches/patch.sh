#!/bin/bash

#Patches to apply after modules installation

#Cover patch to work with Node 0.10.17+ (https://github.com/itay/node-cover/pull/39)
patch ./node_modules/cover/bin/cover ./patches/cover.patch