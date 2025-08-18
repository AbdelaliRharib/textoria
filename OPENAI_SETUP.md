# Configuration OpenAI pour TEXTORIA

Ce guide vous explique comment configurer les APIs OpenAI pour utiliser GPT-4 pour la génération de texte et DALL-E 3 pour la génération d'images.

## 🔑 Configuration des APIs OpenAI

### 1. Obtenir une clé API OpenAI

1. Allez sur [OpenAI Platform](https://platform.openai.com/)
2. Créez un compte ou connectez-vous
3. Allez dans la section "API Keys"
4. Cliquez sur "Create new secret key"
5. Copiez votre clé API (elle commence par `sk-`)

### 2. Configuration du fichier .env

Dans le dossier `server/`, créez ou modifiez le fichier `.env` :

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-votre-clé-api-ici

# Autres configurations existantes...
DATABASE_URL="your-database-url"
JWT_SECRET="your-jwt-secret"
PORT=5000
```

### 3. Vérification de la configuration

Redémarrez votre serveur et vérifiez que vous voyez ce message dans les logs :

```
✅ OpenAI configured successfully
```

## 🤖 Fonctionnalités OpenAI

### Génération de Texte (GPT-4)
- **Modèle utilisé** : `gpt-4`
- **Fonctionnalités** :
  - Posts LinkedIn professionnels
  - Emails marketing optimisés
  - Slogans de marque créatifs
  - Contenu marketing général

### Génération d'Images (DALL-E 3)
- **Modèle utilisé** : `dall-e-3`
- **Formats supportés** :
  - Carré (1024x1024)
  - Portrait (1024x1792)
  - Paysage (1792x1024)
- **Qualités disponibles** :
  - Standard
  - Haute définition (HD)

## 💰 Coûts et Facturation

### Tarifs OpenAI (approximatifs)
- **GPT-4** : ~$0.03 par 1000 tokens
- **DALL-E 3** : ~$0.04 par image

### Estimation des coûts
- **Post LinkedIn** : ~$0.01-0.03
- **Email marketing** : ~$0.02-0.05
- **Slogan** : ~$0.01-0.02
- **Image HD** : ~$0.04

## 🚀 Utilisation

### Génération de Texte
1. Allez dans `/dashboard/text-generation`
2. Choisissez le type (LinkedIn, Email, Slogan)
3. Remplissez les champs requis
4. Cliquez sur "Générer"

### Génération d'Images
1. Allez dans `/dashboard/image-generation`
2. Décrivez l'image souhaitée
3. Choisissez le style artistique
4. Sélectionnez le format et la qualité
5. Cliquez sur "Générer l'image"

## ⚠️ Important

- **Crédits OpenAI** : Assurez-vous d'avoir des crédits suffisants sur votre compte OpenAI
- **Limites** : Respectez les limites de taux d'OpenAI
- **Sécurité** : Ne partagez jamais votre clé API
- **Coûts** : Surveillez votre utilisation pour contrôler les coûts

## 🔧 Dépannage

### Erreur "OpenAI API not configured"
- Vérifiez que votre clé API est correcte dans le fichier `.env`
- Redémarrez le serveur après modification du fichier `.env`

### Erreur "Insufficient credits"
- Rechargez votre compte OpenAI
- Vérifiez votre solde sur [OpenAI Platform](https://platform.openai.com/account/billing)

### Erreur "Rate limit exceeded"
- Attendez quelques minutes avant de réessayer
- Considérez l'upgrade de votre plan OpenAI

## 📞 Support

Pour toute question concernant la configuration OpenAI :
- Consultez la [documentation OpenAI](https://platform.openai.com/docs)
- Vérifiez les [tarifs OpenAI](https://openai.com/pricing)
- Contactez le support OpenAI si nécessaire



