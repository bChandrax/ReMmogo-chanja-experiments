@echo off
REM Database setup script for local PostgreSQL
REM This creates all tables, views, and stored procedures

set PGPASSWORD=Pakobenson@02

echo ========================================
echo Re-Mmogo Database Setup
echo ========================================
echo Host: localhost
echo Database: remmogo
echo User: postgres
echo ========================================
echo.

"C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d remmogo -f backend\database\setup.sql

echo.
echo ========================================
echo Setup Complete!
echo ========================================
pause
