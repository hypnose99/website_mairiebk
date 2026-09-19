# restaurer-base-dev.ps1
# Recopie la base Supabase "mairie-bouake-dev" dans le PostgreSQL local (Docker).
# Les identifiants sont lus dans strapi-admin\.env.backup-supabase : ils n'apparaissent
# ni a l'ecran, ni dans l'historique PowerShell.
#
# Usage : depuis la racine du projet
#   powershell -ExecutionPolicy Bypass -File .\outils\restaurer-base-dev.ps1

$ErrorActionPreference = 'Stop'

$racine    = Split-Path -Parent $PSScriptRoot
$envSource = Join-Path $racine 'strapi-admin\.env.backup-supabase'
$dossierSauvegardes = Join-Path $racine 'sauvegardes'

if (-not (Test-Path $envSource)) {
  throw "Fichier introuvable : $envSource"
}

# --- Lecture des identifiants Supabase ---
$conf = @{}
Get-Content $envSource | ForEach-Object {
  if ($_ -match '^\s*([A-Z_]+)\s*=\s*(.*)$') { $conf[$Matches[1]] = $Matches[2].Trim() }
}
foreach ($cle in 'DATABASE_HOST','DATABASE_PORT','DATABASE_NAME','DATABASE_USERNAME','DATABASE_PASSWORD') {
  if (-not $conf[$cle]) { throw "Cle manquante dans .env.backup-supabase : $cle" }
}

Add-Type -AssemblyName System.Web
$motDePasse = [System.Web.HttpUtility]::UrlEncode($conf['DATABASE_PASSWORD'])
$chaine = "postgresql://$($conf['DATABASE_USERNAME']):$motDePasse@$($conf['DATABASE_HOST']):$($conf['DATABASE_PORT'])/$($conf['DATABASE_NAME'])?sslmode=require"

Write-Host "Source   : $($conf['DATABASE_HOST']) / $($conf['DATABASE_NAME'])" -ForegroundColor Cyan
Write-Host "Cible    : conteneur pg-mairie, base mairie_dev" -ForegroundColor Cyan

# --- Verification de la version du conteneur ---
$version = (docker exec pg-mairie psql -U strapi -d postgres -tAc "show server_version;") 2>$null
if (-not $version) { throw "Le conteneur pg-mairie ne repond pas. Lance : docker start pg-mairie" }
if ($version.Trim() -notmatch '^17') {
  throw "Le conteneur local est en PostgreSQL $($version.Trim()) alors que Supabase est en 17. Recree-le en postgres:17 avant de continuer."
}

# --- Sauvegarde ---
$horodatage = Get-Date -Format 'yyyy-MM-dd-HHmm'
Write-Host "`n[1/3] Sauvegarde de la base distante..." -ForegroundColor Yellow
# --schema=public : on ne prend que les tables de Strapi. Les schemas internes de
# Supabase (vault, auth, storage...) utilisent des extensions absentes d'un
# PostgreSQL standard et provoqueraient des erreurs a la restauration.
docker exec pg-mairie pg_dump $chaine -Fc --schema=public --no-owner --no-privileges -f /tmp/dev.dump
if ($LASTEXITCODE -ne 0) { throw "Echec du pg_dump." }

New-Item -ItemType Directory -Force -Path $dossierSauvegardes | Out-Null
$fichier = Join-Path $dossierSauvegardes "dev-$horodatage.dump"
docker cp pg-mairie:/tmp/dev.dump $fichier
Write-Host "      Sauvegarde ecrite : $fichier" -ForegroundColor Green

# --- Base locale repartie de zero ---
Write-Host "`n[2/3] Remise a zero de la base locale..." -ForegroundColor Yellow
docker exec pg-mairie psql -U strapi -d postgres -c "DROP DATABASE IF EXISTS mairie_dev WITH (FORCE);" | Out-Null
docker exec pg-mairie psql -U strapi -d postgres -c "CREATE DATABASE mairie_dev OWNER strapi;" | Out-Null

# --- Restauration ---
Write-Host "`n[3/3] Restauration en local..." -ForegroundColor Yellow
docker exec pg-mairie pg_restore -U strapi -d mairie_dev --no-owner --no-privileges /tmp/dev.dump
docker exec pg-mairie psql -U strapi -d mairie_dev -c "SELECT count(*) AS fichiers FROM files;"

Write-Host "`nTermine." -ForegroundColor Green
Write-Host "Strapi doit etre arrete pendant la restauration : relance-le maintenant." -ForegroundColor Cyan
Write-Host "Ton compte admin et tes jetons d'API sont ceux de la base dev Supabase." -ForegroundColor Cyan
