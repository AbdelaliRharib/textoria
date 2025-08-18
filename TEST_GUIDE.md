# 🧪 Guide de Test TEXTORIA - Marketing AI

## ✅ Configuration Complète

TEXTORIA est maintenant configuré avec :
- ✅ Clé OpenAI configurée
- ✅ Spécialisation marketing digital
- ✅ Catégories LinkedIn, Email, Slogans
- ✅ Génération d'images marketing

## 🚀 Test de Connexion Admin

### 1. Accéder à l'Application
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### 2. Connexion Admin
- **Email**: admin@textoria.com
- **Mot de passe**: admin123
- **Rôle**: ADMIN
- **Plan**: ENTERPRISE (100,000 générations/mois)

## 🎯 Tests de Génération de Contenu

### Test 1: LinkedIn Posts
1. Aller sur `/dashboard`
2. Sélectionner "LinkedIn Posts" comme catégorie
3. Prompt exemple: "L'importance de l'IA dans le marketing digital en 2024"
4. Vérifier que le contenu généré est optimisé pour LinkedIn

### Test 2: Email Marketing
1. Catégorie: "Email Marketing"
2. Prompt exemple: "Campagne email pour promouvoir un nouveau service de marketing digital"
3. Vérifier que l'email inclut sujet, contenu et call-to-action

### Test 3: Brand Slogans
1. Catégorie: "Brand Slogans"
2. Prompt exemple: "Marque: TechCorp, Secteur: Technologie, Valeurs: Innovation, Qualité, Public: Entreprises"
3. Vérifier que plusieurs slogans sont générés avec explications

## 🎨 Tests de Génération d'Images

### Test 1: Logo d'Entreprise
1. Type: IMAGE
2. Prompt: "Logo moderne pour une agence de marketing digital, style professionnel"
3. Vérifier que l'image est générée avec DALL-E 3

### Test 2: Affiche Marketing
1. Prompt: "Affiche marketing pour campagne LinkedIn, design moderne"
2. Vérifier la qualité HD et le style professionnel

### Test 3: Visuels Réseaux Sociaux
1. Prompt: "Graphique pour post LinkedIn sur l'IA en marketing"
2. Vérifier l'optimisation pour les réseaux sociaux

## 🔍 Vérifications Techniques

### Backend (Console)
- ✅ "TEXTORIA text generation successful"
- ✅ "TEXTORIA image generation successful"
- ✅ Utilisation de GPT-4 pour le texte
- ✅ Utilisation de DALL-E 3 pour les images

### Frontend
- ✅ Catégories marketing affichées
- ✅ Interface adaptée au marketing digital
- ✅ Génération en temps réel

## 📊 Tests Admin Dashboard

### Accès Admin
1. Se connecter avec admin@textoria.com
2. Aller sur `/admin`
3. Vérifier les analytics et la gestion des utilisateurs

### Fonctionnalités Admin
- ✅ Vue d'ensemble des utilisateurs
- ✅ Analytics de génération
- ✅ Gestion des abonnements
- ✅ Modération du contenu

## 🎯 Exemples de Prompts Marketing

### LinkedIn Posts
```
"Les tendances du marketing digital en 2024 et comment les agences peuvent s'adapter"
```

### Email Marketing
```
"Campagne de relance pour clients inactifs, ton professionnel mais amical"
```

### Brand Slogans
```
"Marque: DigitalAgency, Secteur: Marketing Digital, Valeurs: Innovation, Résultats, Transparence, Public: PME"
```

### Images Marketing
```
"Logo minimaliste pour agence de marketing digital, couleurs bleu et blanc"
```

## 🚨 Dépannage

### Si la génération échoue
1. Vérifier la console du serveur
2. S'assurer que la clé OpenAI est valide
3. Vérifier les limites de quota OpenAI

### Si l'admin ne peut pas se connecter
1. Exécuter: `npm run create-admin` dans le dossier server
2. Vérifier la base de données PostgreSQL
3. Redémarrer le serveur

## ✅ Critères de Succès

- [ ] Génération de texte LinkedIn optimisée
- [ ] Génération d'emails marketing complets
- [ ] Création de slogans de marque
- [ ] Génération d'images marketing professionnelles
- [ ] Interface adaptée au marketing digital
- [ ] Dashboard admin fonctionnel
- [ ] Utilisation de GPT-4 et DALL-E 3

---

**TEXTORIA est maintenant spécialisé pour le marketing digital et prêt à créer du contenu professionnel !** 🚀
