# Correction du Problème de Génération d'Images de Nature

## Problème identifié
L'API Hugging Face génère principalement des images de nature au lieu de respecter la description donnée.

## Causes possibles
1. **Biais du modèle** : Stable Diffusion v1.5 peut avoir des biais vers les paysages naturels
2. **Prompt trop générique** : Les descriptions ne sont pas assez spécifiques
3. **Absence de prompt négatif** : Pas de restriction sur les éléments non désirés
4. **Paramètres par défaut** : Guidance scale et steps par défaut peuvent favoriser certains types d'images

## Corrections apportées

### 1. Ajout d'un prompt négatif
```javascript
const negativePrompt = "nature, landscape, trees, mountains, sky, clouds, grass, flowers, outdoor, blurry, low quality, distorted, deformed, ugly, bad anatomy, watermark, signature, text";
```

### 2. Amélioration du prompt positif
- Ajout de "detailed, sharp focus" pour plus de précision
- Contexte spécifique pour les scènes intérieures
- Paramètres de qualité optimisés

### 3. Paramètres Hugging Face améliorés
- Utilisation des paramètres de qualité dans le payload
- Guidance scale et steps optimisés selon la qualité choisie

## Tests à effectuer

### Test 1 : Objet simple (non-nature)
1. Description : "Un vase rouge sur une table en bois"
2. Style : Réaliste
3. Vérifier que l'image montre un vase, pas un paysage

### Test 2 : Personne dans un intérieur
1. Description : "Une femme assise sur un canapé dans un salon moderne"
2. Style : Réaliste
3. Vérifier que l'image montre une personne dans un intérieur

### Test 3 : Objet technique
1. Description : "Un ordinateur portable sur un bureau avec des papiers"
2. Style : Moderne
3. Vérifier que l'image montre un bureau, pas de la nature

### Test 4 : Style artistique spécifique
1. Description : "Un chat noir dans une pièce avec des murs blancs"
2. Style : Anime/Manga
3. Vérifier que l'image est dans le style anime, pas un paysage

## Logs à vérifier
Dans les logs du serveur, vous devriez voir :
```
📝 Original prompt received: Description : [description]
✅ Hugging Face image generation successful: {
  description: "[description extraite]",
  enhancedPrompt: "[prompt final avec détails]",
  negativePrompt: "nature, landscape, trees, mountains..."
}
```

## Si le problème persiste

### Solution alternative 1 : Changer de modèle
Utiliser un modèle différent comme :
- `stabilityai/stable-diffusion-2-1`
- `CompVis/stable-diffusion-v1-4`

### Solution alternative 2 : Ajuster les paramètres
- Augmenter le guidance_scale (8.5-9.5)
- Augmenter les num_inference_steps (50-70)
- Utiliser un seed fixe pour la reproductibilité

### Solution alternative 3 : Prompt engineering avancé
- Utiliser des prompts plus spécifiques
- Ajouter des modificateurs comme "close-up", "centered", "studio lighting"
- Utiliser des prompts négatifs plus spécifiques

## Exemples de prompts améliorés

### Avant (problématique)
```
Description : Un chat noir assis sur un fauteuil rouge
```

### Après (corrigé)
```
Description : Un chat noir assis sur un fauteuil rouge (indoor scene, studio setting, urban environment)
```

### Prompt négatif ajouté
```
nature, landscape, trees, mountains, sky, clouds, grass, flowers, outdoor, blurry, low quality, distorted, deformed, ugly, bad anatomy, watermark, signature, text
```
