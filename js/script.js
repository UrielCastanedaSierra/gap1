    function obtenerValorCSSVariable(nombreVarCSS) {
      const nombre = nombreVarCSS.trim().toLowerCase();
      if (nombre.startsWith('#') || nombre.startsWith('rgb') || /^[a-z]+$/.test(nombre)) {
        return nombreVarCSS;
      }
      const varName = nombre.startsWith('--') ? nombre : `--${nombre}`;
      return getComputedStyle(document.documentElement).getPropertyValue(varName)?.trim();
    }

    function aplicarOpacidad(color, opacidad) {
      try {
        color = color.trim().toLowerCase();
        if (color.startsWith('rgba')) {
          return color.replace(/rgba?\(([^)]+)\)/, (match, values) => {
            const [r, g, b] = values.split(',').map(v => parseFloat(v));
            return `rgba(${r},${g},${b},${opacidad})`;
          });
        }
        if (color.startsWith('rgb')) {
          const [r, g, b] = color.match(/\d+/g).map(Number);
          return `rgba(${r},${g},${b},${opacidad})`;
        }
        if (color.startsWith('#')) {
          const hex = color.slice(1);
          let r = 0, g = 0, b = 0;
          if (hex.length === 3) {
            r = parseInt(hex[0] + hex[0], 16);
            g = parseInt(hex[1] + hex[1], 16);
            b = parseInt(hex[2] + hex[2], 16);
          } else if (hex.length === 6) {
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
          } else {
            throw new Error('Formato hex no válido');
          }
          return `rgba(${r},${g},${b},${opacidad})`;
        }
        const ctx = document.createElement('canvas').getContext('2d');
        ctx.fillStyle = color;
        return aplicarOpacidad(ctx.fillStyle, opacidad);
      } catch {
        return color;
      }
    }

    function textoContraste(bgColor, claro = '#ffffff', oscuro = '#000000') {
      try {
        const ctx = document.createElement('canvas').getContext('2d');
        ctx.fillStyle = bgColor;
        const [r, g, b] = ctx.fillStyle.match(/\d+/g).map(Number);
        const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

       // alert('bg='+[bgColor] + '  r='+r + '  g='+g + '  b='+b + ' luminancia='+luminancia + ' Texto=' + (luminancia > 0.6 ? 'oscuro' : 'claro'))
        return luminancia > 0.6 ? oscuro : claro;
      } catch {
        return oscuro;
      }
    }

/// ======= Clase:  Carrusel    ===================


