(function () {
  var cfg = window.FORM_CONFIG, hotel = window.HOTEL;
  var form = document.getElementById("revision");
  var progreso = document.getElementById("progreso");
  var errorGeneral = document.getElementById("error-general");
  var enviar = document.getElementById("enviar");
  var bloques = Array.prototype.slice.call(form.querySelectorAll(".bloque"));
  var CLAVE = "revision_" + hotel.codigo;

  function guardar() {
    try {
      var d = {};
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name) return;
        if (el.type === "radio") { if (el.checked) d[el.name] = el.value; }
        else d[el.name] = el.value;
      });
      localStorage.setItem(CLAVE, JSON.stringify(d));
    } catch (e) {}
  }

  function restaurar() {
    try {
      var d = JSON.parse(localStorage.getItem(CLAVE) || "null");
      if (!d) return;
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name || !(el.name in d)) return;
        if (el.type === "radio") el.checked = el.value === d[el.name];
        else el.value = d[el.name];
      });
    } catch (e) {}
  }

  function estado(b) {
    var r = b.querySelector("input[type=radio]:checked");
    return r ? r.value : "";
  }

  function refrescar() {
    var hechos = 0;
    bloques.forEach(function (b) {
      var e = estado(b);
      var det = b.querySelector(".detalle");
      det.hidden = e !== "Requiere cambio";
      var listo = e === "Correcto" || (e === "Requiere cambio" && b.querySelector("textarea").value.trim() !== "");
      b.classList.toggle("listo", listo);
      if (listo) { hechos++; b.classList.remove("invalido"); b.querySelector(".error").hidden = true; }
    });
    progreso.textContent = hechos + " de " + bloques.length + " revisados";
  }

  function marcar(campo, msg) {
    campo.classList.add("invalido");
    var er = campo.querySelector(".error");
    if (er) { er.textContent = msg; er.hidden = false; }
  }

  function validar() {
    var primero = null, ok = true;
    form.querySelectorAll(".campo").forEach(function (c) { c.classList.remove("invalido"); });
    ["nombre", "correo"].forEach(function (n) {
      var el = form.elements[n], campo = el.closest(".campo");
      var valido = el.value.trim() !== "" && (n !== "correo" || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value.trim()));
      if (!valido) { campo.classList.add("invalido"); ok = false; primero = primero || el; }
    });
    bloques.forEach(function (b) {
      var e = estado(b);
      var msg = "";
      if (!e) msg = "Seleccione una opción.";
      else if (e === "Requiere cambio" && b.querySelector("textarea").value.trim() === "") msg = "Indique qué debe cambiar.";
      if (msg) { b.classList.add("invalido"); marcar(b, msg); ok = false; primero = primero || b.querySelector(e ? "textarea" : "input"); }
    });
    if (!ok) {
      errorGeneral.textContent = "Faltan datos por completar. Revise los campos marcados.";
      errorGeneral.hidden = false;
      if (primero) { primero.scrollIntoView({ behavior: "smooth", block: "center" }); primero.focus({ preventScroll: true }); }
    } else errorGeneral.hidden = true;
    return ok;
  }

  function payload() {
    var f = cfg.fields, p = new URLSearchParams();
    function poner(k, v) { if (f[k]) p.append(f[k], v); }
    poner("hotel", hotel.nombre);
    poner("nombre", form.elements.nombre.value.trim());
    poner("correo", form.elements.correo.value.trim());
    poner("comentarios", form.elements.comentarios.value.trim());
    bloques.forEach(function (b) {
      var k = b.getAttribute("data-key");
      poner(k + "_estado", estado(b));
      poner(k + "_cambio", estado(b) === "Requiere cambio" ? b.querySelector("textarea").value.trim() : "");
    });
    return p;
  }

  form.addEventListener("input", function () { refrescar(); guardar(); });
  form.addEventListener("change", function () { refrescar(); guardar(); });

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (!validar()) return;
    enviar.disabled = true;
    enviar.textContent = "Enviando…";
    var prueba = !cfg.url;
    var envio = prueba ? Promise.resolve() : fetch(cfg.url, { method: "POST", mode: "no-cors", body: payload() });
    if (prueba) console.log("Modo prueba. Esto se habría enviado:", payload().toString());
    envio.then(function () {
      try { localStorage.removeItem(CLAVE); } catch (e) {}
      form.hidden = true;
      document.getElementById("aviso-prueba").hidden = !prueba;
      document.getElementById("gracias").hidden = false;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }).catch(function () {
      enviar.disabled = false;
      enviar.textContent = "Enviar revisión";
      errorGeneral.textContent = "No pudimos enviar su revisión. Revise su conexión e inténtelo de nuevo.";
      errorGeneral.hidden = false;
    });
  });

  var visor = document.getElementById("visor");
  document.getElementById("ampliar").addEventListener("click", function () { visor.hidden = false; visor.scrollTop = 0; });
  visor.addEventListener("click", function () { visor.hidden = true; });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") visor.hidden = true; });

  restaurar();
  refrescar();
})();
