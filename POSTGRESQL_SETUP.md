# Configuration PostgreSQL pour TEXTORIA

Ce guide vous explique comment configurer PostgreSQL pour votre application TEXTORIA.

## 🐘 Installation de PostgreSQL

### Windows
1. **Téléchargez PostgreSQL** depuis [postgresql.org](https://www.postgresql.org/download/windows/)
2. **Installez PostgreSQL** avec les paramètres par défaut
3. **Notez le mot de passe** que vous définissez pour l'utilisateur `postgres`

### macOS
```bash
# Avec Homebrew
brew install postgresql
brew services start postgresql

# Ou téléchargez depuis postgresql.org
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## 🗄️ Configuration de la Base de Données

### 1. Accédez à PostgreSQL
```bash
# Windows (après installation)
psql -U postgres

# macOS/Linux
sudo -u postgres psql
```

### 2. Créez la Base de Données
```sql
CREATE DATABASE textoria;
\q
```

### 3. Vérifiez la Connexion
```bash
psql -U postgres -d textoria
```

## ⚙️ Configuration de l'Application

### 1. Fichier .env
Le fichier `.env` a été créé automatiquement avec :
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/textoria"
```

### 2. Modifiez si Nécessaire
Si votre configuration PostgreSQL est différente, modifiez `DATABASE_URL` :
```env
# Format : postgresql://username:password@host:port/database
DATABASE_URL="postgresql://votre_utilisateur:votre_mot_de_passe@localhost:5432/textoria"
```

## 🚀 Configuration de la Base de Données

### 1. Générez le Client Prisma
```bash
cd server
npm run build
```

### 2. Créez les Tables
```bash
npm run db:setup
```

### 3. Ajoutez des Données de Test (Optionnel)
```bash
npm run db:seed
```

### 4. Créez un Compte Admin
```bash
npm run create-admin
```

## 🔧 Dépannage

### Erreur "Connection refused"
- Vérifiez que PostgreSQL est démarré
- Vérifiez le port (5432 par défaut)
- Vérifiez les paramètres de pare-feu

### Erreur "Authentication failed"
- Vérifiez le nom d'utilisateur et mot de passe
- Vérifiez que l'utilisateur a les droits sur la base de données

### Erreur "Database does not exist"
- Créez la base de données : `CREATE DATABASE textoria;`

## 📊 Vérification

### 1. Testez la Connexion
```bash
cd server
npm start
```

Vous devriez voir :
```
✅ Database connected successfully
✅ OpenAI configured successfully
```

### 2. Vérifiez les Tables
```sql
\c textoria
\dt
```

Vous devriez voir les tables :
- users
- subscriptions
- generations
- favorites
- analytics
- payments
- admin_logs
- system_settings

## 🎯 Prochaines Étapes

1. **Démarrez le serveur** : `npm start`
2. **Démarrez le client** : `cd ../client && npm run dev`
3. **Testez l'application** : http://localhost:3000
4. **Testez les APIs OpenAI** : Générez du texte et des images

## 📞 Support

Pour toute question concernant PostgreSQL :
- [Documentation PostgreSQL](https://www.postgresql.org/docs/)
- [Guide d'installation](https://www.postgresql.org/download/)
- [Forum PostgreSQL](https://www.postgresql.org/community/)
