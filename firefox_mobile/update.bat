zip -r "c:\temp\backup\chrome-%date:/=-% %time::=-%.zip" ..\chrome\*
rm -rf ..\chrome\common ..\chrome\images
cp -r data\common data\images ..\chrome

zip -r "c:\temp\backup\firefox-%date:/=-% %time::=-%.zip" ..\firefox\*
rm -rf ..\firefox\data\common ..\firefox\data\images
cp -r data\common data\images ..\firefox\data
