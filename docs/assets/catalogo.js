(function () {
  var D = window.CATALOGO;
  var $ = function (id) { return document.getElementById(id); };
  var norm = function (s) { return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); };
  var src = function (n) { return "p/" + (n < 10 ? "0" : "") + n + ".jpg"; };

  var porPagina = {}, porSlug = {};
  D.hoteles.forEach(function (h) {
    porSlug[h.slug] = h;
    h.paginas.forEach(function (p) { porPagina[p] = h; });
  });

  var pagina = 1, sel = null;
  var img = $("img"), info = $("info"), esta = $("esta-pagina"), visor = $("visor");

  /* ---------- Lista de hoteles por país con buscador ---------- */
  var botones = [];
  var grupos = [];
  var lista = $("lista");
  var paises = [];
  D.hoteles.forEach(function (h) { if (paises.indexOf(h.pais) < 0) paises.push(h.pais); });
  paises.forEach(function (pais) {
    var det = document.createElement("details");
    det.className = "pais";
    var hs = D.hoteles.filter(function (h) { return h.pais === pais; });
    det.innerHTML = '<summary>' + pais + '<span class="n">' + hs.length + '</span></summary><div class="hoteles"></div>';
    var cont = det.querySelector(".hoteles");
    hs.forEach(function (h) {
      var b = document.createElement("button");
      b.type = "button"; b.textContent = h.nombre; b.setAttribute("data-slug", h.slug);
      b.setAttribute("data-n", norm(h.nombre + " " + h.pais));
      b.addEventListener("click", function () { seleccionar(h, true); });
      cont.appendChild(b); botones.push(b);
    });
    lista.appendChild(det); grupos.push(det);
  });

  $("q").addEventListener("input", function () {
    var t = norm(this.value).split(/\s+/).filter(Boolean);
    var hay = false;
    grupos.forEach(function (g) {
      var visibles = 0;
      g.querySelectorAll("button").forEach(function (b) {
        var ok = t.every(function (x) { return b.getAttribute("data-n").indexOf(x) >= 0; });
        b.hidden = !ok; if (ok) visibles++;
      });
      g.hidden = visibles === 0;
      g.open = t.length > 0 && visibles > 0;
      if (visibles) hay = true;
    });
    $("sin-resultados").hidden = hay || t.length === 0;
  });

  /* ---------- Visor del catálogo ---------- */
  function ir(n) {
    n = Math.max(1, Math.min(D.paginas, n));
    pagina = n;
    img.src = src(n);
    $("visor-img").src = src(n);
    var h = porPagina[n];
    img.alt = "Página " + n + " del catálogo GHL Hoteles 2026" + (h ? ", " + h.nombre : "");
    info.textContent = "Página " + n + " de " + D.paginas;
    $("anterior").disabled = n === 1;
    $("siguiente").disabled = n === D.paginas;
    if (h && h !== sel) {
      esta.hidden = false;
      esta.innerHTML = "Esta página es de <strong></strong>. <button type=\"button\">Es mi hotel</button>";
      esta.querySelector("strong").textContent = h.nombre;
      esta.querySelector("button").addEventListener("click", function () { seleccionar(h, false); });
    } else esta.hidden = true;
    [n - 1, n + 1].forEach(function (m) { if (m >= 1 && m <= D.paginas) (new Image()).src = src(m); });
  }
  $("anterior").addEventListener("click", function () { ir(pagina - 1); });
  $("siguiente").addEventListener("click", function () { ir(pagina + 1); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") visor.hidden = true;
    var t = e.target && e.target.tagName;
    if (t === "INPUT" || t === "TEXTAREA") return;
    if (e.key === "ArrowLeft") ir(pagina - 1);
    if (e.key === "ArrowRight") ir(pagina + 1);
  });
  $("ampliar").addEventListener("click", function () { visor.hidden = false; visor.scrollTop = 0; });
  visor.addEventListener("click", function () { visor.hidden = true; });

  /* ---------- Hotel elegido y formulario ---------- */
  function formUrl(h, incrustado) {
    var u = D.formUrl + (incrustado ? "&embed=true" : "");
    if (D.prefill) u += "&" + D.prefill + "=" + encodeURIComponent(h.nombre);
    return u;
  }

  function seleccionar(h, desplazar) {
    sel = h;
    botones.forEach(function (b) { b.classList.toggle("sel", b.getAttribute("data-slug") === h.slug); });
    $("sin-hotel").hidden = true;
    $("con-hotel").hidden = false;
    var aviso = $("aviso");
    aviso.innerHTML = "Hotel seleccionado: <strong></strong>.";
    aviso.querySelector("strong").textContent = h.nombre;
    if (!D.prefill) {
      var p = document.createElement("span");
      p.innerHTML = " En la pregunta «Nombre completo del hotel» escriba ese mismo nombre. <button type=\"button\" class=\"copiar\">Copiar nombre</button>";
      aviso.appendChild(p);
      p.querySelector("button").addEventListener("click", function () {
        var b = this;
        var listo = function () { b.textContent = "Copiado"; setTimeout(function () { b.textContent = "Copiar nombre"; }, 2000); };
        if (navigator.clipboard) navigator.clipboard.writeText(h.nombre).then(listo, function () {});
      });
    }
    $("form").src = formUrl(h, true);
    $("form-link").href = formUrl(h, false);
    ir(h.paginas[0]);
    try { history.replaceState(null, "", "#" + h.slug); } catch (e) {}
    if (desplazar) $("trabajo").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---------- Arranque ---------- */
  var desdeHash = function () { return porSlug[decodeURIComponent(location.hash.slice(1))]; };
  var h0 = desdeHash();
  if (h0) seleccionar(h0, false); else ir(1);
  window.addEventListener("hashchange", function () {  // enlace con otro hotel pegado en una pestaña ya abierta
    var h = desdeHash();
    if (h && h !== sel) seleccionar(h, false);
  });
})();
