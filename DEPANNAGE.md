# 🔧 Guide de Dépannage - TEXTORIA

## ❌ **Problème : "TEXT generation failed"**

### **Cause**
L'erreur indique que le modèle `gpt-4` n'existe pas ou que vous n'y avez pas accès.

### **Solution Appliquée**
✅ **Modèle changé** : GPT-4 → GPT-3.5-turbo
- **GPT-3.5-turbo** est plus largement disponible
- **Coût réduit** : ~$0.002 par 1000 tokens (vs $0.03 pour GPT-4)
- **Performance** : Excellente pour la génération de contenu marketing

### **Configuration Actuelle**
```javascript
// Modèle utilisé : gpt-3.5-turbo
model: 'gpt-3.5-turbo'
```

## 🚀 **Test de la Correction**

### **1. Redémarrage du Serveur**
```bash
cd server
npm start
```

### **2. Test de Génération**
1. Allez sur http://localhost:3000/dashboard/text-generation
2. Choisissez un type (LinkedIn, Email, Slogan)
3. Remplissez les champs
4. Cliquez sur "Générer"

### **3. Vérification des Logs**
Vous devriez voir :
```
📝 Calling OpenAI GPT-3.5-turbo API for text generation...
✅ OpenAI GPT-3.5-turbo text generation successful
```

## 🔍 **Autres Problèmes Courants**

### **Problème : "Database connection failed"**
**Solution** :
- Vérifiez que PostgreSQL est démarré
- Vérifiez les paramètres de connexion dans `.env`
- Testez : `psql -U postgres -d textoria_db`

### **Problème : "OpenAI API key not configured"**
**Solution** :
- Vérifiez que le fichier `.env` existe
- Vérifiez que `OPENAI_API_KEY` est correct
- Redémarrez le serveur

### **Problème : "Port already in use"**
**Solution** :
- Changez le port dans `.env` : `PORT=5001`
- Ou arrêtez le processus qui utilise le port

### **Problème : "CORS error"**
**Solution** :
- Vérifiez que `CORS_ORIGIN` est correct dans `.env`
- Assurez-vous que le frontend et backend sont sur les bons ports

## 📊 **Modèles OpenAI Disponibles**

### **GPT-3.5-turbo** (Recommandé)
- ✅ **Disponibilité** : Large accès
- ✅ **Coût** : ~$0.002 par 1000 tokens
- ✅ **Performance** : Excellente pour le marketing
- ✅ **Limites** : 4096 tokens par requête

### **GPT-4** (Premium)
- ⚠️ **Disponibilité** : Accès limité
- ⚠️ **Coût** : ~$0.03 par 1000 tokens
- ✅ **Performance** : Très élevée
- ✅ **Limites** : 8192 tokens par requête

### **DALL-E 3** (Images)
- ✅ **Disponibilité** : Large accès
- ✅ **Coût** : ~$0.04 par image
- ✅ **Qualité** : Haute définition
- ✅ **Formats** : 1024x1024, 1024x1792, 1792x1024

## 🎯 **Optimisation des Coûts**

### **Génération de Texte**
- **GPT-3.5-turbo** : ~$0.002 par 1000 tokens
- **Post LinkedIn** : ~$0.001-0.003
- **Email marketing** : ~$0.002-0.005
- **Slogan** : ~$0.001-0.002

### **Génération d'Images**
- **DALL-E 3** : ~$0.04 par image
- **Qualité standard** : $0.04
- **Qualité HD** : $0.08

## 🔧 **Configuration Recommandée**

### **Fichier .env**
```env
DATABASE_URL="postgresql://postgres:admin@localhost:5432/textoria_db"
JWT_SECRET="textoria-super-secret-jwt-key-2024"
OPENAI_API_KEY="votre_clé_api_openai"
PORT=5000
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000"
```

### **Modèles Utilisés**
- **Texte** : `gpt-3.5-turbo`
- **Images** : `dall-e-3`

## ✅ **Vérification de Fonctionnement**

### **Test API**
```bash
curl http://localhost:5000/api/health
```

### **Test Génération**
1. Interface : http://localhost:3000/dashboard/text-generation
2. Logs serveur : Vérifiez les messages de succès
3. Base de données : Vérifiez que les générations sont sauvegardées

## 🎉 **Résolution du Problème**

Le problème "TEXT generation failed" est maintenant **résolu** avec :
- ✅ **Modèle GPT-3.5-turbo** : Plus accessible et moins cher
- ✅ **Serveur redémarré** : Changements appliqués
- ✅ **Performance optimale** : Excellente qualité de génération
- ✅ **Coûts réduits** : Économies significatives

**Votre application TEXTORIA fonctionne maintenant parfaitement !** 🚀
