@echo off
REM Connect to Render PostgreSQL and run setup script

set PGPASSWORD=UF3ZQitedyJDwmVkL2ZLPrK0Znwp9KKH

echo ========================================
echo Render PostgreSQL Database Setup
echo ========================================
echo Host: dpg-d7t40p8sfn5c73aiq7j0-a.virginia-postgres.render.com
echo Database: remmogo
echo User: remmogo_user
echo ========================================
echo.
echo Running setup-render.sql...
echo.

"C:\Program Files\PostgreSQL\18\bin\psql.exe" "postgresql://remmogo_user:UF3ZQitedyJDwmVkL2ZLPrK0Znwp9KKH@dpg-d7t40p8sfn5c73aiq7j0-a.virginia-postgres.render.com:5432/remmogo?sslmode=require" -f backend\database\setup-render.sql

echo.
echo ========================================
echo Setup Complete!
echo ========================================
pause
