if (navigator.share) {
  document.querySelectorAll('[data-share-url]').forEach(($shareEl) => {
    const $button = document.createElement('button');
    $button.innerHTML = 'Partager';
    $shareEl.parentNode.append($button);

    $button.addEventListener('click', share.bind(this, $shareEl));
  });
}

function share($shareEl) {
  navigator.share({
    title: $shareEl.getAttribute('data-share-title'),
    text: $shareEl.getAttribute('data-share-text'),
    url: $shareEl.getAttribute('data-share-url'),
  });
}
