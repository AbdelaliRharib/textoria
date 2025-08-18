# 🤖 Guide de Configuration OpenAI - Génération d'Images

## 🎯 Problème Identifié

Actuellement, le système génère des images SVG basées sur des mots-clés au lieu d'utiliser l'API OpenAI DALL-E pour créer de vraies images selon votre prompt.

## 🛠️ Solution : Configurer OpenAI

### 1. Obtenir une Clé API OpenAI

1. Visitez [OpenAI Platform](https://platform.openai.com/)
2. Créez un compte ou connectez-vous
3. Allez dans "API Keys" dans votre tableau de bord
4. Cliquez sur "Create new secret key"
5. Copiez la clé API (commence par `sk-`)

### 2. Configurer l'Environnement

Éditez le fichier `server/.env` et ajoutez votre clé API :

```env
# OpenAI - Ajoutez votre clé API ici
OPENAI_API_KEY="sk-votre-vraie-cle-api-ici"
```

### 3. Redémarrer le Serveur

```bash
cd server
npm start
```

### 4. Tester la Génération d'Images

1. Allez sur votre dashboard : `http://localhost:3000/dashboard`
2. Essayez de générer une image avec un prompt spécifique
3. Vérifiez la console du serveur pour les messages de statut OpenAI

## 🎨 Fonctionnalités Disponibles

### Génération d'Images
- **DALL-E 3** : Génération d'images haute qualité
- **Résolution 1024x1024** : Images professionnelles
- **Prompts personnalisés** : Décrivez n'importe quelle image

### Exemples de Prompts
- "Une voiture BMW bleue sur une route de montagne"
- "Un logo moderne pour une entreprise de technologie"
- "Un portrait d'une personne souriante"
- "Un paysage de montagne au coucher du soleil"

## 💰 Coûts

- **Génération d'image** : ~$0.04 par image
- **Génération de texte** : ~$0.002 par 1K tokens
- **Plan gratuit** : 100 générations par mois incluses

## 🔧 Mode de Secours

Si aucune clé API n'est configurée, le système utilise :
- ✅ Des réponses SVG pour les images
- 📊 Fonctionnalité complète sans coûts API
- 🎨 Images basées sur des mots-clés prédéfinis

## 🚨 Dépannage

### "OpenAI API key not configured"
- Vérifiez que vous avez ajouté votre clé API dans le fichier `.env`
- Redémarrez le serveur après avoir ajouté la clé
- Vérifiez que la clé commence par `sk-`

### "API key invalid"
- Vérifiez que votre clé API est correcte
- Vérifiez que votre compte OpenAI a des crédits
- Assurez-vous que la clé n'a pas expiré

### "Rate limit exceeded"
- Attendez un moment et réessayez
- Considérez mettre à niveau votre plan OpenAI

## 📞 Support

Pour les problèmes d'API OpenAI, consultez :
- [Documentation OpenAI](https://platform.openai.com/docs)
- [Page de statut OpenAI](https://status.openai.com/)
- Votre tableau de bord OpenAI pour l'utilisation et la facturation

---

**Note** : Une fois OpenAI configuré, vos images seront générées selon vos prompts exacts avec DALL-E 3 !
