/* ООО «Морской вектор»: подбор перевозки, температура, вакансии, формы */
(function () {
  'use strict';
  var WA = 'https://wa.me/375296098025';

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }

  /* меню */
  function initDrawer() {
    var b = $('#burg'), d = $('#drawer'), x = $('#drawerX');
    if (!b || !d) return;
    var last = null;
    function open() { last = document.activeElement; d.hidden = false; b.setAttribute('aria-expanded', 'true'); document.body.classList.add('is-locked'); if (x) x.focus({ preventScroll: true }); }
    function close() { d.hidden = true; b.setAttribute('aria-expanded', 'false'); document.body.classList.remove('is-locked'); if (last) last.focus({ preventScroll: true }); }
    b.addEventListener('click', function () { d.hidden ? open() : close(); });
    if (x) x.addEventListener('click', close);
    d.addEventListener('click', function (e) { if (e.target.closest('a') || !e.target.closest('.drawer__in')) close(); });
    document.addEventListener('keydown', function (e) {
      if (d.hidden) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return;
      var it = d.querySelectorAll('a, button'); if (!it.length) return;
      var f = it[0], l = it[it.length - 1];
      if (e.shiftKey && document.activeElement === f) { e.preventDefault(); l.focus(); }
      else if (!e.shiftKey && document.activeElement === l) { e.preventDefault(); f.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 1180 && !d.hidden) close(); });
  }

  /* подбор перевозки */
  function initCalc() {
    var out = $('#cOutVehicle');
    if (!out) return;
    var state = { dir: 'by', dirName: 'Беларусь', cargo: 'dry', cargoName: 'Сухой', weight: 12, extras: [] };
    var TEMPS = { dry: '—', chill: '0…+4 °C', frozen: '−18 °C', deep: '−25 °C' };
    var CARGO = { dry: 'Сухой', chill: 'Охлаждённый', frozen: 'Замороженный', deep: 'Глубокой заморозки' };
    var DIRS = { by: 'Беларусь', eaeu: 'ЕАЭС · Россия', eu: 'ЕС', multi: 'Мультимодально' };
    var REF = { chill: 1, frozen: 1, deep: 1 };

    function compute() {
      var ref = !!REF[state.cargo];
      var w = state.weight;
      var vehicle, mon, time, docs, note;

      if (w <= 5) {
        vehicle = (ref ? 'Малотоннажный реф' : 'Малотоннажный тент') + ' до 5 т';
      } else if (state.dir === 'multi' || (state.dir === 'eu' && w > 20)) {
        vehicle = (ref ? 'Реф-контейнер 40′' : 'Контейнер 40′') + ' + авто';
      } else {
        vehicle = ref ? 'Тягач + реф-полуприцеп, до 22 т' : 'Тягач + тент, до 22 т';
      }

      mon = ref ? 'Датчик в кузове + онлайн-лог' : 'GPS-статус рейса';

      time = { by: '1 день', eaeu: '2–3 дня', eu: '4–6 дней', multi: '5–8 дней' }[state.dir];

      if (state.dir === 'by') {
        docs = 'ТТН и акт приёма-передачи. Для продукции — ветеринарные документы.';
      } else if (state.dir === 'eaeu') {
        docs = 'ТТН/CMR, ветеринарный сертификат для продукции, документы по ЕАЭС.';
      } else if (state.dir === 'eu') {
        docs = 'CMR, TIR, таможенное оформление и ветеринарный сертификат для продукции.';
      } else {
        docs = 'CMR и железнодорожная накладная, перегрузка на контейнерной площадке в Колядичах.';
      }

      note = 'Перевозка из Колядичей: ';
      if (ref) note += 'температурный режим ' + TEMPS[state.cargo] + ' держится на всём пути, протокол температуры отдаём при сдаче. ';
      else note += 'груз сухой, температурный режим не требуется. ';
      if (state.extras.indexOf('store') > -1) note += 'Добавим ответственное хранение на терминале. ';
      if (state.extras.indexOf('load') > -1) note += 'Погрузку и разгрузку организуем. ';
      if (state.extras.indexOf('docs') > -1) note += 'Таможенное оформление берём на себя. ';
      note += 'Документы: ' + docs;

      $('#cOutVehicle').textContent = vehicle;
      $('#cOutTemp').textContent = REF[state.cargo] ? TEMPS[state.cargo] : 'без режима';
      $('#cOutMon').textContent = mon;
      $('#cOutTime').textContent = time;
      $('#cOutText').textContent = note;
      $('#cDirL').textContent = DIRS[state.dir];
      $('#cCargoL').textContent = CARGO[state.cargo];
      $('#cWeightL').textContent = w + ' т';

      var txt = 'Заявка с сайта «Морской вектор»\nНаправление: ' + DIRS[state.dir] +
        '\nГруз: ' + CARGO[state.cargo] + (REF[state.cargo] ? ' (' + TEMPS[state.cargo] + ')' : '') +
        '\nВес партии: ' + w + ' т' +
        (state.extras.length ? '\nДополнительно: ' + state.extras.map(function (k) { return ({ store: 'хранение', load: 'погрузка/разгрузка', docs: 'таможня' })[k]; }).join(', ') : '') +
        '\nРекомендация: ' + vehicle + ', ' + time;
      var send = $('#cSend');
      if (send) send.href = WA + '?text=' + encodeURIComponent(txt);
    }

    function group(id, key, map) {
      var box = $(id);
      if (!box) return;
      box.addEventListener('click', function (e) {
        var t = e.target.closest('.chip'); if (!t) return;
        $$('.chip', box).forEach(function (c) { c.classList.toggle('is-on', c === t); });
        state[key] = t.getAttribute('data-v');
        compute();
      });
    }
    group('#cDir', 'dir');
    group('#cCargo', 'cargo');

    var ex = $('#cExtra');
    if (ex) ex.addEventListener('click', function (e) {
      var t = e.target.closest('.chip'); if (!t) return;
      var v = t.getAttribute('data-v');
      var i = state.extras.indexOf(v);
      if (i > -1) { state.extras.splice(i, 1); t.classList.remove('is-on'); }
      else { state.extras.push(v); t.classList.add('is-on'); }
      compute();
    });

    var w = $('#cWeight');
    if (w) w.addEventListener('input', function () { state.weight = parseInt(w.value, 10); compute(); });
    compute();
  }

  /* температура */
  function initTemp() {
    var box = $('#tModes');
    if (!box) return;
    var DATA = {
      '-18': { lbl: '−18 °C', name: 'Замороженный груз', equip: 'Реф-контейнер 40′', pos: 14, txt: 'Для замороженной продукции держим −18 °C и ниже: датчики пишут температуру в облако, а в терминале Колядичи контейнер получает питание с первого дня.' },
      '2': { lbl: '0…+4 °C', name: 'Охлаждённый груз', equip: 'Реф-фура 0…+4 °C', pos: 52, txt: 'Охлаждённый груз — самый чувствительный: держим 0…+4 °C и контролируем режим на стоянках и границе, чтобы продукция не ушла в тепло.' },
      '10': { lbl: '+8…+12 °C', name: 'Прохладный режим', equip: 'Реф + климат-контроль', pos: 70, txt: 'Для грузов, которым вреден и холод, и жара: +8…+12 °C, мягкий режим без риска подморозить продукцию.' },
      '20': { lbl: 'без режима', name: 'Сухой груз', equip: 'Тент / шторный полуприцеп', pos: 90, txt: 'Сухим грузам нужен не холод, а сухость и сохранность упаковки. Контролируем статус рейса и состояние груза при приёмке и выдаче.' }
    };
    function set(t) {
      var d = DATA[String(t)]; if (!d) return;
      $$('.chip', box).forEach(function (c) { c.classList.toggle('is-on', c.getAttribute('data-t') === String(t)); });
      var mark = $('#tMark');
      if (mark) { mark.style.left = d.pos + '%'; mark.setAttribute('data-l', d.lbl); }
      $('#tName').textContent = d.name;
      $('#tEquip').textContent = d.equip;
      $('#tText').textContent = d.txt;
    }
    box.addEventListener('click', function (e) {
      var c = e.target.closest('.chip'); if (c) set(c.getAttribute('data-t'));
    });
    set('-18');
  }

  /* вакансии */
  function initVac() {
    var list = $('#vacList');
    if (!list) return;
    list.addEventListener('click', function (e) {
      var h = e.target.closest('.vac__h');
      if (h) {
        var item = h.closest('.vac__i');
        var open = item.classList.contains('is-open');
        $$('.vac__i', list).forEach(function (i) { i.classList.remove('is-open'); var b = i.querySelector('.vac__h'); if (b) b.setAttribute('aria-expanded', 'false'); });
        if (!open) { item.classList.add('is-open'); h.setAttribute('aria-expanded', 'true'); }
        return;
      }
      var ap = e.target.closest('[data-apply]');
      if (ap) {
        var title = ap.getAttribute('data-apply');
        var sel = $('#aVac');
        if (sel) {
          $$('option', sel).forEach(function (o) { if (o.textContent.trim() === title) sel.value = o.textContent.trim(); });
        }
        var form = $('#apply');
        if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        var nm = $('#aName');
        if (nm) setTimeout(function () { nm.focus({ preventScroll: true }); }, 420);
      }
    });
  }

  /* формы */
  function bindForm(formId, okId, preId, sendId, copyId, build) {
    var f = document.getElementById(formId);
    if (!f) return;
    var ok = document.getElementById(okId), pre = document.getElementById(preId);
    var send = document.getElementById(sendId), copy = document.getElementById(copyId);
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var txt = build();
      if (!txt) return;
      pre.textContent = txt;
      if (send) send.href = WA + '?text=' + encodeURIComponent(txt);
      if (ok.hidden) {
        ok.hidden = false;
        $$('input, select, textarea, .form__b', f).forEach(function (el) { el.disabled = true; });
      }
      ok.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
    if (copy) copy.addEventListener('click', function () {
      var t = pre.textContent || '';
      if (navigator.clipboard) navigator.clipboard.writeText(t);
      copy.textContent = 'Скопировано';
      setTimeout(function () { copy.textContent = 'Скопировать'; }, 1700);
    });
  }

  function initForms() {
    bindForm('leadForm', 'formOk', 'orderText', 'orderSend', 'orderCopy', function () {
      var n = $('#fName'), p = $('#fPhone');
      var bad = false;
      [n, p].forEach(function (el) { if (!el.value.trim()) { el.style.borderColor = '#C0392B'; bad = true; } else { el.style.borderColor = ''; } });
      if (bad) return null;
      var t = 'Заявка с сайта «Морской вектор»\nИмя: ' + n.value.trim() + '\nТелефон: ' + p.value.trim() +
        '\nЗадача: ' + $('#fWhat').value + ($('#fNote').value.trim() ? '\nГруз и направление: ' + $('#fNote').value.trim() : '');
      return t;
    });

    bindForm('applyForm', 'applyOk', 'applyText', 'applySend', 'applyCopy', function () {
      var n = $('#aName'), p = $('#aPhone');
      var bad = false;
      [n, p].forEach(function (el) { if (!el.value.trim()) { el.style.borderColor = '#C0392B'; bad = true; } else { el.style.borderColor = ''; } });
      if (bad) return null;
      return 'Отклик на вакансию с сайта «Морской вектор»\nИмя: ' + n.value.trim() + '\nТелефон: ' + p.value.trim() +
        '\nВакансия: ' + $('#aVac').value + ($('#aExp').value.trim() ? '\nОпыт: ' + $('#aExp').value.trim() : '') +
        '\nРезюме пришлю в ответном сообщении.';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initDrawer(); initCalc(); initTemp(); initVac(); initForms();
  });
})();

/* FAQ */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var boxes = document.querySelectorAll('.faq');
    [].forEach.call(boxes, function (box) {
      box.addEventListener('click', function (e) {
        var h = e.target.closest('.faq__h');
        if (!h) return;
        var item = h.parentElement, open = item.classList.contains('is-open');
        [].forEach.call(box.children, function (c) { c.classList.remove('is-open'); var b = c.querySelector('.faq__h'); if (b) b.setAttribute('aria-expanded', 'false'); });
        if (!open) { item.classList.add('is-open'); h.setAttribute('aria-expanded', 'true'); }
      });
    });
  });
})();
