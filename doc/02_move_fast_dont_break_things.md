# Responsive Design & Device - Part 2

_"Move fast, don't break things"_ - Scott Jehl

---

Le but de cette partie est d'utiliser des fonctionnalités avancées en CSS et JavaScript, certaines tout juste supportées par certains navigateurs, avec une stratégie d'amélioration progressive.

Cette partie part du principe que vous avez terminé la partie 16 de la partie précédente. La partie 17 est conseillée pour le rendu final mais est optionnelle pour cette partie.

## 18 - Utiliser SASS

Nous souhaitons utiliser SASS pour générer du CSS qui sera servi au front. Installons d'abord la dépendance :

```
npm install node-sass --save-dev
```

Créez un fichier `styles/style.scss` et insérez-y du code de test :

```
form {
  border: 1px solid blue;

  div {
    border: 1px solid red;
  }
}
```

Ajoutez le script suivant au fichier `package.json` :

```
"sass": "node-sass styles/style.scss public/style.css -w --output-style compressed"
```

On y trouve dans l'ordre :

- Le fichier source
- La destination
- L'option `-w` permettant d'observer les changement sur le code source
- L'option `--output-style compressed` permettant de minifier le résultat.

Lancez la commande `npm run sass` et vérifiez que le fichier `public/style.css` a bien été créé, contenant du CSS natif et minifié. Attention, il vous faudra peut-être ré-enregistrer votre fichier SCSS pour générer le fichier.

Modifiez le code : le fichier `public/style.css` est automatiquement re-généré.

Ajoutez le dossier `public/` au fichier `.gitignore`. Ce code généré n'a pas à être versionné.

