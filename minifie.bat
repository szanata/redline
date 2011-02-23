@echo

cd c:\yuicompressor-2.4.2\build

java -jar yuicompressor-2.4.2.jar --type js c:\repo\redline\resources\redline.js -o c:\repo\redline\resources\redline.min.js

java -jar yuicompressor-2.4.2.jar --type css c:\repo\redline\resources\redline.css -o c:\repo\redline\resources\redline.min.css