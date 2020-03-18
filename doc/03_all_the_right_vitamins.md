# Responsive Design & Device - Part 3

_"PWAs are just websites that took all the right vitamins"_ - Alex Russell

---

Dans cette dernière partie, nous allons adapter notre application à un usage plus vaste en nous posant ces questions :

- Peux-t-on assurer une continuité de l'expérience, même hors-ligne ?
- De quelles fonctionnalités regroupées sous le terme _Progressive Web Apps_ notre application peux-t-elle bénéficier ?

## 30 - Le service worker

Le service worker est un fichier JavaScript qui va s'installer sur la machine du visiteur à la première visite et qui permettra d'optimiser le fonctionnement du site par suite.

Creéz à la racine du projet un fichier `sw.js` et placez-y un code de test :

```
const name = 'bcalou';
console.log(`Hello ${name}`);
```

Le but est, comme pour `public/script.js`, de générez à partir de ce fichier un `public/sw.js` qui pourra être utilisé par l'application.

Ajoutez le script suivant au `package.json` :

```
"sw": "watchify sw.js -o public/sw.js -t [ babelify --presets [ babel-preset-minify ] ]"
```

Remarquez-vous une différence avec le script `watchify` ? On n'utilise plus `@babel/preset-env`, qui convertissait le JS en moderne en JS de base. En effet, les navigateurs concernés par les services workers sont modernes et comprennent bien la syntaxe actuelle. Une transformation (allongeant le code) serait donc contre productive.

Lancez le script :

```
npm run sw
```

Le fichier `public/sw.js` doit être crée.

Adaptez enfin le script `start` pour inclure ce nouveau script au processus global.

## 31 - Installation du service worker

Nous allons utiliser un script inline pour installer le service worker. En effet, le code est simple et a tout intérêt à s'éxécuter le plus tôt possible : on peut donc l'inclure directement dans le `<head>`, avant l'inclusion de `script.js`.

Pour écrire un script inline dans PUG, utilisez la syntaxe suivante :

```
script.
  console.log('Hello world !');
```

Amélioration progressive indispensable ici ! Tous les navigateurs ne comprennent pas les service workers. La condition à tester est la suivante :

```
if (navigator.serviceWorker) {
  console.log('All good');
} else {
  console.log('Nothing to see here...');
}
```

Pour charger le service worker, procédez ainsi dans la condition :

```
navigator.serviceWorker.register("/sw.js")
  .then(() => console.log('Service worker is registered'))
  .catch(err => console.warn(err));
```

Le message doit apparaître dans la console au rechargement.

## 32 - Rechargement du service worker

Un service worker n'est pas un fichier JS classique. Il s'installe sur la machine et s'exécute en fond. Le DevTools de Chrome permet une gestion des service workers dans le panneau Application > Service Worker.

Vous devez voir le script `sw.js` dans ce panneau.

Les service workers présentent une autre différence majeure avec des fichiers classiques : ils ne sont pas automatiquement mis à jour par le navigateur, même si vous changez le contenu du fichier. En développement, il faut cocher la case "Update on reload" pour permettre de contourner ce comportement.

Pour exécuter du code à l'installation du service worker, utilisez un écouteur d'évenement dans `sw.js` :

```
addEventListener('install', (event) => {
  console.log('Hello from the service worker')
});
```

Vérifiez la présence du message dans la console.

## 33 - Intercepter une requête

Vous pouvez intercepter toutes les requêtes grâce à un autre écouteur d'événement :

```
addEventListener('fetch', (event) => {
  console.log(event);
});
```

Dans l'onglet Console, cochez la case "Preserve log" pour ne pas effacer les messages au rechargement de la page.

Selon ce que vous avez mis en place jusqu'ici, vous devriez au moins voir trois `FetchEvent` : ils récupèrent le HTML, le CSS et le JS.

Et si nous interceptions toutes les requêtes HTML pour répondre avec... autre chose que la ressource demandée ? Dans l'écouteur :

```
if (event.request.headers.get('Accept').includes('text/html')) {
  event.respondWith(new Response('Hello World'));
}
```

Toutes les requêtes de type `text/html` renverront désormais la même chose. L'application est dans un piètre état !

À la place, nous allons répondre avec une vraie requête :

```
event.respondWith(fetch(event.request));
```

Nous avons ainsi reproduit le comportement normal du navigateur : quand une requête est effectuée... simplement récupérer la ressource.

