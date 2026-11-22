/* Режим мастера «Сладкого домика»: правки текстов, фото, каталога, работ, цен и контактов.
   Данные: data.js (window.SITE_DATA), сохранение через Apps Script в GitHub. */
(function () {
'use strict';
const MASTER_URL = "https://script.google.com/macros/s/AKfycbzFzWWsmMP49DMlycR49pNzL7HMWXaSLkSA1iAYV1hzxjdHsmVk2ocIR_N_am5DuGvE/exec";
const LS_T = "sd-master", LS_D = "sd-draft", SS_OWN = "sd-own";
const $ = id => document.getElementById(id);
const clone = o => JSON.parse(JSON.stringify(o));
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const norm = s => String(s || "").replace(/\s+/g, " ").trim();
const root = document.documentElement;

/* ---------- исходное состояние страницы ---------- */
const SKIP = "header,#mobile-nav,.mockup,.product-grid,#gallery,.filters,#more,form,dialog,script,style,svg,a,output,.mbar,noscript,.price-seal small,.m-enter";
const TK = [];   // [{k, el, o}]
let n = 0;
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
const texts = [];
while (walker.nextNode()) { const t = walker.currentNode; if (norm(t.nodeValue) && t.parentElement && !t.parentElement.closest(SKIP)) texts.push(t); }
texts.forEach(t => {
  const p = t.parentElement;
  let e = p;
  if (p.childNodes.length !== 1) { e = document.createElement("span"); p.insertBefore(e, t); e.appendChild(t); }
  if (e.dataset.tk) return;
  e.dataset.tk = "t" + (n++);
  const raw = e.textContent; TK.push({k: e.dataset.tk, el: e, o: norm(raw), pre: /^\s/.test(raw) ? " " : "", post: /\s$/.test(raw) ? " " : ""});
});
const HK = [];   // скрываемые блоки
const HSEL = "main > section, body > section, .acc-grid > *, .trust > li, .steps > li, .rv-grid > *, .faq details, #bundle, .hero-art .back-photo, .price-seal, .hero-note, .stamp, #delivery .wrap > *";
document.querySelectorAll(HSEL).forEach((e, i) => { if (e.closest("header,dialog,form")) return; e.dataset.hk = "h" + i; HK.push({k: e.dataset.hk, el: e, o: norm(e.textContent).slice(0, 40)}); });
const IK = [];
document.querySelectorAll("img").forEach((e, i) => { if (e.closest(SKIP)) return; e.dataset.ik = "i" + i; IK.push({k: e.dataset.ik, el: e, o: e.getAttribute("src")}); });
const LK0 = {tel: "+7 915 097-19-44", wa: "https://wa.me/79150971944", max: "https://max.ru/u/f9LHodD0cOJsC0oTp6cP0GGXwq1kKxejM_gnBfEqGsMKxpt3eNJAthwU0ho", vkpersonal: "https://vk.ru/write754299219", maxch: "https://max.ru/join/qPjPz2Lf94W5uS9xBawd1B8jcgIG_WG9RNajYIsjJFQ", vk: "https://vk.ru/instadesertiko", vkm: "https://vk.ru/im?sel=-223763661"};
const LKEL = [];
document.querySelectorAll("a[href]").forEach(a => {
  const h = a.getAttribute("href");
  if (h.startsWith("tel:")) LKEL.push({a, k: "tel"});
  else for (const k of ["wa", "max", "maxch", "vkpersonal", "vkm", "vk"]) if (h === LK0[k]) { LKEL.push({a, k}); break; }
});
const telSpans = [...document.querySelectorAll("a[href^='tel:'] span, a[href^='tel:']")].filter(e => !e.children.length && norm(e.textContent) === LK0.tel);

const DEF = Object.assign(clone(window.APP_DEF || {}), {v: 1, tx: {}, hide: {}, im: {}, lk: clone(LK0)});
const SD = window.SITE_DATA && window.SITE_DATA.v === 1 ? window.SITE_DATA : null;
let D = Object.assign(clone(DEF), SD ? clone(SD) : {});
let REV = SD ? +(SD.rev || 0) : 0;
try { const own = JSON.parse(sessionStorage.getItem(SS_OWN) || "null"); if (own && own.rev > REV) { D = Object.assign(clone(DEF), own); REV = own.rev; } } catch (e) {}
const PEND = window.PEND_PH = {};
const SRC = p => PEND[p] || (String(p).includes("/") ? p : "img/" + p + ".webp");

/* ---------- применение данных ---------- */
function applyStatic() {
  TK.forEach(t => { const v = D.tx[t.k]; const want = v && v.o === t.o ? v.v : t.o; if (norm(t.el.textContent) !== want && document.activeElement !== t.el) t.el.textContent = t.pre + want + t.post; });
  HK.forEach(h => { const v = D.hide[h.k]; h.el.classList.toggle("m-hidden", !!(v && v.o === h.o)); });
  IK.forEach(i => { const v = D.im[i.k]; const want = v && v.o === i.o ? SRC(v.v) : i.o; if (i.el.getAttribute("src") !== want) i.el.setAttribute("src", want); });
  const L = Object.assign(clone(LK0), D.lk || {});
  const telHref = "tel:+" + L.tel.replace(/\D/g, "").replace(/^8/, "7");
  LKEL.forEach(({a, k}) => { a.setAttribute("href", k === "tel" ? telHref : L[k]); if (k === "tel" && a.getAttribute("aria-label")) a.setAttribute("aria-label", "Позвонить по номеру " + L.tel); });
  telSpans.forEach(e => e.textContent = L.tel);
}
function renderAll() {
  const A = window.APP;
  if (A) { A.catalog = D.cat; A.gal = D.gal; A.types = D.types; A.render(); }
  applyStatic();
}
if (SD || REV) renderAll(); else applyStatic();

/* ---------- интерфейс мастера ---------- */
const css = document.createElement("style");
css.textContent = `
.m-hidden{display:none!important}
.ms-on .m-hidden{display:revert!important;opacity:.35;outline:2px dashed #c0245b;outline-offset:-2px}
.mbar{position:fixed;left:0;right:0;bottom:0;z-index:1000;background:#3b1450;color:#fff;display:none;gap:8px;align-items:center;padding:10px 14px;flex-wrap:wrap;box-shadow:0 -10px 30px #0004;font:500 14px 'Golos Text',sans-serif}
.ms-on .mbar{display:flex}
.ms-on body{padding-bottom:120px}
.mbar b{font-weight:600;margin-right:auto}
.mbar button{min-height:40px;padding:0 14px;border-radius:999px;border:1px solid #ffffff55;background:transparent;color:#fff;font:inherit;cursor:pointer}
.mbar button.pri{background:#ffe36e;color:#3b1450;border-color:#ffe36e}
.ms-on [data-tk]{outline:1.5px dashed #c0245bcc;outline-offset:3px;cursor:text}
.ms-on [data-tk]:focus{outline:2px solid #ffb400;background:#fffbe8;color:#2a1030}
.ms-on img[data-ik]{outline:4px dashed #ffb400;outline-offset:-4px;cursor:pointer}
.mhide{display:none}
.ms-on .mhide{display:inline-flex;position:absolute;z-index:30;top:6px;right:6px;min-height:28px;padding:0 10px;border-radius:999px;border:0;background:#3b1450;color:#fff;font:600 12px 'Golos Text',sans-serif;cursor:pointer;align-items:center;opacity:.9}
.m-rel{position:relative}
.mdlg{border:0;border-radius:18px;padding:0;width:min(720px,calc(100% - 24px));max-height:calc(100% - 24px);color:#2a1030;font:15px 'Golos Text',sans-serif}
.mdlg::backdrop{background:#2a103080}
.me-h{padding:20px 56px 12px 22px;border-bottom:1px solid #eee}
.me-h h3{font-size:22px;margin:0}
.me-h p{font-size:14px;color:#6b5a66;margin:6px 0 0}
.me-b{padding:16px 22px;max-height:64vh;overflow:auto}
.me-f{padding:14px 22px;border-top:1px solid #eee;display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end}
.me-fl{display:grid;gap:10px;padding:4px 12px 12px}
.me-fl label span{display:block;font-size:13px;color:#6b5a66;margin-bottom:4px}
.me-fl input,.me-fl textarea,.me-fl select{width:100%;min-height:42px;padding:8px 10px;border:1px solid #d9c9d3;border-radius:10px;font:inherit;box-sizing:border-box}
.me-fl textarea{min-height:90px}
.me-row{border:1px solid #ecdfe7;border-radius:12px;margin-bottom:10px;background:#fff8fb}
.me-row.off{opacity:.5}
.me-row>summary{list-style:none;padding:10px 12px;display:flex;gap:10px;align-items:center;cursor:pointer;font-weight:600}
.me-row>summary::-webkit-details-marker{display:none}
.me-row>summary img{width:44px;height:44px;object-fit:cover;border-radius:8px}
.me-row .t{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.me-row .ops{display:flex;gap:4px}
.me-row .ops button{width:34px;height:34px;border-radius:8px;border:1px solid #d9c9d3;background:#fff;cursor:pointer}
.me-ph{display:flex;flex-wrap:wrap;gap:8px}
.me-ph figure{position:relative;margin:0}
.me-ph img{width:72px;height:72px;object-fit:cover;border-radius:8px;display:block}
.me-ph figure button{position:absolute;top:-6px;right:-6px;width:24px;height:24px;border-radius:50%;border:0;background:#c0245b;color:#fff;cursor:pointer}
.me-ph .add{width:72px;height:72px;border-radius:8px;border:2px dashed #c0245b;background:#fff;color:#c0245b;font-size:28px;cursor:pointer}
.mbtn{min-height:42px;padding:0 18px;border-radius:999px;border:0;background:#c0245b;color:#fff;font:600 15px 'Golos Text',sans-serif;cursor:pointer}
.mbtn.gh{background:#fff;color:#c0245b;border:1.5px solid #c0245b}
.mx{position:absolute;top:12px;right:12px;width:36px;height:36px;border-radius:50%;border:0;background:#f4e8ef;font-size:20px;cursor:pointer}
.merr{color:#c0245b;font-size:14px;min-height:1em}
.mtoast{position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:1100;background:#2a1030;color:#fff;padding:12px 18px;border-radius:12px;max-width:min(520px,calc(100% - 32px));font:14px 'Golos Text',sans-serif;box-shadow:0 8px 30px #0005}
.m-enter{background:none;border:0;padding:0;color:inherit;font:inherit;opacity:.75;text-decoration:underline;cursor:pointer}
`;
document.head.appendChild(css);

const bar = document.createElement("div");
bar.className = "mbar";
bar.innerHTML = `<b id="mInfo">Режим мастера</b><button type="button" data-me="cat">Каталог</button><button type="button" data-me="gal">Работы</button><button type="button" data-me="lk">Контакты</button><button type="button" data-me="more">Ещё</button><button type="button" class="pri" id="mSave">Сохранить</button><button type="button" id="mExit">Выйти</button>`;
document.body.appendChild(bar);
const dlg = document.createElement("dialog");
dlg.className = "mdlg";
dlg.innerHTML = `<button type="button" class="mx" data-close aria-label="Закрыть">×</button><div id="mB"></div>`;
document.body.appendChild(dlg);
dlg.addEventListener("click", e => { if (e.target.closest("[data-close]")) { e.preventDefault(); dlg.close(); } });
const foot = document.querySelector("footer .wrap") || document.querySelector("footer");
if (foot) { const b = document.createElement("button"); b.type = "button"; b.className = "m-enter"; b.id = "mEnter"; b.textContent = "Вход для мастера"; const d = document.createElement("div"); d.style.marginTop = "12px"; d.appendChild(b); foot.appendChild(d); }
HK.forEach(h => { if (getComputedStyle(h.el).position === "static") h.el.classList.add("m-rel"); const b = document.createElement("button"); b.type = "button"; b.className = "mhide"; b.dataset.mh = h.k; h.el.appendChild(b); });
function hideLabels() { document.querySelectorAll("[data-mh]").forEach(b => { const v = D.hide[b.dataset.mh]; b.textContent = v ? "Показать" : "Скрыть"; }); }

let M = null, dirty = 0;
const toast = (t, ms) => { const d = document.createElement("div"); d.className = "mtoast"; d.textContent = t; document.body.appendChild(d); setTimeout(() => d.remove(), ms || 3500); };
async function api(body) {
  const r = await fetch(MASTER_URL, {method: "POST", headers: {"Content-Type": "text/plain;charset=utf-8"}, body: JSON.stringify(body), signal: AbortSignal.timeout(90000)});
  return r.json();
}
function setDirty() { dirty++; $("mInfo").textContent = "Есть несохранённые правки"; hideLabels(); try { localStorage.setItem(LS_D, JSON.stringify({base: REV, d: D, pend: PEND})); } catch (e) {} }
function openDlg() { if (!dlg.open) dlg.showModal(); dlg.scrollTop = 0; }
function enter(t) {
  M = t; try { localStorage.setItem(LS_T, JSON.stringify(t)); } catch (e) {}
  try { const dr = JSON.parse(localStorage.getItem(LS_D) || "null"); if (dr && dr.d && window.confirm("Есть несохранённые правки с прошлого раза. Продолжить с ними?")) { D = dr.d; Object.assign(PEND, dr.pend || {}); dirty = 1; renderAll(); } } catch (e) {}
  root.classList.add("ms-on");
  TK.forEach(({el}) => { try { el.contentEditable = "plaintext-only"; } catch (x) {} if (el.contentEditable !== "plaintext-only") el.contentEditable = "true"; });
  hideLabels();
  $("mInfo").textContent = dirty ? "Есть несохранённые правки" : (t.demo ? "Режим мастера (демо, без сохранения)" : "Режим мастера");
  toast("Нажмите на любой текст с пунктиром, чтобы его изменить. Фото с жёлтой рамкой меняются по нажатию. Кнопка «Скрыть» убирает блок с сайта.", 6000);
}
function exit() {
  if (dirty && !window.confirm("Есть несохранённые правки. Выйти без сохранения?")) return;
  M = null; root.classList.remove("ms-on"); try { localStorage.removeItem(LS_T); if (dirty) localStorage.removeItem(LS_D); } catch (e) {}
  TK.forEach(({el}) => el.removeAttribute("contenteditable"));
  if (dirty) location.reload();
}
function loginDlg() {
  $("mB").innerHTML = `<div class="me-h"><h3>Вход для мастера</h3><p>Введите пароль, который вам выдали вместе с сайтом.</p></div>
    <form class="me-b me-fl" id="lgF"><label><span>Пароль</span><input type="password" name="pw" autocomplete="current-password" required></label><div class="merr" id="lgE"></div><button class="mbtn" type="submit">Войти</button></form>`;
  openDlg(); setTimeout(() => $("lgF").pw.focus(), 50);
  $("lgF").onsubmit = async e => {
    e.preventDefault(); const b = e.target.querySelector("button");
    if (!MASTER_URL) { dlg.close(); enter({token: "demo", exp: Date.now() + 864e5, demo: true}); return; }
    b.disabled = true; b.textContent = "Проверяем...";
    try { const r = await api({a: "login", pw: e.target.pw.value}); if (r.ok) { dlg.close(); enter({token: r.token, exp: r.exp}); } else $("lgE").textContent = r.err === "locked" ? "Слишком много попыток. Подождите 15 минут." : "Неверный пароль"; }
    catch (x) { $("lgE").textContent = "Нет связи с сервером, попробуйте ещё раз"; }
    b.disabled = false; b.textContent = "Войти";
  };
}
if ($("mEnter")) $("mEnter").onclick = () => M ? toast("Вы уже в режиме мастера") : loginDlg();
if (location.hash === "#vhod") setTimeout(() => { if (!M) loginDlg(); }, 300);
try { const t = JSON.parse(localStorage.getItem(LS_T) || "null"); if (t && t.exp > Date.now()) enter(t); } catch (e) {}
$("mExit").onclick = exit;

/* тексты */
let before = "";
document.addEventListener("focusin", e => { const el = M && e.target.closest && e.target.closest("[data-tk]"); if (el) before = norm(el.textContent); });
document.addEventListener("focusout", e => {
  const el = M && e.target.closest && e.target.closest("[data-tk]"); if (!el) return;
  const v = norm(el.textContent); if (v === before) return;
  const t = TK.find(x => x.el === el);
  if (!v) { el.textContent = t.pre + before + t.post; return; }
  el.textContent = t.pre + v + t.post;
  if (v === t.o) delete D.tx[t.k]; else D.tx[t.k] = {o: t.o, v};
  setDirty();
});
document.addEventListener("keydown", e => { if (M && e.key === "Enter" && e.target.closest && e.target.closest("[data-tk]")) { e.preventDefault(); e.target.blur(); } });
document.addEventListener("click", e => {
  if (!M) return;
  if (e.target.closest(".mdlg")) return;
  const mh = e.target.closest("[data-mh]");
  if (mh) { e.preventDefault(); e.stopPropagation(); const h = HK.find(x => x.k === mh.dataset.mh); if (D.hide[h.k]) delete D.hide[h.k]; else D.hide[h.k] = {o: h.o}; applyStatic(); setDirty(); return; }
  const me = e.target.closest("[data-me]"); if (me) { e.preventDefault(); openEditor(me.dataset.me); return; }
  const tk = e.target.closest("[data-tk]"); if (tk && tk.closest("a,button,summary,label")) e.preventDefault();
  const im = e.target.closest("img[data-ik]");
  if (im) { e.preventDefault(); e.stopPropagation(); const i = IK.find(x => x.el === im); pickPhoto(p => { D.im[i.k] = {o: i.o, v: p}; applyStatic(); setDirty(); }); }
}, true);

/* фото: сжимаются в браузере, до сохранения лежат в памяти */
const rid = () => Array.from(crypto.getRandomValues(new Uint8Array(8)), b => (b % 36).toString(36)).join("");
function pickPhoto(cb, multi) {
  const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; if (multi) inp.multiple = true;
  inp.onchange = async () => { for (const f of inp.files) { try { const p = "img/u/" + rid() + ".jpg"; PEND[p] = await shrink(f, 1400); cb(p); } catch (x) { toast("Не получилось открыть фото " + f.name); } } };
  inp.click();
}
function shrink(file, max) {
  return new Promise((ok, bad) => { const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => { const k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); ok(c.toDataURL("image/jpeg", .84)); };
    img.onerror = bad; img.src = url; });
}

/* редакторы списков */
const CATS = ["Торты с ягодами", "Детские и тематические", "Пирожные и капкейки", "Наборы"];
const SCH = {
  cat: {title: "Каталог", hint: "Названия, цены, описания, вкусы и фото карточек. Первое фото стоит на карточке. Скрытые карточки не видны покупателям.",
    add: () => ({name: "Новый десерт", price: "", tag: "", description: "", flavors: [], photos: []}),
    f: [["name", "Название"], ["price", "Цена (например: от 2 800 ₽/кг)"], ["tag", "Метка на фото (Хит, Новинка), можно пусто"], ["description", "Описание", "area"], ["flavors", "Вкусы и начинки, каждый с новой строки", "lines"], ["photos", "Фото", "photos"], ["hide", "Скрыть", "check"]]},
  gal: {title: "Мои работы", hint: "Фото, подпись и раздел для фильтра. Первые 12 видны сразу, остальные по кнопке «Показать ещё».",
    add: () => ({id: "", title: "Новая работа", category: CATS[0]}),
    f: [["id", "Фото", "photo"], ["title", "Подпись"], ["category", "Раздел", "sel"]]}
};
let ED = null;
function openEditor(kind) {
  if (kind === "more") return moreDlg();
  if (kind === "lk") return lkDlg();
  ED = {kind, sc: SCH[kind], list: clone(D[kind])};
  drawEditor(); openDlg();
}
function drawEditor(openIdx) {
  const {sc, list} = ED;
  const rows = list.map((it, i) => {
    const th = ED.kind === "cat" ? (it.photos || [])[0] : ED.kind === "gal" ? it.id : null;
    const name = it.name || it.title || it.n || "(без названия)";
    const fields = sc.f.map(([k, lab, ty]) => {
      if (ty === "photos" || ty === "photo") { const ph = ty === "photos" ? (it[k] || []) : (it[k] ? [it[k]] : []); return `<div><span style="display:block;font-size:13px;color:#6b5a66;margin-bottom:4px">${lab}</span><div class="me-ph">${ph.map((p, j) => `<figure><img src="${esc(SRC(p))}" alt=""><button type="button" data-delph="${j}" data-k="${k}" aria-label="Убрать фото">×</button></figure>`).join("")}${ty === "photos" || !ph.length ? `<button type="button" class="add" data-addph="${k}" data-multi="${ty === "photos" ? 1 : ""}" aria-label="Добавить фото">+</button>` : ""}</div></div>`; }
      if (ty === "check") return `<label style="display:flex;gap:8px;align-items:center"><input type="checkbox" data-k="${k}" style="width:20px;min-height:20px" ${it[k] ? "checked" : ""}> ${lab}</label>`;
      if (ty === "area") return `<label><span>${lab}</span><textarea data-k="${k}">${esc(it[k])}</textarea></label>`;
      if (ty === "lines") return `<label><span>${lab}</span><textarea data-k="${k}" data-lines="1">${esc((it[k] || []).join("\n"))}</textarea></label>`;
      if (ty === "sel") return `<label><span>${lab}</span><select data-k="${k}">${CATS.map(c => `<option${c === it[k] ? " selected" : ""}>${esc(c)}</option>`).join("")}</select></label>`;
      return `<label><span>${lab}</span><input data-k="${k}" value="${esc(it[k])}"${ty === "num" ? ' inputmode="numeric" data-num="1"' : ""}></label>`;
    }).join("");
    return `<details class="me-row${it.hide ? " off" : ""}" data-i="${i}"${openIdx === i ? " open" : ""}><summary>${th ? `<img src="${esc(SRC(th))}" alt="">` : ""}<span class="t">${esc(name)}</span><span class="ops"><button type="button" data-mv="-1" aria-label="Выше">↑</button><button type="button" data-mv="1" aria-label="Ниже">↓</button><button type="button" data-del aria-label="Удалить">✕</button></span></summary><div class="me-fl">${fields}</div></details>`;
  }).join("");
  $("mB").innerHTML = `<div class="me-h"><h3>${sc.title}</h3><p>${sc.hint}</p></div><div class="me-b" id="edB">${rows}<button type="button" class="mbtn gh" id="edAdd">Добавить</button></div><div class="me-f"><button type="button" class="mbtn gh" data-close>Отмена</button><button type="button" class="mbtn" id="edOk">Готово</button></div>`;
  const B = $("edB");
  B.oninput = B.onchange = e => {
    const r = e.target.closest(".me-row"), k = e.target.dataset.k; if (!r || !k) return;
    const it = ED.list[+r.dataset.i], t = e.target;
    it[k] = t.type === "checkbox" ? (t.checked ? 1 : 0) : t.dataset.lines ? t.value.split("\n").map(s => s.trim()).filter(Boolean) : t.dataset.num ? (+t.value.replace(/\s/g, "") || 0) : t.value;
    if (k === "hide") r.classList.toggle("off", !!it.hide);
  };
  B.onclick = e => {
    const r = e.target.closest(".me-row"), i = r ? +r.dataset.i : -1, L = ED.list;
    if (e.target.closest("[data-mv]")) { e.preventDefault(); const j = i + +e.target.closest("[data-mv]").dataset.mv; if (j >= 0 && j < L.length) { [L[i], L[j]] = [L[j], L[i]]; drawEditor(); } }
    else if (e.target.closest("[data-del]")) { e.preventDefault(); if (window.confirm("Удалить «" + (L[i].name || L[i].title || L[i].n || "") + "»?")) { L.splice(i, 1); drawEditor(); } }
    else if (e.target.closest("[data-delph]")) { const b = e.target.closest("[data-delph]"), k = b.dataset.k; if (Array.isArray(L[i][k])) L[i][k].splice(+b.dataset.delph, 1); else L[i][k] = ""; drawEditor(i); }
    else if (e.target.closest("[data-addph]")) { const b = e.target.closest("[data-addph]"), k = b.dataset.addph; pickPhoto(p => { if (b.dataset.multi) (L[i][k] = L[i][k] || []).push(p); else L[i][k] = p; drawEditor(i); }, !!b.dataset.multi); }
  };
  $("edAdd").onclick = () => { ED.list.push(ED.sc.add()); drawEditor(ED.list.length - 1); };
  $("edOk").onclick = () => {
    let L = ED.list;
    if (ED.kind === "gal") L = L.filter(x => x.id);
    D[ED.kind] = L; setDirty(); renderAll(); dlg.close();
  };
}
function lkDlg() {
  const L = Object.assign(clone(LK0), D.lk || {});
  const F = [["tel", "Телефон"], ["wa", "Ссылка WhatsApp (https://wa.me/7...)"], ["max", "Личный MAX"], ["maxch", "Канал в MAX"], ["vkpersonal", "Личная страница для сообщений ВК"], ["vk", "Сообщество ВКонтакте"], ["vkm", "Ссылка «Написать в ВК»"]];
  $("mB").innerHTML = `<div class="me-h"><h3>Контакты</h3><p>Меняются сразу во всех кнопках сайта. Адрес и другие тексты правятся прямо на странице.</p></div><div class="me-b me-fl" id="fdB">${F.map(([k, lab]) => `<label><span>${lab}</span><input data-k="${k}" value="${esc(L[k])}"></label>`).join("")}</div><div class="me-f"><button type="button" class="mbtn gh" data-close>Отмена</button><button type="button" class="mbtn" id="fdOk">Готово</button></div>`;
  openDlg();
  $("fdOk").onclick = () => { const o = {}; $("fdB").querySelectorAll("[data-k]").forEach(i => o[i.dataset.k] = i.value.trim() || LK0[i.dataset.k]); D.lk = o; setDirty(); applyStatic(); dlg.close(); };
}
function moreDlg() {
  $("mB").innerHTML = `<div class="me-h"><h3>Подсказки</h3><p>Тексты меняются прямо на странице: нажмите на текст с пунктирной рамкой, исправьте и нажмите Enter. Фото с жёлтой рамкой меняются по нажатию. Кнопка «Скрыть» в углу блока убирает его с сайта, «Показать» возвращает. После правок нажмите «Сохранить».</p></div><div class="me-b" style="display:grid;gap:10px"><button class="mbtn gh" id="mReset">Вернуть всё как было при запуске сайта</button></div>`;
  openDlg();
  $("mReset").onclick = () => { if (!window.confirm("Вернуть все тексты, фото и списки к исходным? На сайт попадёт после «Сохранить».")) return; D = clone(DEF); setDirty(); renderAll(); dlg.close(); };
}
$("mSave").onclick = async () => {
  if (!M) return;
  if (M.demo) { toast("Демо-режим: правки видны только на этом устройстве."); return; }
  if (M.exp < Date.now()) { toast("Вход устарел, войдите снова"); M = null; root.classList.remove("ms-on"); loginDlg(); return; }
  const used = new Set(JSON.stringify(D).match(/img\/u\/[a-z0-9]+\.jpg/g) || []);
  const files = Object.keys(PEND).filter(p => used.has(p)).map(p => ({path: p, b64: PEND[p].split(",")[1]}));
  const b = $("mSave"); b.disabled = true; b.textContent = "Сохраняем...";
  const send = force => api({a: "save", token: M.token, base: REV, force: !!force, data: Object.assign({}, D, {v: 1}), files});
  try {
    let r = await send(false);
    if (!r.ok && r.err === "conflict" && window.confirm("Сайт уже меняли с другого устройства. Сохранить ваши правки поверх?")) r = await send(true);
    if (r.ok) {
      REV = r.rev; D.rev = r.rev; dirty = 0;
      try { sessionStorage.setItem(SS_OWN, JSON.stringify(D)); localStorage.removeItem(LS_D); } catch (e) {}
      $("mInfo").textContent = "Сохранено"; toast("Сохранено. На сайте появится в течение 1-2 минут.", 5000);
    } else toast(r.err === "auth" ? "Вход устарел, войдите снова" : r.err === "too_big" ? "Слишком много фото за раз, сохраните частями" : "Не сохранилось: " + (r.err || "ошибка"), 6000);
  } catch (x) { toast("Нет связи с сервером, правки остались на этом устройстве. Попробуйте ещё раз.", 6000); }
  b.disabled = false; b.textContent = "Сохранить";
};
})();
