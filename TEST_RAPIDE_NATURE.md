# Test Rapide - Correction Images de Nature

## 🚀 Test Immédiat

### Étape 1 : Redémarrer le serveur
```bash
cd server
npm start
```

### Étape 2 : Test simple
1. Aller sur `/dashboard/image-generation`
2. Description : **"Un vase rouge sur une table en bois"**
3. Style : **Réaliste**
4. Format : **Carré**
5. Qualité : **Standard**
6. Cliquer sur "Générer l'image"

### Étape 3 : Vérifier les logs
Dans les logs du serveur, vous devriez voir :
```
📝 Original prompt received: Description : Un vase rouge sur une table en bois (indoor scene, studio setting, urban environment)
✅ Hugging Face image generation successful: {
  enhancedPrompt: "Un vase rouge sur une table en bois (indoor scene, studio setting, urban environment), detailed, sharp focus, high quality, professional, masterpiece",
  negativePrompt: "nature, landscape, trees, mountains, sky, clouds, grass, flowers, outdoor, blurry, low quality, distorted, deformed, ugly, bad anatomy, watermark, signature, text"
}
```

### Étape 4 : Vérifier le résultat
- L'image devrait montrer un vase rouge sur une table
- **NE PAS** montrer de paysage, arbres, ciel, etc.
- L'image devrait être nette et détaillée

## 🔧 Si le problème persiste

### Test avec prompt négatif renforcé
Si l'image montre encore de la nature, testez avec :
```
Description : "Un ordinateur portable sur un bureau avec des papiers (indoor office setting, no windows, artificial lighting)"
```

### Test avec style différent
```
Description : "Une femme assise sur un canapé dans un salon moderne"
Style : "Anime/Manga"
```

## 📊 Résultats attendus

### ✅ Succès
- Image correspond à la description
- Pas d'éléments naturels non désirés
- Qualité nette et détaillée

### ❌ Échec
- Image montre un paysage naturel
- Éléments non demandés (arbres, ciel, etc.)
- Qualité floue ou déformée

## 🆘 Solutions d'urgence

Si les corrections ne fonctionnent pas :

1. **Vérifier l'API Hugging Face** : Le service peut être en maintenance
2. **Changer de modèle** : Utiliser SD v2.1 au lieu de v1.5
3. **Ajuster les paramètres** : Augmenter guidance_scale à 9.5
4. **Prompt plus spécifique** : Ajouter "studio lighting", "close-up", "centered"