Pour tester la fonctionnalité `@import` de SASS, créez un fichier `styles/vendors/reset.scss`, placez-y le code du [reset CSS](https://meyerweb.com/eric/tools/css/reset/) et importez-le au début du fichier principal. Vérifiez le fichier de sortie.

## 19 - Processus parallèles

Pour pouvoir gérer l'observation des fichiers SASS et le processus du serveur en parallèle, nous allons utiliser le package `concurrently` :

```
npm install concurrently --save-dev
```

Modifiez ensuite le script `start` :

```
"start": "concurrently --kill-others \"npm run sass\" \"nodemon app.js\"",
```

Lancez `npm run start`. Les changements sont observés sur les fichiers SASS, ainsi que les changements sur l'application.

## 20 - Lier le CSS au HTML

L'opération semble simple. Dans le `<head>` :

```
link(rel="stylesheet" href="/public/style.css")
```

Ouvrez l'onglet Network du DevTools et rechargez. La requête vers ce nouveau fichier renvoit une 404.

En effet, le serveur node.js ne sait pas qu'il doit répondre à cette requête avec notre fichier : il attend des instructions précises (quelle route, quelle méthode...).

Nous allons lui demander de servir tout le dossier `public` de façon statique, dans `app.js` :

```
app.use(express.static('public'));
```

Les fichiers du dossier `public` sont désormais accessible à la racine du serveur, il faut donc modifier notre `href` :

```
link(rel="stylesheet" href="/style.css")
```

Le style devrait désormais être appliqué. Sans aller dans le détail, prenez un instant pour retirer les règles de test en en ajouter quelques une qui semblent pertinentes.

## 21 - Grid CSS

Les grilles CSS sont très pratiques pour mettre en forme un formulaire, avec les inputs et les labels en vis-à-vis, dès que la taille le permet.

Tout d'abord, créez un fichier `styles/config/medias.scss` pour y déclarer la mixin suivante :

```
@mixin medium {
  @media (min-width: 430px) {
    @content;
  }
}
```

Importez le fichier dans `style.scss`.

Pour que la grille fonctionne, il faut que tous les enfants (labels et inputs) soit enfants du même parent :

```
form(method="post" action="/party").newParty
  div.newParty__fields
    label(for="name") Nom de l'événement
    input(name="name" id="name" required minlength="3" placeholder="Nouvel an")
    label(for="author" required) Votre pseudo
    input(name="author" id="author" required minlength="3" placeholder="John")
    label(for="date") Date de l'événement
    input(name="date" id="date" type="date")
  button(type="submit") Créer
```

Les différences sont les suivantes :

- Ajout d'une classe de bloc BEM au formulaire : `newParty`
- Tous les label et inputs sont dans la même `div`
- Ajout d'une classe `newParty__fields` sur cette `div`

Créez un fichier `styles/blocs/newParty.scss` avec le contenu suivant :

```
.newParty__fields {
  margin-bottom: 1em;

  @include medium {
    display: grid;
    grid-template-columns: 175px 1fr;
    grid-gap: 5px;
    max-width: 500px;
  }

  label {
    @include medium {
      place-self: center end;
    }
  }
}
```

Importez le fichier dans `style.scss`. Le formulaire doit être mis en forme sur les écrans supérieurs à 430px.

Attention ! Ce faisant, nous avons cassé le formulaire sur les écrans plus petit, et les navigateurs ne supportant pas la grille.

Il s'agit de rajouter une simple propriété à l'élément `label` :

```
display: block;
```

Peaufinez le comportement du formulaire selon vos souhaits.

Les navigateurs qui ne comprennent pas grid ignoreront les instructions sans provoquer d'erreur et auront une présentation plus simple. C'est l'**amélioration progressive**.

## 22 - Inclure du JS moderne

On souhaite écrire du JS utilisant les dernières fonctionnalités, tout en optimisant le support navigateur au maximum.

Créez un fichier `scripts/test.js` et insérez un test :

```
const numbers = [1, 2, 3];
const doubles = numbers.map(number => number * 2);
console.log(doubles);
```

Vous pouvez tester ce code dans la console de votre navigateur : il multiplie par deux les éléments d'un tableau, en utilisant une syntaxe JS avancée (`const` et fonction fléchée).

Installez watchify :

```
npm install watchify --save-dev
```

Ajoutez le script suivant à `package.json` :

```
"watchify": "watchify scripts/test.js -o public/script.js"
```

Mettez à jour le script `start` pour appeler ce nouveau script en plus, puis lancez `npm run start`.

Le fichier `public/script.js` apparaît. Il contient (entre autres), le code du fichier de test, à l'identique pour le moment.

Incluez le script dans la balise `<head>` :

```
script(src="/script.js")
```

Ouvrez la console du navigateur : le résultat du code doit apparaître.

## 23 - Plusieurs fichiers JavaScript

Ajoutez un deuxième fichier de test dans le même répertoire, nommé selon votre choix :

```
console.log("I'm here too !");
```

Pour le prendre en compte également, dans le script `watchify`, remplacer `scripts/test.js` par `scripts/*.js`.

Relancez `npm run start` : les deux fichiers sont maintenant rassemblés dans le fichier final (et les deux résultats sont visibles dans la console).

Si votre environnement n'apprécie pas cette syntaxe, vous devrez précisez un par un les fichiers concernés.

```
"watchify": "watchify scripts/test.js scripts/other.js -o public/script.js"
```

Attention donc, si c'est votre cas, à modifier le script quand vous ajoutez un nouveau fichier.

## 24 - Optimiser le JavaScript

`babelify` va nous permettre d'appliquer des transformations sur le JavaScript.

```
npm install babelify @babel/core @babel/preset-env --save-dev
```

Mettez à jour le script `watchify` ainsi :

```
"watchify": "watchify scripts/*.js -o public/script.js -t [ babelify --presets [ @babel/preset-env ] ]"
```

On demande à Watchify, chef d'orchestre, d'appliquer une transformation sur le JS via l'outil Babel, et on demande à ce dernier d'utiliser la configuration standard `preset-env`. C'est dense !

Regardez maintenant le script résultant : les `const` et la fonction flechée ont été transformé en code beaucoup plus basique.

_Note : la fonction `Array.map` fait partie de la spécification ES5 et est par conséquent largement supportée._

L'ajout d'un autre preset va nous permettre la minification :

```
npm install babel-preset-minify --save-dev
```

Il suffit de rajouter le preset à la commande :

```
"watchify": "watchify scripts/*.js -o public/script.js -t [ babelify --presets [ @babel/preset-env babel-preset-minify ] ]"
```

## 25 - Script asynchrone

Ouvrez l'onglet _Network_ du panneau de développement de Chrome et cochez la case "Disable cache".

Configurez la vitesse du réseau sur "Slow 3G", une bonne pratique pour tester vos sites.

Rechargez et notez la valeur du `DOMContentLoaded` affichée en bas de la liste des requêtes. Vous pouvez recharger quelques fois pour faire une moyenne.

Ajoutez maintenant l'attribut `async` au script pour lui demander de se charger en parallèle de l'interprétation du DOM, de façon non bloquante.

```
script(src="/script.js" async)
```

L'événement `DOMContentLoaded` a probablement baissé significativement. Le chargement des scripts de façon asynchrone est une bonne pratique.

Prenez quelques minutes pour charger des sites que vous connaissez en "Slow 3G". C'est lent ? En effet, pour beaucoup, un peu d'optimisation ne ferait pas de mal...

## 26 - L'API de _clipboard_

Vous pouvez supprimer les deux fichiers de test.

Nous allons désormais implémenter une fonctionnalité simple, mais qui n'est pas disponible sur tous les navigateurs : la copie vers le presse papier ([tableau de support navigateurs](https://caniuse.com/#feat=mdn-api_clipboard_write)).

Sur la page événement, à côté de l'input présentant l'URL de la page, on souhaite présenter aux navigateurs capable de le gérer un bouton "Copier".

Créez un fichier `scripts/clipboard.js`.

Nous ne pouvons pas ajouter le bouton directement dans le template : il pourrait apparaître sans fonctionner si le navigateur ne prend pas en charge la fonctionnalité. Il faut donc le faire apparaître en JavaScript.

Nous allons donc utiliser un _data attribute_ sur l'élément `<input>` afin de permettre au JS de s'y rattacher.

```
input(id="url" value=`${url}` data-clipboard=`${url}`)
```

Dans le JS, vous pouvez tester le support de l'API _clipboard_ simplement :

```
if (navigator.clipboard) {
  console.log("Support du presse papier")
} else {
  console.warn("Pas de support")
}
```

Si le test passe, on cherche les éléments possédant l'attribut `data-clipboard` :

```
document.querySelectorAll('[data-clipboard]')
```

Pour chaque élément trouvé, on créé un bouton qu'on injecte à ses côtés :

```
document.querySelectorAll('[data-clipboard]').forEach(($clipboardEl) => {
  const $button = document.createElement('button');
  $button.innerHTML = 'Copier';
  $clipboardEl.parentNode.append($button);
});
```

Testez la présence du bouton selon le navigateur/device.

_Astuce : si votre téléphone est sur le même wi-fi que votre ordinateur, vous pouvez trouver l'adresse de votre ordinateur sur le réseau (commande `ifconfig` ou `ipconfig`) et accéder de votre téléphone à `192.168.55.55:3000`. Les deux derniers chiffres varient._

_Astuce bis : vous pouvez également utiliser un câble USB et le [Port Forwarding](https://developers.google.com/web/tools/chrome-devtools/remote-debugging/local-server?hl=fr) pour accéder à votre projet à partir de votre téléphone._

_Astuce ter : pour forcer un test de "non support", il suffit de remplacer `navigator.clipboard` par `navigator.blablabla` ou une autre valeur dans le test !_

## 27 - Effectuer la copie

Après avoir ajouté chaque bouton potentiel, associez-y un écouteur de clic pour appeler une fonction de copie :

```
$button.addEventListener(
  'click',
  copyToClipboard.bind(this, $clipboardEl, $button)
);
```

_Note : la fonction `bind` permet de lier un appel de fonction sans utiliser une fonction anonyme du style `() => {}`. Le premier paramètre est le contexte d'éxécution, souvent `this`. Les autres paramètres seront passés à la fonction._

En fin de fichier, la fonction :

```
function copyToClipboard($clipboardEl, $button) {
  console.log('Click !');
}
```

Un clic sur le bouton doit désormais déclencher le `console.log`.

Voici comment effectuer la copie :

```
navigator.clipboard
  .writeText($clipboardEl.getAttribute('data-clipboard'))
  .then(() => {
    console.log('Copié !');
  })
  .catch((err) => console.warn(err));
```

Dans la fonction de succès, à la place du console.log, utilisez le code suivant pour mettre à jour temporairement le contenu du bouton :

```
$button.innerHTML = 'Copié !';
setTimeout(() => ($button.innerHTML = 'Copier'), 2000);
```

Testez : cliquez puis collez là valeur quelque part.

L'**amélioration progressive** nous permet de garantir un fonctionnement en cas de présence du bouton, sans bug pour les navigateurs incompatibles.

_Note : sur mobile, l'API de clipboard et celle de partage sont limitées aux sites "de confiance", par exemple en HTTPS. Pour le localhost, la technique du [Port Forwarding](https://developers.google.com/web/tools/chrome-devtools/remote-debugging/local-server?hl=fr) est à privilégier._

## 28 - L'API de partage

La _Web Share API_ ([tableau de support navigateurs](https://caniuse.com/#feat=web-share)) permet de faire appel aux options de partage disponibles sur le device (Messages, Messenger, WhatsApp, Telegram...) pour partager un contenu.

Créez un fichier `scripts/share.js`.

L'implémentation va être très similaire à cette de l'API _Clipboard_.

Ajoutez trois attributs à la balise `<input>` :

- data-share-url (URL de la page)
- data-share-title (Nom de l'événement)
- data-share-text ("XXX vous invite a rejoindre l'événement YYY")

Détectez le support avec la condition suivante :

```
if(navigator.share)
```

_Note : certains navigateurs passeront le test, sans pouvoir effectivement réaliser le partage... Personne n'est parfait._

En cas de support, détectez les éléments possédant l'attribut `data-share-url` et ajoutez un bouton "Partager" à côté.

Liez le clic sur le bouton à une fonction appelant l'API de partage :

```
navigator
  .share({
    title: $shareEl.getAttribute('data-share-title'),
    text: $shareEl.getAttribute('data-share-text'),
    url: $shareEl.getAttribute('data-share-url'),
  })
```

## 29 - Poursuite en autonomie

Votre application s'enrichit petit à petit de nouvelles capacités. Chaque navigateur les utilisera toutes, en partie ou pas du tout.

Les pistes suivantes peuvent être abordées sans ordre particulier.

### 29.a - Web APIs

Les [API web](https://developer.mozilla.org/en-US/docs/Web/API) sont nombreuses. Explorez, comparez, trouvez un cas d'usage et implémentez !

### 29.b - Rafraîchissement automatique

Vous avez peut-être, lors du dernier chapitre, affiché la liste des éléments d'un événement. Vous pouvez améliorer cette liste, en gardant bien en tête le principe d'amélioration progressive :

- Effectuez une requête avec l'[API fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) directement vers l'API finale : un `GET` sur `/party/:id`, toutes les 5 secondes.
- En cas de différence sur les items, re-générez dynamiquement la liste.
- Identifiez quel est le nouvel item, ou un des nouveaux items ayant provoqué le refraichissement, et utilisez l'[API de notifications](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)

### 29.c - Un petit coup de peinture

Votre application mérite désormais un vrai design ! Utilisez la méthodologie et l'architecture de votre choix pour mettre en place un CSS digne de ce nom.

Nous n'en avons pas eu besoin, mais sachez qu'il est possible de détecter le support d'une fonctionnalité en CSS :

```
@supports (display: flex) {
  header {
    display: flex;
  }
}
```

L'exemple est ici inutile, car la déclaration serait simplement ignorée si elle n'était pas comprise. Mais elle peut être utile dans des cas plus complexes, par exemple si on veut modifier un enfant du `header`, mais seulement à condition d'être sûr que le `header` lui-même pourra être en flex.

## Et ensuite ?

Rappelez-vous, ce TP est un support d'exploration ! L'application ne demande qu'à être améliorée.
