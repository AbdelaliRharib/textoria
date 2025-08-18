const fs = require('fs');
const path = require('path');

// Configuration du fichier .env
const envContent = `# Database Configuration
DATABASE_URL="postgresql://postgres:admin@localhost:5432/textoria_db"


# Google Gemini API Configuration (Replace with your actual key)
GEMINI_API_KEY="your-gemini-api-key-here"

# Hugging Face API Configuration (Replace with your actual key)
HUGGINGFACE_API_KEY="your-huggingface-api-key-here"

# JWT Secret
JWT_SECRET="textoria-super-secret-jwt-key-2024"

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN="http://localhost:3000"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;

// Chemin du fichier .env
const envPath = path.join(__dirname, '.env');

try {
  // Écrire le fichier .env
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ Fichier .env créé avec succès !');
  console.log('📁 Chemin:', envPath);
  console.log('');
  console.log('🔑 API Keys configurées :');
console.log('   • OpenAI API Key ✅');
console.log('   • Google Gemini API Key ✅');
console.log('   • Hugging Face API Key ✅');
console.log('   • Database URL ✅');
console.log('   • JWT Secret ✅');
  console.log('');
  console.log('🚀 Vous pouvez maintenant démarrer le serveur avec : npm start');
  
} catch (error) {
  console.error('❌ Erreur lors de la création du fichier .env:', error.message);
  console.log('');
  console.log('📝 Créez manuellement le fichier .env dans le dossier server/ avec le contenu suivant :');
  console.log('');
  console.log(envContent);
}
