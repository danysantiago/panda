all:
	gcc -c error.c -Wall -ansi -pedantic
	gcc -c safe.c -Wall -ansi -pedantic
	gcc -o os-detect os-detect.c -Wall -ansi -pedantic
	gcc -c safeexec.c `./os-detect` -Wall -ansi -pedantic
	gcc -o safeexec error.o safeexec.o safe.o -Wall -ansi -pedantic
	gcc -o ../jail/safeexec error.o safeexec.o safe.o -Wall -ansi -pedantic

clean:
	rm -rf *.o safeexec os-detect
