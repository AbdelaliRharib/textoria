# Correction du Problème de Redirection vers Admin

## 🚨 Problème identifié

Vous êtes automatiquement redirigé vers `http://localhost:3000/admin` au lieu du dashboard normal après la connexion.

## 🔍 Cause du problème

Le problème vient du fait que votre compte utilisateur a le rôle `ADMIN` dans la base de données. Quand un utilisateur admin se connecte, il est automatiquement redirigé vers la page d'administration.

## 🛠️ Solutions

### Solution 1 : Vérifier et changer le rôle utilisateur

#### Étape 1 : Vérifier les rôles actuels
```bash
cd server
node check-user-role.js
```

Cela affichera tous les utilisateurs et leurs rôles.

#### Étape 2 : Changer le rôle vers USER
```bash
cd server
node change-user-role.js votre_email@example.com USER
```

Remplacez `votre_email@example.com` par votre adresse email.

### Solution 2 : Modifier la logique de redirection

Si vous voulez garder le rôle ADMIN mais être redirigé vers le dashboard normal, modifiez le code :

#### Dans `client/app/login/page.tsx`
```javascript
// Ligne 32, changer :
router.push('/dashboard')

// Par :
if (result.user.role === 'ADMIN') {
  router.push('/dashboard') // Au lieu de /admin
} else {
  router.push('/dashboard')
}
```

### Solution 3 : Ajouter un choix de destination

#### Modifier `client/app/login/page.tsx`
```javascript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)
  
  try {
    const result = await login(formData.email, formData.password)

    if (result.success) {
      toast.success('Welcome back to TEXTORIA!')
      
      // Rediriger vers dashboard pour tous les utilisateurs
      router.push('/dashboard')
    } else {
      toast.error(result.error || 'Login failed')
    }
  } catch (error) {
    toast.error('An unexpected error occurred')
  } finally {
    setIsLoading(false)
  }
}
```

## 🔧 Scripts de diagnostic

### Vérifier les rôles
```bash
cd server
node check-user-role.js
```

### Changer un rôle
```bash
cd server
node change-user-role.js email@example.com USER
```

### Rôles disponibles
- `USER` : Utilisateur normal (dashboard)
- `MODERATOR` : Modérateur (dashboard + fonctions modération)
- `ADMIN` : Administrateur (redirection vers /admin)

## 📋 Étapes de résolution recommandées

### Option A : Utilisateur normal (recommandé)
1. Vérifier votre rôle actuel
2. Changer vers `USER`
3. Redémarrer l'application
4. Se reconnecter

### Option B : Garder le rôle ADMIN
1. Modifier la logique de redirection
2. Ajouter un bouton pour accéder à l'admin
3. Rediriger vers dashboard par défaut

## 🎯 Résultat attendu

Après correction :
- ✅ Connexion → `/dashboard` (pas `/admin`)
- ✅ Accès au menu dashboard normal
- ✅ Bouton "Admin" visible si rôle ADMIN
- ✅ Navigation libre entre dashboard et admin

## 🔍 Vérification

Après avoir appliqué les corrections :

1. **Se déconnecter**
2. **Se reconnecter**
3. **Vérifier l'URL** : doit être `http://localhost:3000/dashboard`
4. **Vérifier le menu** : doit afficher le dashboard normal

## 🆘 Si le problème persiste

### Vérifier les logs
```bash
# Dans les logs du serveur
🔍 Vérification des rôles utilisateurs...
👤 votre_email@example.com - Rôle: USER - Actif: true
```

### Vérifier le localStorage
```javascript
// Dans la console du navigateur
console.log(localStorage.getItem('token'))
```

### Vérifier le contexte d'authentification
```javascript
// Dans la console du navigateur
// Vérifier si l'utilisateur est bien chargé
```

## 📝 Notes importantes

- Le rôle `ADMIN` donne accès au panneau d'administration
- Le rôle `USER` donne accès au dashboard normal
- Les changements de rôle nécessitent une reconnexion
- Le token JWT contient le rôle, donc il faut se reconnecter après changement

