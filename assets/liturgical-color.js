(function () {
  var chip = document.querySelector('.lit-chip');
  if (!chip) return;
  var dot = chip.querySelector('.lit-dot');
  var label = chip.querySelector('.label');
  if (!dot || !label) return;

  var COLOR_MAP = {
    'Verde': { key: 'verde', pt: 'Verde', en: 'Green', es: 'Verde' },
    'Roxo': { key: 'roxo', pt: 'Roxo', en: 'Purple', es: 'Morado' },
    'Vermelho': { key: 'vermelho', pt: 'Vermelho', en: 'Red', es: 'Rojo' },
    'Rosa': { key: 'rosa', pt: 'Rosa', en: 'Rose', es: 'Rosa' },
    'Branco': { key: 'branco', pt: 'Branco', en: 'White', es: 'Blanco' }
  };

  // Só os nomes de tempo litúrgico mais comuns/recorrentes — a API não separa
  // "tempo" de "celebração do dia" num campo próprio, então procuramos esses
  // nomes dentro do texto livre de `liturgia`. Se nada bater, mostramos só a
  // cor (sem inventar um tempo litúrgico errado).
  var SEASON_MAP = [
    { match: 'Advento', pt: 'Advento', en: 'Advent', es: 'Adviento' },
    { match: 'Natal', pt: 'Natal', en: 'Christmas', es: 'Navidad' },
    { match: 'Quaresma', pt: 'Quaresma', en: 'Lent', es: 'Cuaresma' },
    { match: 'Páscoa', pt: 'Páscoa', en: 'Easter', es: 'Pascua' },
    { match: 'Tempo Comum', pt: 'Tempo Comum', en: 'Ordinary Time', es: 'Tiempo Ordinario' }
  ];

  var htmlLang = document.documentElement.lang || 'pt';
  var LANG = htmlLang.indexOf('en') === 0 ? 'en' : htmlLang.indexOf('es') === 0 ? 'es' : 'pt';

  var now = new Date();
  var url = 'https://liturgia.up.railway.app/v2/?dia=' + now.getDate() +
    '&mes=' + (now.getMonth() + 1) + '&ano=' + now.getFullYear();

  fetch(url)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var colorInfo = COLOR_MAP[data.cor];
      if (!colorInfo) return; // cor não reconhecida — mantém o chip estático como está

      dot.style.background = 'var(--' + colorInfo.key + '-accent)';
      chip.style.background = 'var(--' + colorInfo.key + '-tint)';
      label.style.color = 'var(--' + colorInfo.key + '-fg)';

      var seasonText = '';
      for (var i = 0; i < SEASON_MAP.length; i++) {
        if (data.liturgia && data.liturgia.indexOf(SEASON_MAP[i].match) !== -1) {
          seasonText = SEASON_MAP[i][LANG];
          break;
        }
      }
      label.textContent = colorInfo[LANG] + (seasonText ? ' · ' + seasonText : '');
    })
    .catch(function () {
      // Sem rede ou API fora do ar — o chip fica com o texto estático já no HTML.
    });
})();
