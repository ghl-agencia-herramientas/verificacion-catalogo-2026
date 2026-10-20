// Conexión con el Google Form que recibe las respuestas.
// Mientras `url` esté vacío, el formulario funciona en modo prueba y no envía nada.
// url:    https://docs.google.com/forms/d/e/<ID_DEL_FORMULARIO>/formResponse
// fields: ID "entry.NNNN" de cada pregunta del formulario.
window.FORM_CONFIG = {
  url: "",
  fields: {
    hotel: "",
    nombre: "",
    correo: "",
    comentarios: "",
    descripcion_estado: "", descripcion_cambio: "",
    habitaciones_estado: "", habitaciones_cambio: "",
    salones_estado: "", salones_cambio: "",
    servicios_estado: "", servicios_cambio: "",
    contacto_estado: "", contacto_cambio: "",
    rnt_estado: "", rnt_cambio: ""
  }
};
