# STAMP.OS - PDF Stamping Tool 🖨️

Application web moderne pour parapher automatiquement **TOUTES les pages** d'un document PDF avec des initiales ou une image personnalisée.

## ✨ Fonctionnalités

- 📄 **Paraphe automatique** de toutes les pages d'un PDF
- ✍️ **Mode Texte** : Ajoutez vos initiales avec différentes polices
- 🖼️ **Mode Image** : Utilisez votre propre signature ou logo
- 🎯 **Positionnement précis** : Coordonnées X, Y avec origine (0,0) en bas à droite
- 📏 **Taille ajustable** : Contrôlez la taille du paraphe
- 🎨 **Opacité réglable** : De 10% à 100%
- 🖱️ **Drag & Drop** : Glissez-déposez vos fichiers PDF
- ⚡ **Traitement local** : Vos fichiers ne sont jamais envoyés sur un serveur
- 💾 **Téléchargement direct** : Récupérez immédiatement votre PDF paraphé

## 🚀 Démarrage rapide

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📖 Utilisation

### 1. Télécharger un PDF
Glissez-déposez un fichier PDF ou cliquez pour sélectionner (max 50MB)

### 2. Configurer le paraphe

**Mode Texte** : Saisissez vos initiales et choisissez une police  
**Mode Image** : Uploadez votre signature ou logo

### 3. Ajuster la position

**Système de coordonnées** : L'origine (0,0) est en **bas à droite**

- **X Offset** : Distance depuis le bord droit (5-200px)
- **Y Offset** : Distance depuis le bord bas (5-200px)

### 4. Personnaliser

- **Taille** : 6pt à 72pt
- **Opacité** : 10% à 100%

### 5. Traiter et télécharger

Cliquez sur **"PROCESS & DOWNLOAD"** pour parapher toutes les pages et télécharger

## 🛠️ Technologies

- Next.js 16 - Framework React
- TypeScript - Typage statique
- Tailwind CSS 4 - Styles
- pdf-lib - Manipulation de PDF
- pdfjs-dist - Rendu de PDF

## 🔒 Sécurité

✅ **100% local** : Traitement dans le navigateur  
✅ **Aucun upload** : Vos fichiers restent sur votre ordinateur  
✅ **Pas de stockage** : Aucune donnée sauvegardée

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
