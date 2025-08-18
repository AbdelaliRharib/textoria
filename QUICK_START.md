# 🚀 Démarrage Rapide - TEXTORIA

Guide de démarrage rapide pour configurer et lancer TEXTORIA avec PostgreSQL et OpenAI.

## ✅ Configuration Automatique

### 1. Configuration de l'Environnement
```bash
cd server
npm run setup
```

Cela crée automatiquement le fichier `.env` avec :
- ✅ Votre clé API OpenAI
- ✅ Configuration PostgreSQL
- ✅ JWT et autres paramètres

### 2. Installation de PostgreSQL
- **Windows** : Téléchargez depuis [postgresql.org](https://www.postgresql.org/download/windows/)
- **macOS** : `brew install postgresql && brew services start postgresql`
- **Linux** : `sudo apt install postgresql postgresql-contrib`

### 3. Création de la Base de Données
```bash
# Accédez à PostgreSQL
psql -U postgres

# Créez la base de données
CREATE DATABASE textoria;
\q
```

### 4. Configuration de la Base de Données
```bash
cd server
npm run db:setup
```

### 5. Création d'un Compte Admin
```bash
npm run create-admin
```

## 🎯 Démarrage de l'Application

### 1. Serveur Backend
```bash
cd server
npm start
```

Vous devriez voir :
```
✅ Database connected successfully
✅ OpenAI configured successfully
🚀 Server running on port 5000
```

### 2. Client Frontend
```bash
cd client
npm run dev
```

L'application sera disponible sur : http://localhost:3000

## 🤖 Test des APIs OpenAI

### Génération de Texte
1. Allez sur http://localhost:3000/dashboard/text-generation
2. Choisissez un type (LinkedIn, Email, Slogan)
3. Remplissez les champs
4. Cliquez sur "Générer"

### Génération d'Images
1. Allez sur http://localhost:3000/dashboard/image-generation
2. Décrivez l'image souhaitée
3. Choisissez le style et format
4. Cliquez sur "Générer l'image"

## 🔧 Dépannage Rapide

### Erreur "Database connection failed"
- Vérifiez que PostgreSQL est démarré
- Vérifiez que la base de données "textoria" existe
- Modifiez `DATABASE_URL` dans `.env` si nécessaire

### Erreur "OpenAI API not configured"
- Vérifiez que le fichier `.env` existe
- Vérifiez que `OPENAI_API_KEY` est correct
- Redémarrez le serveur

### Erreur "Port already in use"
- Changez le port dans `.env` : `PORT=5001`
- Ou arrêtez le processus qui utilise le port

## 📊 Vérification

### Test de Connexion Base de Données
```bash
psql -U postgres -d textoria -c "\dt"
```

### Test API OpenAI
```bash
curl -X POST http://localhost:5000/api/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"type":"TEXT","category":"test","prompt":"Hello world"}'
```

## 🎉 Félicitations !

Votre application TEXTORIA est maintenant configurée avec :
- ✅ PostgreSQL pour la base de données
- ✅ OpenAI GPT-4 pour la génération de texte
- ✅ OpenAI DALL-E 3 pour la génération d'images
- ✅ Interface utilisateur moderne
- ✅ Système d'authentification complet

## 📚 Documentation Complète

- [Configuration PostgreSQL](POSTGRESQL_SETUP.md)
- [Configuration OpenAI](OPENAI_SETUP.md)
- [Guide de Test](TEST_GUIDE.md)
