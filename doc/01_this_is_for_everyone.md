# Responsive Design & Device - Part 1

_"This is for everyone"_ - Tim Berners-Lee

---

Ce TP vous guidera dans la mise en place d'une application en _Server Side Rendering_ : les pages seront générées par le serveur Node lors de la requête.

En déléguant la complexité au serveur, nous allons permettre aux utilisateurs d'utiliser notre application grâce à une unique technologie simple mais robuste : `HTML`.

Suivez les étapes de ce TP en gardant un esprit critique et de recherche : testez, expérimentez, comparez... Et prenez des notes ! Il ne s'agit pas d'un cahier des charges mais d'une incitation à la découverte.

_Note : un point du TP est incorrect ou pas assez clair ? Une issue Github ou pull request de votre part sera valorisée !_

## 01 - Mise en place

Vérifiez que node et npm sont installés :

```
node -v
npm -v
```

Puis, dans votre dossier de travail habituel :

```
mkdir quiprendquoi
cd quiprendquoi
git init
npm init -y
```

Enfin, installez `express`, un framework très répandu pour écrire des applications Node.

```
npm install express --save
```

Ajoutez le fichier `.gitignore` pour igorer les dépendances.

```
node_modules/
```

Commitez en fin de chaque partie.

## 02 - Le fichier `app.js`

Créez un fichier `app.js` à la racine et placez-y le code suivant :

```
const express = require('express');
const app = express();
const port = 3000;

app.get('/', function(req, res) {
  res.send('Hello world');
});

app.listen(port, () => console.log(`Front app listening on port ${port}!`));
```

Changez "Hello world" pour un message de votre choix. Puis lancez l'application dans la console :

```
node app.js
```

Ouvrez `localhost:3000` sur votre navigateur et contemplez votre message.

## 03 - Utiliser les scripts

Il deviendra rapidement plus simple de lancer l'application en utilisant les scripts.

Dans `package.json`, remplacez le script de test par :

```
"scripts": {
  "start": "node app.js"
}
```

Si l'application est encore active dans le serveur, coupez-là (`Ctrl+C`). Vous pouvez maintenant la lancer ainsi :

```
npm run start
```

L'application doit fonctionner à l'identique.

## 04 - Rafraîchissement automatique

Installez `nodemon`, un package permettant de rafraîchir les applications Node quand le code est mis à jour :

```
npm install nodemon --save-dev
```

Mettez à jour le script de lancement :

```
"start": "nodemon app.js"
```

Relancez l'application avec `npm run start`, puis modifiez à nouveau le message. L'application est mise à jour (il faut tout de même rafraîchir le navigateur).

## 05 - Variables d'environnement

Stockez les variables d'environnement dans un fichier `.env` situé à la racine.

```
NODE_ENV=development
PORT=3000
API_URL=http://bastiencalou.fr:3000
```

Pour les utiliser dans votre code, installez `dotenv` :

```
npm install dotenv --save
```

Puis ajoutez dans votre fichier principal :

```
const dotenv = require('dotenv').config();
```

Vous pouvez désormais supprimer la variable `port` et utiliser `process.env.PORT` à la place.

Stocker à part les variables qui peuvent changer d'un déploiement à un autre est une bonne pratique !

## 06 - Servir un template pug