Mais une différence est visible dans l'onglet Network. La requête vers localhost est présente en double. Une roue dentée permet de distinguer celle effectuée par le service worker.

Attention cependant, les fichiers ne sont bien récupérés qu'une seule fois. Le service worker fait simplement un passage de relais.

## 34 - Page offline

Nous pouvons nous servir du service worker pour offrir une réponse customisée en cas de perte de connexion :

```
event.respondWith(
  fetch(event.request)
    .catch(() => new Response('Vous êtes hors ligne')
  )
);
```

Comprendre : on tente le fetch, mais si ça ne fonctionne pas, voici une autre réponse ! Vous pouvez tester le résultat en simulant une perte de réseau ("Offline") dans l'onglet Network.

Il est possible de servir une page html dédiée. Mais comment la récupérer sans connexion ? C'est bien sûr impossible, c'est pourquoi nous allons mettre cette page en cache lors de l'installation du service worker, quand la connexion est active.

_Note : cela n'impacte la performance car le service worker fonctionne en tâche de fond et charge les fichiers sans bloquer le flux principal. En revanche attention à ne pas abuser des données mobiles de l'utilisateur et de l'espace de stockage du device !_

Créez une page `pwa/offline.html` (car oui, les service workers font partie des technologies constituant les PWAs).

```
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Qui prend quoi - Hors ligne</title>
  </head>
  <body>
    <h1>Oops !</h1>
    <h2>Vous êtes hors ligne</h2>
  </body>
</html>
```

Dans `app.js`, demandez à express de servir ce dossier comme un dossier statique (comme `public`).

Dans l'événement d'installation du service worker, le code suivant vous permettra de mettre la page en cache :

```
event.waitUntil(
  caches.open('offline').then((cache) => {
    cache.add('offline.html');
  })
);
```

On ouvre un cache qu'on appelera `offline`, puis on ajoute la page `offline.html` au cache.

