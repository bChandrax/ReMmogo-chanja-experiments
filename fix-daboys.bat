@echo off
REM Fix daboys group signatories

set PGPASSWORD=Pakobenson@02

echo Fixing daboys group signatories...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d remmogo -f backend\database\fix-daboys-signatories.sql

echo.
echo Done!
pause
