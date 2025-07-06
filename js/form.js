//------ VALIDACION FORMULARIO -----//

var mostrarresp = true;
var nomOK = false;
var telOK = false;
var mailOK = false;
var msgOK = false;

var expRegNumeroEnteroPositivo = /^[0-9]*$/;
var expRegTxtNombre = /^[A-Z~-ÿ]{1}[~-ÿ\s\w\.\'-]{1,}$/i;
var expRegTxtEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/;

function estiloCORRECTO(inputElement) {
  inputElement.style.backgroundColor = '#BDF886';
}
function estiloINCORRECTO(inputElement) {
  inputElement.style.backgroundColor = "#BB3434";
}

function validarNombre() {
  var objetoNombre = document.getElementById("name");
  if ((expRegTxtNombre.test(objetoNombre.value)) == true) {
    nomOK = true;
    estiloCORRECTO(objetoNombre);
  }
  else {
    nomOK = false;
    estiloINCORRECTO(objetoNombre);
  }
}

function validarTelefono() {
  var objetoTelefono = document.getElementById("tel");
  if ((objetoTelefono.value != '') && 
  (objetoTelefono.value.length >= 7) && 
  expRegNumeroEnteroPositivo.test(objetoTelefono.value)) {
    telOK = true;
    estiloCORRECTO(objetoTelefono);
  }
  else {
    telOK = false;
    estiloINCORRECTO(objetoTelefono);
  }
}

function validarEmail() {
  var objetoEmail = document.getElementById("email");
  var email = objetoEmail.value.toLowerCase();
  email = comprobarAtEmail(email);
  if ((expRegTxtEmail.test(email)) == true) {
    mailOK = true;
    objetoEmail.value = email;
    estiloCORRECTO(objetoEmail);
  }
  else {
    mailOK = false;
    estiloINCORRECTO(objetoEmail);
  }
}        //---- final function validarEmail

// -- convierte texto con caracteristicas del sistema AT&T
function comprobarAtEmail(email) {
  var expresion = /\sat\s/g;
  return email.replace(expresion, '@');
}

function validarMensaje() {
  var objetoMensaje = document.contactf.mensaje;
  if ((objetoMensaje.value != '') &&
    (objetoMensaje.value.length <= 1000)) {
    msgOK = true;
    estiloCORRECTO(objetoMensaje);
  }
  else {
    msgOK = false;
    estiloINCORRECTO(objetoMensaje);
  }
}         //---- final function validarMensaje

function validarDatos() {
  var msgAlerta;

  validarNombre();
  validarTelefono();
  validarEmail();
  validarMensaje();

  if (nomOK && telOK && mailOK && msgOK) {
    msgAlerta = "Los datos ingresados han sido validados y están todos correctos. \nSu formulario ya podrá ser procesado....\n";
    if (mostrarresp) alert(msgAlerta);
    return true;
  } else {
    msgAlerta = "algunos campos no han sido diligenciados correctamente, vuelva a intentarlo";

    if (mostrarresp) alert(msgAlerta);
    return false;
  }
}