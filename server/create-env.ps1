# Script PowerShell pour créer le fichier .env
$envContent = @"
# Database - PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/textoria"

# JWT
JWT_SECRET="textoria-super-secret-jwt-key-2024"
JWT_EXPIRES_IN="7d"

# OpenAI - Your API Key (Replace with your actual key)
OPENAI_API_KEY="your-openai-api-key-here"

# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:3000"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH="./uploads"
"@

# Créer le fichier .env
$envContent | Out-File -FilePath ".env" -Encoding UTF8

Write-Host "✅ Fichier .env créé avec succès !" -ForegroundColor Green
Write-Host "📝 Configuration :" -ForegroundColor Yellow
Write-Host "   - Base de données : PostgreSQL" -ForegroundColor White
Write-Host "   - OpenAI API : Configurée" -ForegroundColor White
Write-Host "   - JWT : Configuré" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Prochaines étapes :" -ForegroundColor Yellow
Write-Host "   1. Installez PostgreSQL si ce n'est pas déjà fait" -ForegroundColor White
Write-Host "   2. Créez une base de données nommée 'textoria'" -ForegroundColor White
Write-Host "   3. Modifiez DATABASE_URL dans .env si nécessaire" -ForegroundColor White
Write-Host "   4. Exécutez : npm run db:setup" -ForegroundColor White
Write-Host "   5. Démarrez le serveur : npm start" -ForegroundColor White