class Carrusel {
  constructor({
    id_Item, nombre, descripCarrusel, tituloFotos, fotos, descripciones,
    anchoCarrusel = '840px',
    anchoDescripcion = '100%',
    anchoImagen = '100%',
    tiempo = 8000,
    rutaFotos = '',
    links = '', 
    accionClick = '', 
    mostrarMiniaturas = "si",
    mostrarNumeracion = "no",
    espacioSeparadorIdentificadores = 0,
    mostrarTituloFoto = "si",
    mostrarFlechasRotacion = "si",
    mostrarBorde = "si",
    colorBorde = "var(--carrusel_txt_titulo)",
    mostrarSombra = "si",
    pausarCambioAutomático = "no",
    mostrarTituloCentralFoto = "no",
    colorBgTituloCentralFoto = "",
    colorTextoClaroTituloCentralFoto = "#ffffff",
    colorTextoOscuroTituloCentralFoto = "#000000",
    opacidadTituloCentralFoto = 1
  }) {

    this.id = id_Item;
    this.nombre = nombre;
    this.anchoCarrusel = anchoCarrusel,
    this.anchoDescripcion = anchoDescripcion,
    this.anchoImagen = anchoImagen,
    this.descripcionCarrusel = descripCarrusel;
    this.tituloFotos = tituloFotos.split(',').map(t => t.trim());
    this.fotos = fotos.split(',').map(f => f.trim());
    this.descripciones = descripciones.split(',').map(d => d.trim());
    // Separar y limpiar los vectores
    this.tituloFotos = this.limpiarLista(tituloFotos);
    this.fotos = this.limpiarLista(fotos);
    this.descripciones = this.limpiarLista(descripciones);
    this.links = this.limpiarLista(links);
    this.accionClick = accionClick;

    this.index = 0;
    this.tiempo = tiempo;
    this.timer = null;

    this.rutaFotos = rutaFotos;
    this.mostrarMiniaturas = mostrarMiniaturas;
    this.mostrarNumeracion = mostrarNumeracion;
    this.espacioSeparadorIdentificadores = espacioSeparadorIdentificadores;
    this.mostrarTituloFoto = mostrarTituloFoto;

    // Empareja el tamaño de las diferentes listas de valores de etributos
    this.normalizarListas();

    this.mostrarFlechasRotacion = mostrarFlechasRotacion;
    this.mostrarBorde = mostrarBorde;
    this.colorBorde = obtenerValorCSSVariable(colorBorde) || colorBorde;
    this.mostrarSombra = mostrarSombra;
    this.pausarCambioAutomático = pausarCambioAutomático;
    this.mostrarTituloCentralFoto = mostrarTituloCentralFoto;

    // --- limpiamos de espacios los listados recibidos como parámetros 
    this.tituloFotos = this.limpiarLista(tituloFotos);
    this.fotos = this.limpiarLista(fotos);
    this.descripciones = this.limpiarLista(descripciones);
    this.links = this.limpiarLista(links);
    this.colorBgTituloCentralFoto = this.limpiarLista(colorBgTituloCentralFoto);

    // ---- emparejamos la cantidad de elementos de los listados. 
    //    Todos deben tener la misma cantidad de elementos, excepto 
    //    el Color de fondo del ttítulo central de cada foto
    this.normalizarListas();       

    // ---- rescatamos el valor del color predefinido en el css --root
    //    transformaos el valor del color a formato rgb y lo incorporamos
    //    dentro del listado  reemplazando el nombre por el valor real del color
    this.colorArray = (colorBgTituloCentralFoto || "")
      .split(',')
      .map(c => obtenerValorCSSVariable(c.trim()))
      .filter(Boolean);
    this.colorTextoClaroTituloCentralFoto = obtenerValorCSSVariable(colorTextoClaroTituloCentralFoto);
    this.colorTextoOscuroTituloCentralFoto = obtenerValorCSSVariable(colorTextoOscuroTituloCentralFoto);

    this.opacidadTituloCentralFoto = parseFloat(opacidadTituloCentralFoto) || 1;

    this.render(id_Item);
  }


limpiarLista(cadena) {
    return cadena.split(',').map(e => e.trim());
}  

// --- emparejamos  los tres vectores con la misma cantidad de elementos
//    Obtener el tamaño máximo entre todos los listados que se deben emparejar
//    luego se completan los datos faltantes con el valor definido por defecto.
normalizarListas() {
    
    const max = Math.max(this.tituloFotos.length, this.fotos.length, this.descripciones.length, this.links.length);
    while (this.tituloFotos.length < max) this.tituloFotos.push("dato pendiente");
     while (this.fotos.length < max) this.fotos.push("imagen_no_disponible.jpg");
    while (this.descripciones.length < max) this.descripciones.push("dato pendiente");    
    while (this.links.length < max) this.links.push("");
    this.totalItems = max;
  }

  
  render(contenedorId)   {

    const contenedor = document.createElement('div');
    const wrapper = document.getElementById(contenedorId);

    contenedor.className = 'carrusel-container';
    contenedor.style.border = this.mostrarBorde === "si" ? `4px solid ${this.colorBorde}` : 'none';
    contenedor.style.boxShadow = this.mostrarSombra === "si" ? "0 0 10px rgba(0, 0, 0, 0.4)" : "none";
    contenedor.style.maxWidth = this.anchoCarrusel;

    const tituloHtml = `<div class="carrusel-titulo">${this.nombre}</div>`;
    const descripcionHtml = `<div class="carrusel-descripcion" style="width:${this.anchoDescripcion};">${this.descripcionCarrusel}</div>`;
    
    wrapper.insertAdjacentHTML('beforeend', tituloHtml + descripcionHtml);

    //    alert(contenedor.style.maxWidth + "\n" + tituloHtml + descripcionHtml);
    //    revisar por qué no está tomando el ancho del contenedor, se entiende que pertenece al contenedor 'carrusel-container'

    const colorBase = this.colorArray[this.index % this.colorArray.length] || 'var(--carrusel_txt_bg_titulo_central_foto)';
    const colorFondo = aplicarOpacidad(colorBase, this.opacidadTituloCentralFoto);
    const colorTexto = textoContraste(colorFondo, this.colorTextoClaroTituloCentralFoto, this.colorTextoOscuroTituloCentralFoto);


    const imgSrc = `${this.rutaFotos}/${this.fotos[0]}`;


    contenedor.innerHTML = `
      <div class="carrusel-imagen" style="width:${this.anchoImagen};">
        ${this.mostrarFlechasRotacion === "si" ? `<span class="flecha izq">&#10094;</span>` : ""}
        <img id="img-${this.id}" src="${imgSrc}" alt="imagen">
        ${this.mostrarFlechasRotacion === "si" ? `<span class="flecha der">&#10095;</span>` : ""}
        ${this.mostrarTituloCentralFoto === "si" ? `<div class="titulo-central" style="background:${colorFondo}; color:${colorTexto}">${this.tituloFotos[0]}</div>` : ""}
      </div>
      <div class="info-identificadores" style="margin-top: ${this.espacioSeparadorIdentificadores}px;">
        ${this.mostrarTituloFoto === "si" ? `<div class="titulo-foto">${this.tituloFotos[0]}</div>` : ""}
        ${this.mostrarNumeracion === "si" ? `<div class="contador-numero">1 / ${this.fotos.length}</div>` : ""}
      </div>
      <div class="descripcion-foto">${this.descripciones[0]}</div>
      ${this.mostrarMiniaturas === "si"
        ? `<div class="miniaturas">
            ${this.fotos.map((f, i) => `<img src="${this.rutaFotos}/${f}" data-index="${i}" alt="miniatura">`).join('')}
          </div>` : ""}
    `;

    this.img = contenedor.querySelector('.carrusel-imagen img');

    const contenedorImagen = contenedor.querySelector('.carrusel-imagen');

if ((this.pausarCambioAutomático || "").trim().toLowerCase() === "si") {
  contenedorImagen.addEventListener('mouseenter', () => {
    this.detenerAutoSlide();
  });

  contenedorImagen.addEventListener('mouseleave', () => {
    this.iniciarAutoSlide();
  });
}

    wrapper.appendChild(contenedor);

    this.titulo = contenedor.querySelector('.titulo-foto');
    this.descripcion = contenedor.querySelector('.descripcion-foto');
    this.contador = contenedor.querySelector('.contador-numero');
    this.central = contenedor.querySelector('.titulo-central');
    this.miniaturas = contenedor.querySelectorAll('.miniaturas img');

    const flechaIzq = contenedor.querySelector('.flecha.izq');
    const flechaDer = contenedor.querySelector('.flecha.der');
    if (flechaIzq) flechaIzq.onclick = () => this.cambiar(-1);
    if (flechaDer) flechaDer.onclick = () => this.cambiar(1);

    this.miniaturas.forEach((img, i) => {
      img.addEventListener('click', e => {
        this.index = parseInt(e.target.dataset.index);
        this.actualizar();
      });
      img.onerror = () => {
        if (!img.dataset.error) {
          img.dataset.error = "true";
          img.src = './img/imagen_no_disponible.png';
        }
      };
    });


    this.img.addEventListener('click', () => this.abrirModal());

    this.img.onerror = () => {
      if (!this.img.dataset.error) {
        this.img.dataset.error = "true";
        this.img.src = './img/imagen_no_disponible.png';
        if (this.descripcion) this.descripcion.textContent = 'Imagen no disponible';
        if (this.titulo) this.titulo.textContent = 'Sin título';
        if (this.central) this.central.textContent = 'Sin título';
      }
    };
    
    this.iniciarAutoSlide()
  }

  cambiar(delta) {
    this.index = (this.index + delta + this.fotos.length) % this.fotos.length;
    this.actualizar();
  }

  actualizar() {
    const ruta = `${this.rutaFotos}/${this.fotos[this.index]}`;
    this.img.dataset.error = "";
    this.img.src = ruta;

    this.img.onerror = () => {
      if (!this.img.dataset.error) {
        this.img.dataset.error = "true";
        this.img.src = './img/imagen_no_disponible.png';
        if (this.descripcion) this.descripcion.textContent = 'Imagen no disponible';
        if (this.titulo) this.titulo.textContent = 'Sin título';
        if (this.central) this.central.textContent = 'Sin título';
      }
    };

    const nuevoTitulo = this.tituloFotos[this.index];
    if (this.titulo) this.titulo.textContent = nuevoTitulo;
    if (this.descripcion) this.descripcion.textContent = this.descripciones[this.index];
    if (this.contador) this.contador.textContent = `${this.index + 1} / ${this.fotos.length}`;

    if (this.central) {
      const colorBase = this.colorArray[this.index % this.colorArray.length] || 'var(--carrusel_txt_bg_titulo_central_foto)';
      const colorFondo = aplicarOpacidad(colorBase, this.opacidadTituloCentralFoto);
      const colorTexto = textoContraste(colorFondo, this.colorTextoClaroTituloCentralFoto, this.colorTextoOscuroTituloCentralFoto);
      this.central.textContent = nuevoTitulo;
      this.central.style.background = colorFondo;
      this.central.style.color = colorTexto;
    }

    this.miniaturas.forEach((img, i) => img.classList.toggle('active', i === this.index));
  }


autoSlide() {
  if ((this.pausarCambioAutomático || "").trim().toLowerCase() !== "si") {
    this.iniciarAutoSlide();
  }
}

  iniciarAutoSlide() {
  if (this.timer === null && this.fotos.length > 1) {
    this.timer = setInterval(() => {
      this.cambiar(1);
  }, this.tiempo );
  }
}

detenerAutoSlide() {
  if (this.timer) {
    clearInterval(this.timer);
    this.timer = null;
  }
}


  abrirModal() {

    if ((this.accionClick || "").trim().toLowerCase() === "foto") {
        // -- Muestra la foto ampliada en la misma ventana
        const modal = document.getElementById('modal');
        const modalImg = document.getElementById('modal-img');
        modal.style.display = 'flex';
        modalImg.src = this.img.src;
        document.body.style.overflow = 'hidden';

        modal.onclick = () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };
  }  else if ((this.accionClick || "").trim().toLowerCase() === "link") { 
        // --  en caso que se haya registrado "link" como acción del click, se abre la url suministrada
        window.location.href = this.links[this.index]; 
    } 
    // -- en caso que no sea "link"  ni "foto",   el click sobre la imagen no se tiene en cuenta

  }
}



//  ---------------------------------------------- Ejemplo de uso:
// new Carrusel1(configuracionObjeto, intervaloMilisegundos, contenedorDOM);





//======   Funciones paara tratamiento de componentes dinámicos

//---  tratamiendo de fotografías a 45°,  actualización giro
function ajustarRotacion() {
    const contenedor = document.getElementById('bloque-valores');
    const imagen = document.getElementById('quienes-somos-imagen');
    const anchoContenedor = contenedor.offsetWidth;
    
    // Cuando el ancho total sea menor a 800px, rotar la imagen
    if (anchoContenedor < 800) {
      imagen.classList.add('rotada');
    } else {
      imagen.classList.remove('rotada');
    }
}

  window.addEventListener('load', ajustarRotacion);
  window.addEventListener('resize', ajustarRotacion);


// ------------------  CINTA ROTATIVA DE SERVICIOS --------------  
class CintaRotativa {
  constructor(config) {
    this.tituloCinta = config.tituloCinta;
    this.direccionDeRotacion = config.direccionDeRotacion;
    this.ancho = config.ancho;
    this.alto = config.alto;
    this.botonDireccion = config.botonDireccion;
    this.colorBoton = config.colorBoton || 'dorado-claro';
    this.radioEsquina = config.radioEsquina || 0;
    this.colorTitulo = config.colorTitulo || 'black';
    this.separacionEntreImagen = config.separacionEntreImagen != null ? config.separacionEntreImagen : 5;
    this.servicios = this.limpiarLista(config.servicios);
    this.imagenes = this.limpiarLista(config.imagenes);
    this.links = this.limpiarLista(config.links);
    this.velocidad = config.velocidad || 20;
    this.componente = config.componente;

    this.normalizarListas();
    this.crearCinta();
    this.iniciarAnimacion();
  }

  limpiarLista(cadena) {
    return cadena.split(',').map(e => e.trim());
  }

  normalizarListas() {
    const max = Math.max(this.servicios.length, this.imagenes.length, this.links.length);
    while (this.servicios.length < max) this.servicios.push("sin dato");
    while (this.imagenes.length < max) this.imagenes.push("img/servicio_no_especificado.jpg");
    while (this.links.length < max) this.links.push("");
    this.totalItems = max;
  }

  crearCinta() {
    this.contenedor = document.getElementById(this.componente);
    this.contenedor.className = 'cinta-contenedor';
    this.contenedor.style.width = this.ancho;
    this.contenedor.style.height = this.alto;

    this.titulo = document.createElement('div');
    this.titulo.className = 'cinta-titulo cinta-rotativa-titulo';
    this.titulo.style.color = `var(--${this.colorTitulo})`;
    this.titulo.textContent = this.tituloCinta;
    this.contenedor.appendChild(this.titulo);

    this.bandaWrapper = document.createElement('div');
    this.bandaWrapper.className = 'cinta-imagenes';
    this.contenedor.appendChild(this.bandaWrapper);

    this.banda = document.createElement('div');
    this.banda.style.display = 'flex';
    this.banda.style.gap = `${this.separacionEntreImagen}px`;
    this.bandaWrapper.appendChild(this.banda);

    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < this.totalItems; j++) {
        const link = document.createElement('a');
        if (this.links[j]) link.href = this.links[j];
        link.title = this.servicios[j];

        const img = document.createElement('img');
        img.src = this.imagenes[j];
        img.alt = this.servicios[j];
        img.style.borderRadius = `${this.radioEsquina}px`;
        img.onerror = () => {
          img.src = 'img/servicio_no_especificado.jpg';
        };

        link.appendChild(img);
img.style.width = "120px";
img.style.minWidth = "120px";
img.style.maxWidth = "120px";
link.style.width = "120px";
link.style.minWidth = "120px";
link.style.maxWidth = "120px";


        this.banda.appendChild(link);
      }
    }

    if (this.botonDireccion === 'si') {
      this.control = document.createElement('div');
      this.control.className = 'cinta-control';

      const boton = document.createElement('button');
      boton.innerHTML = '↔';
      boton.title = 'Cambiar Dirección';
      boton.style.backgroundColor = `var(--${this.colorBoton})`;
      boton.onclick = () => this.cambiarDireccion();

      this.control.appendChild(boton);
      this.contenedor.appendChild(this.control);
    }

    this.contenedor.addEventListener('mouseenter', () => this.pausar());
    this.contenedor.addEventListener('mouseleave', () => this.reanudar());
  }

  iniciarAnimacion() {
    this.pos = 0;
    this.direccion = this.direccionDeRotacion === 'izquierda' ? -1 : 1;
    this.pausado = false;
    this.pxPorFrame = this.velocidad / 10;
    requestAnimationFrame(this.animar.bind(this));
  }

  animar() {
    if (!this.pausado) {
      this.pos += this.direccion * this.pxPorFrame;
      const bandaWidth = this.banda.scrollWidth / 2;

      if (this.direccion === -1 && Math.abs(this.pos) >= bandaWidth) {
        this.pos = 0;
      } else if (this.direccion === 1 && this.pos >= 0) {
        this.pos = -bandaWidth;
      }

      this.banda.style.transform = `translateX(${this.pos}px)`;
    }
    requestAnimationFrame(this.animar.bind(this));
  }

  pausar() {
    this.pausado = true;
  }

  reanudar() {
    this.pausado = false;
  }

  cambiarDireccion() {
    this.direccion *= -1;
  }
}

function CrearCintaServicios(servicio,direccion="izquierda",velocidad=8){
   return new CintaRotativa({
			tituloCinta: "Nuestros servicios...",
			direccionDeRotacion: direccion,
			ancho: "90%",
			alto: "36px",
			botonDireccion: "si",
			colorBoton: "dorado-claro",
			radioEsquina: 5,
			colorTitulo: "carrusel_txt_titulo",
			separacionEntreImagen: 2,
			servicios: "Diseño arquitectónico y cálculo estructural, Topografía, Cimentación, Mampostería, Enchapes, Electricidad, Terminados de obra, paisajismo, urbanismo",
			imagenes: "img/servicio_dace.jpg, img/servicio_topografia.jpg, img/servicio_cimentacion.jpg, img/servicio_mamposteria.jpg, img/servicio_enchapes.jpg, img/servicio_electricidad.jpg, img/servicio_terminados.jpg, img/servicio_paisajismo.jpg, img/servicio_urbanismo.jpg",
			links: "#serv_dace, #serv_topografia, #serv_cimentacion, #serv_mamposteria, #serv_enchapes, #serv_electricidad, #serv_terminados, #serv_paisajismo, #serv_urbanismo",
			velocidad: velocidad,                                        
			componente: servicio
			});

    }
