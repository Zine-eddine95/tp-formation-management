# 🚀 Configuration rapide de votre fichier .env

Votre fichier `.env` a été créé avec les bonnes valeurs pour votre projet !

## ✅ Ce qui est déjà configuré

- ✓ Base de données : `gestion_formation` sur localhost
- ✓ Utilisateur MySQL : `root` (sans mot de passe)
- ✓ Port du serveur : 3000
- ✓ JWT Secret pour l'authentification

## 📧 Configuration des emails - À FAIRE

Pour que l'envoi d'emails fonctionne, vous devez configurer ces deux lignes dans `.env` :

```env
EMAIL_USER=votre-email@gmail.com
EMAIL_PASSWORD=votre-mot-de-passe-application
```

### 🔐 Pour Gmail (recommandé) :

1. **Activez la validation en 2 étapes** sur votre compte Google
   - Allez sur https://myaccount.google.com/security
   - Activez "Validation en deux étapes"

2. **Créez un mot de passe d'application**
   - Allez sur https://myaccount.google.com/apppasswords
   - Sélectionnez "Mail" et "Ordinateur Windows"
   - Cliquez sur "Générer"
   - Copiez le mot de passe généré (16 caractères)

3. **Mettez à jour votre .env**
   ```env
   EMAIL_USER=votre.email@gmail.com
   EMAIL_PASSWORD=abcd efgh ijkl mnop  # Le mot de passe généré
   ```

### 📬 Pour d'autres fournisseurs :

**Outlook/Office365 :**
```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=votre.email@outlook.com
EMAIL_PASSWORD=votre-mot-de-passe
```

**Yahoo :**
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=votre.email@yahoo.com
EMAIL_PASSWORD=votre-mot-de-passe-application
```

## 🎯 Démarrer l'application

Une fois configuré, lancez simplement :

```bash
npm start
```

## ⚠️ Sécurité

- ❌ NE JAMAIS commiter le fichier `.env` sur Git
- ✓ Le fichier `.gitignore` est déjà configuré pour l'exclure
- ✓ Utilisez toujours des mots de passe d'application, jamais votre mot de passe principal

## 🧪 Tester les fonctionnalités

Une fois démarré, vous pouvez tester :

1. **Envoi d'email** : `POST http://localhost:3000/api/sessions/1/send-email`
2. **Génération PDF** : `GET http://localhost:3000/api/sessions/1/generate-pdf`
3. **Certificat** : `GET http://localhost:3000/api/sessions/1/certificate/1`

## 🆘 Problèmes courants

### La base de données ne se connecte pas
- Vérifiez que MySQL est démarré
- Vérifiez que la base `gestion_formation` existe
- Si besoin, créez-la : `CREATE DATABASE gestion_formation;`

### Les emails ne partent pas
- Vérifiez que vous avez bien un mot de passe d'application
- Vérifiez les valeurs dans `.env`
- Regardez les logs dans la console

Bon développement ! 🎉