Installez [pug](https://pugjs.org/api/getting-started.html), un langage de templating qui nous permettra de présenter des données dynamiques.

```
npm install pug --save
```

Créez un fichier `index.pug` dans un dossier `views`, et créez votre premier template :

```
html(lang="fr")
  head
    title Qui prend quoi ?
    meta(charset="UTF-8")
    meta(name="viewport", content="width=device-width, initial-scale=1.0")
    meta(http-equiv="X-UA-Compatible", content="ie=edge")
  body
    h1 Qui prend quoi ?
```

_Note : dans un fichier `.pug`, vous pouvez utiliser la syntaxe HTML classique si vous préférez, et utiliser ponctue llement les capacités de Pug._

Dans `app.js`, indiquez Pug comme moteur de template :

```
app.set('view engine', 'pug');
```

À la place d'un simple texte en réponse à la route principale, répondez ainsi :

```
app.get('/', function(req, res) {
  res.render('index');
});
```

Rafraîchissez la page et inspectez le code : il s'agit bien d'HTML classique, converti par le serveur lors de la requête.

## 07 - Inclure des sous-templates

Un des intérêt de Pug est de ne pas avoir à répéter certains blocs courants (header, footer...) sur les différentes pages d'un site.

Un sous-template est généralement appelé _partial_.

Créez un fichier `partials/header.pug` et déplacez-y le contenu du fichier `index.pug`, a l'exception du contenu body.

Puis incluez le _partial_ dans la page `index.pug` ainsi :

```
include ../partials/header.pug
h1 Qui prend quoi ?
```

Notez que l'indentation du `h1` a été supprimée dans le processus.

Relancez. Le résultat doit être identique !

## 08 - Passer des variables aux templates

Avec la multiplication des pages de l'application, il sera intéressant de pouvoir passer un titre différent à chacune, pour la balise `title` dans `header.pug`.

Vous pouvez passer une variable ainsi :

```
res.render('index', { title: 'Qui prend quoi ?' });
```

Et l'utiliser ainsi :

```
title= title
```

Dans le code ci dessus, le premier `title` est le nom de la balise, le deuxième `title` est une référence à la variable passée au template.

Vous pouvez aussi combiner un texte fixe et une variable :

```
title QPQ - #{title}
```

Essayez avec plusieurs valeurs.

## 09 - Le formulaire de création d'événement

Il est temps d'ajouter à la page le formulaire permettant de créer un événement. Comme nous travaillons en pur HTML, nous allons utiliser les capacités natives de la balise `form`, capable d'exécuter un `GET` ou un `POST` vers une URL précise.

Ajoutez le formulaire :

```
h2 Créer un événement
form(method="post" action="/party")
  div
    label(for="name") Nom de l'événement
    input(name="name" id="name" required minlength="3" placeholder="Nouvel an")
  button(type="submit") Créer
```

Ajoutez les deux champs manquants :

- Auteur (requis)
- Date (optionel)

Testez le formulaire ainsi que les règles de soumission (un comportement HTML natif puissant !). Quand vous soumettez le formulaire, vous obtenez quelque chose de ce style :

```
Cannot POST /party
```

En effet, notre application ne connaît pas encore cette route !

## 10 - La route `POST`

Vous voyez ce bout de code dans le fichier d'application ?

```
app.get('/', function(req, res) {
  res.render('index', { title: 'Qui prend quoi ?' });
});
```

Dupliquez-le et apportez les changement suivants :

- Répondez à une action `POST` et non `GET`
- La route concernée n'est plus `/` mais `/party`
- Utilisez un simple `res.send('Post ok !')` en tant que réponse

Testez l'effet en soumettant à nouveau le formulaire.

## 11 - Récupérer les paramètres du `POST`

Pour récupérer les paramètres du formulaire, installez le plugin `body-parser`.

```
npm install body-parser --save
```

Importez le dans l'application :

```
const bodyParser = require('body-parser')`;
```

Enfin, utilisez le avant la définition des routes :

```
app.use(bodyParser.urlencoded({ extended: true }));
```

Les paramètres d'un `POST` effecué à partir d'un formulaire se trouvent dans la variable `req`, passé en paramètre à chaque route.
Avant le render du `POST`, observez le contenu de `req.body` :

```
console.log(req.body);
```

En observant dans votre console (celle qui fait tourner `app.js`, pas celle du navigateur !) vous verrez apparaître les données transferées lors du `POST`.

## 12 - `POST` vers l'API

Pour faire la requête vers l'API, installez `axios` :

```
npm install axios --save
```

Importez `axios` dans l'application :

```
const axios = require('axios');
```

Vous pouvez retirer la réponse temporaire et effectuer la requête à la place :

```
axios
  .post(`${process.env.API_URL}/party`, req.body)
  .then(({data}) => console.log(data))
  .catch((err) => console.error(err));
```

_Note : la syntaxe {data} permet de récupérer directement l'objet `data` contenu dans la réponse (ici, l'événement)_

Dans le terminal, au moment du `POST`, vous devriez voir apparaître l'objet créé :

```
{ _id: '5e6eb963d231d76972918f43',
  name: 'azezae',
  author: 'zaezaeeaz',
  date: null,
  items: [],
  __v: 0 }
```

Si ce n'est pas le cas, soit :

- Votre code est incorrect, relisez-bien
- L'API a un problème. Pour le savoir, utilisez _Postman_ pour faire une requête à la main et observer le comportement de l'API. Merci de me contacter en cas d'API défectueuse.

## 13 - La page événément

Copiez l'`id` de l'événément que vous venez de créer et accédez à la page suivante :

```
localhost:3000/party/5e6eb963d231d76972918f43
```

Vous verrez que la route n'existe pas encore, ce qui est normal :

```
Cannot GET /party/5e6eb963d231d76972918f43
```

Ajoutez une troisième route à `app.js`, avec les critères suivants :

- méthode `GET`
- url : `/party/:id`

Créez une nouvelle page `views/party.pug` :

```
include ../partials/header.pug
h1 Qui prend quoi ?
h2 Page événement
```

Configurez la route pour servir ce template avec `res.render`, comme déjà fait pour `index.pug` (passez un titre temporaire en paramètre).

La page devrait désormais apparaître en rafraîchissant le navigateur.

## 14 - Récupérer l'événément auprès de l'API

Vous pouvez récupérer l'`id` dans l'URL grâce à `req.params`. Essayez à l'intérieur de la route, avant le render :

```
console.log(req.params.id)
```

L'`id` s'affiche dans le terminal. Il va nous permettre de récupérer l'événément en base, et de le passer au template :

```
axios
  .get(`${process.env.API_URL}/party/${req.params.id}`)
  .then(({ data }) =>
    res.render('party', {
      party: data,
      title: data.name
    }),
  )
  .catch((err) => console.log(err));
```

Le `title` de la page devrait maintenant être le nom de l'événément créé.

On passe également l'objet `party` que l'on peut utiliser dans le template :

```
h2= party.name
h3 Créé par #{party.author}
```

Prenez le temps de comprendre le fonctionnement de ce code et de tester différents paramètres !

## 15 - Rediriger le `POST` vers la page événement

Pour offrir une expérience acceptable, nous devons rediriger l'utilisateur qui poste un événément vers la page de l'événement en question.

Mettez à jour la route `POST` :

```
axios
  .post(`${process.env.API_URL}/party`, req.body)
  .then(({ data }) => res.redirect(`/party/${data._id}`))
  .catch((err) => res.send(err));
```

Le `res.redirect` permet de rediriger le processus vers une autre route.

On a également, dans le `catch`, remplacé le `console.error` par un retour d'erreur. Il serait bon de penser à une page d'erreur dédiée, à l'avenir !

Vous pouvez désormais faire le processus au complet :

- Aller sur la page d'accueil
- Poster un évémément
- Atterir sur la page de l'événement

## 16 - Partager l'URL d'un événement

Comment permettre le partage d'URL en pur HTML, certains utilisateurs ne se doutant pas qu'il leur suffirait de copier l'adresse présente dans la barre d'adresse du navigateur ?

Un `input` permet d'afficher un texte facilement sélectionnable et copiable sur mobile.

Il faut déjà passer l'URL de la page au template. Commençons par ajouter l'URL de notre environnement dans `.env` :

```
FRONT_URL=http://localhost
```

On peut désormais former l'URL de la page :

```
res.render('party', {
  party: data,
  title: data.name,
  url: `${process.env.FRONT_URL}:${process.env.PORT}/party/${data._id}`
}),
```

La variable `url` peut désormais être utilisée dans le template :

```
label(for="url") Partagez l'événement
input(id="url" value=`${url}`)
```

## 17 - Poursuite en autonomie

Félicitations : votre premier parcours est terminé ! Il est :

- accessible à tous les navigateurs
- accessible à toutes les tailles de device
- extrêmement léger (vérifiez par vous même dans l'onglet `Network`)
- accessible et naviguable au clavier

En un mot, résilient !
Il sera bientôt temps de profiter de ces fondations solides pour implémenter des technologies modernes en CSS et JS avec une méthodologie d'_amélioration progressive_.

Mais il vous faut d'abord compléter les fonctionnalités de base de l'application !

### 17.a Ajout d'un item

Grâce à un formulaire situé sur la page d'un événement, un utilisateur peut ajouter un item à l'événément.

Il vous faudra pour cela créer une nouvelle route `POST` et rediriger à nouveau vers la page événement.

### 17.b Affichage des items

La liste des items est affichée sur la page d'un événement.

Il vous faudra pour cela utiliser l'instruction [each](https://pugjs.org/language/iteration.html) de Pug.

### 17.c Suppression d'un item

Chaque item est accompagné d'un bouton de suppression permettant de le retirer de la liste.

Il vous faudra pour cela créer une dernière route de type `POST` (les formulaires HTML n'acceptent la méthode `DELETE`, uniquement `GET` et `POST`), puis, à nouveau, rediriger vers la page événement.

## Et ensuite ?

Rappelez-vous, ce TP est un support d'exploration ! L'application ne demande qu'à être améliorée.
