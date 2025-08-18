# 🔧 Configuration du fichier .env - TEXTORIA

## 📝 **Création Manuelle du Fichier .env**

### **Étape 1 : Créer le fichier .env**

Créez un fichier nommé `.env` dans le dossier `server/` avec le contenu suivant :

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:admin@localhost:5432/textoria_db"

# OpenAI API Configuration
OPENAI_API_KEY="your-openai-api-key-here"

# Google Gemini API Configuration
GEMINI_API_KEY="AIzaSyC_koUPgNozOHvW2nxkStMTTnW5wqiY1WM"

# Stability AI API Configuration
STABILITY_API_KEY="sk-h0rvuV6VkDaObiCtmdIuc2G6q4MIycvfP5uA1W4BXsM2HZtC"

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
```

### **Étape 2 : Vérification**

Après avoir créé le fichier `.env`, vérifiez que :

1. ✅ Le fichier est dans le dossier `server/`
2. ✅ Le nom du fichier est exactement `.env` (avec le point)
3. ✅ Toutes les API keys sont présentes
4. ✅ Aucun espace avant ou après les `=`

### **Étape 3 : Démarrer le Serveur**

```bash
cd server
npm start
```

## 🔑 **API Keys Configurées**

### **OpenAI API**
- **Clé** : `your-openai-api-key-here`
- **Usage** : Génération d'images (DALL-E 3)

### **Google Gemini API**
- **Clé** : `AIzaSyC_koUPgNozOHvW2nxkStMTTnW5wqiY1WM`
- **Usage** : Génération de texte (LinkedIn, Email, Slogan)

### **Stability AI API**
- **Clé** : `sk-h0rvuV6VkDaObiCtmdIuc2G6q4MIycvfP5uA1W4BXsM2HZtC`
- **Usage** : Génération d'images (SDXL 1024 v1.0)

## 🚀 **Architecture Finale**

### **Génération de Texte**
```
Frontend → Backend → Google Gemini API
```

### **Génération d'Images**
```
Frontend → Backend → Stability AI API (SDXL)
```

### **Fallback System**
```
API Error → Fallback Generation → Picsum Photos (Images) / Templates (Texte)
```

## 📊 **Logs Attendus**

### **Démarrage Réussi**
```
✅ OpenAI configured successfully
🔧 Initializing Gemini with API key...
✅ Gemini configured successfully with API key
🎨 Initializing Stability AI with API key...
✅ Stability AI configured successfully with API key
✅ Database connected successfully
🚀 TEXTORIA Server running on port 5000
```

### **Génération de Texte**
```
🚀 Starting generation: { type: 'TEXT', category: 'linkedin' }
🤖 Using Google Gemini for text generation
📝 Calling Google Gemini API for text generation...
✅ Google Gemini text generation successful
```

### **Génération d'Images**
```
🚀 Starting generation: { type: 'IMAGE', category: 'custom' }
🎨 Using Stability AI for image generation
🎨 Calling Stability AI API for image generation...
✅ Stability AI image generation successful
```

## 🛡️ **Sécurité**

### **Bonnes Pratiques**
- ✅ Les API keys sont dans le fichier `.env`
- ✅ Le fichier `.env` est dans `.gitignore`
- ✅ Les clés ne sont pas hardcodées dans le code
- ✅ Variables d'environnement utilisées

### **Variables d'Environnement**
```javascript
// Au lieu de clés hardcodées
const apiKey = 'sk-...';

// Utilisation des variables d'environnement
const apiKey = process.env.OPENAI_API_KEY;
```

## 🔧 **Dépannage**

### **Erreur : "Environment variable not found"**
- Vérifiez que le fichier `.env` existe dans `server/`
- Vérifiez la syntaxe du fichier `.env`
- Redémarrez le serveur après modification

### **Erreur : "API key not configured"**
- Vérifiez que les API keys sont correctes
- Vérifiez qu'il n'y a pas d'espaces dans le fichier `.env`
- Vérifiez que les clés ne sont pas vides

### **Erreur : "Database connection failed"**
- Vérifiez que PostgreSQL est démarré
- Vérifiez les paramètres de connexion dans `DATABASE_URL`
- Vérifiez que la base de données `textoria_db` existe

## 🎯 **Résultat Final**

Après configuration du fichier `.env`, votre application TEXTORIA aura :

- ✅ **Génération de texte** avec Google Gemini
- ✅ **Génération d'images** avec Stability AI
- ✅ **Système de fallback** robuste
- ✅ **Configuration sécurisée** avec variables d'environnement
- ✅ **Coûts optimisés** (qualité professionnelle garantie)

**Votre application est maintenant prête à fonctionner avec toutes les API keys configurées !** 🚀
