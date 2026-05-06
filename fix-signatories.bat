@echo off
REM Fix signatories data in local database

set PGPASSWORD=Pakobenson@02

echo Fixing signatories data...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d remmogo -f backend\database\fix-signatories.sql

echo.
echo Done!
pause