En rechargeant le navigateur (n'oubliez pas de repasser "Online"), vous devriez voir apparaître la page stockée dans Application > Cache > Cache Storage.

Nous pouvons maintenant utiliser la page stockée comme solution de secours !

```
event.respondWith(
  fetch(event.request).catch(() => caches.match('offline.html')),
);
```

Jouez avec la connexion et admirez.

Personnalisée (puisque rien ne vous empêche d'y ajouter du CSS/JS), la page offline offre une opportunité unique de garder le lien avec votre visiteur, même aux heures les plus sombres de sa connexion.

## 35 - Stocker les pages événement

Même sans avoir les dernières mises à jour, il serait bien pratique de pouvoir accéder aux pages événement déjà visitées.

Écrivons d'abord une fonction permettant de savoir si une page est une page événément :

```
function isPartyPage(url) {
  return /party\/[a-zA-Z0-9]*$/.test(url);
}
```

L'expression régulière de cette fonction testera la présence dans l'url de `party/` suivi d'un id.

Mettez à jour la réponse HTML :

```
fetch(event.request)
  .then((res) => {
    if (isPartyPage(event.request.url)) {
      const copy = res.clone();
      caches
        .open('parties')
        .then((cache) => cache.put(event.request, copy));
      return res;
    } else {
      return res;
    }
  })
  .catch(() => caches.match('offline.html')),
```

Prenez le temps de bien lire :

- Si le fetch réussi (`then`)...
  - Si c'est une page événement
    - On clone la réponse (car c'est un objet de type flux, on ne peux pas l'utiliser deux fois, il faut le cloner !)
    - On ouvre le cache `parties` pour y stocker la réponse clonée. La méthode `put` permet d'avoir un système clé/valeur, où la clé est la requête et la valeur son contenu.
    - On retourne la réponse
  - Sinon, on retourne simplement la réponse
- Sinon (`catch`), on retourne la page `offline.html`

Si vous parcourez différentes pages événements, vous verrez dans Application > Cache > Cache Storage un nouveau cache se constituer au et à mesure de votre navigation.

Il ne reste qu'à modifier le `catch` pour tenter de retourner les versions des pages en cache :

```
.catch(() => {
  if (isPartyPage(event.request.url)) {
    return caches
      .match(event.request)
      .catch((err) => caches.match('offline.html'));
  } else {
    return caches.match('offline.html');
  }
})
```

- En cas d'échec de la requête (`catch`)
  - Si c'est une page événement
    - Renvoyer la page événement en cache si elle existe
    - Sinon, renvoyer la page `offline.html`
  - Sinon, renvoyer la page `offline.html`

Soyez prévenu(e), tester les service workers n'a rien d'évident : le faux mode hors-ligne, la nature persistante des workers et le travail en localhost ne font pas toujours bon ménage. Patience sera le maître mot.

Vous devriez maintenant pouvoir accéder aux pages événements que vous avez déjà consultées en mode hors-ligne !

Notez que CSS et JS ont disparu, mais grâce à l'approche d'amélioration progressive, le contenu est parfaitement consultable.

## 36 - Liste des pages disponibles

En mode hors ligne, on souhaite présenter au visiteur la liste des pages qu'il peut consulter.

Le cache ne peut que stocker le contenu d'une requête. Pour stocker le nom de la page en parallèle, nous allons devoir utiliser le localStorage. Comme ce dernier ne peut pas être appelé depuis les service workers, nous allons ajouter du JS "classique".

Dans `party.pug`, utilisez l'astuce suivante pour rendre la variable `party` disponible dans le JS :

```
script.
  party = !{JSON.stringify(party)}
```

_Note : il n'est pas gênant de mettre une balise `script` en dehors du `head`. C'est pour la bonne cause._

Créez un fichier `scripts/parties.js` :

```
if (typeof party !== 'undefined') {
  console.log(party);
}
```

L'objet événement devrait s'afficher dans la console, à condition qu'on soit sur une page de ce type.

Dans la condition, on enregistre l'adresse de la page en tant que clé et son nom en tant que valeur :

```
localStorage.setItem(location.href, party.name);
```

Nous allons maintenant nous servir de ces informations dynamique sur la page `offline.html`.

Par soucis de simplicité, nous allons écrire le JS directement dans `offline.html`. Si le client voit cette page, c'est que son service worker est en action, et donc que le JavaScript va pouvoir fonctionner sans problème.

Dans la réalité, il serait bon de suivre le processus habituel : fichier séparé (et donc également mis en cache), minification...

Dans une balise `<script>`, utilisez le code suivant pour parcourir le cache :

```
caches.open('parties').then((cache) =>
  cache.keys().then((keys) =>
    keys.forEach((key) => {
      console.log(key);
    })
  )
);
```

La console vous présente alors tous les objets `Request` en cache.

_Note : il est normal que la console contienne des erreurs hors-ligne : les requêtes échouent, et le service worker est là pour nous sauver la mise._

Pour chaque clé, essayez d'afficher le nom de la page correspondant, stocké dans le localStorage.

```
const name = localStorage.getItem(key.url);
console.log(key, name);
```

_Note : puisque nous avons mis en place la logique de localStorage après la logique de cache, certaines page n'ont pas leur nom enregistré : `getItem` retourne donc `null`._

Nous avons tout pour afficher un lien pour chaque page !

```
if (name) {
  const $link = document.createElement('a');
  $link.href = key.url;
  $link.innerHTML = name;
  document.body.appendChild($link);
}
```

Les différents liens en cache s'affichent. Améliorez le code pour les afficher dans une liste `<ul>`.

L'utilisateur hors connexion a désormais toutes les données enregistrées sur appareil facilement accessibles.

## 37 - Mise en cache des autres ressources

Nous pouvons également mettre en cache les autres ressources. Après le grand `if` testant si la requête concerne un fichier HTML, ajoutez un `else` et le code suivant :

```
event.respondWith(
  fetch(event.request)
    .then((res) => {
      const copy = res.clone();
      caches.open('static').then((cache) => cache.put(event.request, copy));
      return res;
    })
    .catch(() => caches.match(event.request)),
);
```

Prenez le temps de comprendre ce code :

- Si la requête fonctionne
  - Mettre dans un cache appelé `static` le fichier récupéré
  - Retourner le fichier
- Sinon, demander au cache

Vérifiez que le cache `static` se constitue bien. Passez hors-ligne : le JS et le CSS sont désormais accessibles sur les pages en cache !

## 38 - Le manifeste

Une _Progressive Web Apps_ se définit techniquement ainsi :

- Le site est servi en HTTPS
- Il possède un fichier `manifest.json`
- Il possède un service worker

La troisième étape est de loin la plus complexe et c'est celle que nous venons de mettre en oeuvre. Il ne reste que le HTTPS et le `manifest.json`.

### HTTPS

Le HTTPS dépend du serveur que vous utilisez. Malheureusement notre `localhost` est servi en HTTP. Pour que cela ne soit pas bloquant, nous allons simplement changer la configuration du navigateur.

Sur chrome, aussi bien sur desktop que sur mobile, ouvrez la page `chrome://flags/`.

D'abord, activez l'option _Allow invalid certificates for resources loaded from localhost_.

Puis, dans _Insecure origins treated as secure_, renseignez l'adresse par laquelle vous accédez à votre projet, par exemple `localhost:3000` ou `192.168.XXX.XXX` (remplacez les `X`) si vous testez via votre wifi sur le mobile.

Le redémarrage du navigateur peut être nécessaire.

### Le manifeste

Il s'agit de la "carte d'identité" de l'application, qui va lui permettre à de s'installer sur l'écran d'accueil du téléphone (à condition que les deux autres conditions soient remplies).

Grâce au site [Web App Manifest Generator](https://app-manifest.firebaseapp.com/), générez un manifeste pour votre application. Utiliser la [documentation](https://developer.mozilla.org/fr/docs/Web/Manifest) pour comprendre le rôle de chaque champ.

Ajoutez également une image de votre choix.

Téléchargez le résultat et insérez le contenu de l'archive dans le dossier `pwa`.

_Note : selon les sources consultées, le fichier de manifeste peut avoir l'extension `.json` ou `.webmanifest`, sans différence majeure._

Dans la balise de head de l'application, liez le manifeste :

```
link(rel="manifest" href="/manifest.json")
```

Utilisez l'onglet Audit de Chrome pour vérifier que votre PWA est bien en place.

Une fois ceci fait, accédez au site sur votre mobile.

Il est difficile de dire _quand_ la [suggestion d'installation](https://www.jomendez.com/wp-content/uploads/2018/06/add-to-home-screen.png) de l'application sera présentée, et même si elle le sera. Cela dépend de la qualité de notre implémentation, de l'OS, du [navigateur](https://caniuse.com/#feat=web-app-manifest)...

Et surtout, cela n'est pas automatique. La suggestion survient souvent après quelques visites rapprochées dans le temps, signe que l'utilisateur a démontré un intérêt pour le site.

Mais que ce soit sur [Chrome](https://azzurriwomen.com/sites/default/files/inline-images/Add-website-to-Android-homescreen-1-576x1024.png) ou [Safari](https://www.calendarwiz.com/knowledgebase_upload/image/mobile-iphone-addhomescreen.png), l'action est possible directement via le menu.

Par ailleurs il est possible, sur Chrome, pour développer, de désactiver ce comportement et de demander l'affichage immédiat de l'option. Il faut pour cela activer _bypass user engagement checks_ dans `chrome://flags`.

Une fois l'application sur votre écran d'accueil, ouvrez-là. L'interface est différente de celle du navigateur, et varie selon votre choix de `display` dans le manifest.

Vous pouvez contempler votre oeuvre.

## 39 - Poursuite en autonomie

### 39.b - Background sync

Imaginez qu'un utilisateur perde sa connexion entre le chargement de l'application et l'envoit du formulaire de création.

L'[API Background Sync](https://developers.google.com/web/updates/2015/12/background-sync) permet de mettre en attente cette action jusqu'au retour du réseau.

Saurez-vous l'implémenter ?

_Disclaimer : non exploré par mes soins !_

### 39.b - Push API

Il serait utile de recevoir une notication lorsque quelqu'un ajoute un élément à la liste. Même quand le site/PWA n'est pas ouvert ?

C'est la promesse de l'[API Push](https://developer.mozilla.org/en-US/docs/Web/API/Push_API) !

_Disclaimer : non exploré par mes soins !_

### 39.c - Mise en ligne

Les tests trouvent vite leurs limites en localhost / http.

Si vous avez un serveur que vous pouvez configurer en https et sur lequel vous pouvez éxécuter node, un déploiement s'impose !

_Attention : comme l'API est en http, même si vous déployez en https, vous serez dans une situation de "mixed-content", que la plupart des navigateurs traitent comme une connexion non-sécurisée (équivalent http)._

## Et ensuite ?

Rappelez-vous, ce TP est un support d'exploration ! L'application ne demande qu'à être améliorée.
