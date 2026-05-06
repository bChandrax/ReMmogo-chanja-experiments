# PowerShell script to run database setup on Render PostgreSQL

$env:PGPASSWORD = "UF3ZQitedyJDwmVkL2ZLPrK0Znwp9KKH"
$host = "dpg-d7t40p8sfn5c73aiq7j0-a"
$user = "remmogo_user"
$db = "remmogo"
$sqlFile = "backend\database\setup.sql"

# Find psql in common installation locations
$psqlPaths = @(
    "C:\Program Files\PostgreSQL\*\bin\psql.exe",
    "C:\PostgreSQL\*\bin\psql.exe",
    "$env:ProgramFiles\PostgreSQL\*\bin\psql.exe"
)

$psqlPath = $null
foreach ($path in $psqlPaths) {
    $found = Get-ChildItem -Path $path -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) {
        $psqlPath = $found.FullName
        break
    }
}

if ($psqlPath) {
    Write-Host "Found psql at: $psqlPath"
    Write-Host "Running setup.sql on Render PostgreSQL..."
    & $psqlPath -h $host -U $user -d $db -f $sqlFile
    Write-Host "Done!"
} else {
    Write-Host "psql not found. Please run the SQL manually in Render dashboard:"
    Write-Host "1. Go to https://dashboard.render.com"
    Write-Host "2. Click your PostgreSQL database"
    Write-Host "3. Open SQL editor"
    Write-Host "4. Copy and paste contents of backend\database\setup.sql"
    Write-Host "5. Click Run"
}
