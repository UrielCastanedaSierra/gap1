// Navegation Menu
let btnMenu = document.querySelector('.btn-menu');
let barIconX = document.querySelector('.btn-menu i');
let menu = document.querySelector('.list-container');
let menuContent = document.querySelector('.menu');
let all= document.body;
var activador = true;

btnMenu.addEventListener('click', (event) => {

  //Icon X
  barIconX.classList.toggle('fa-times');

   if(activador){
     menu.style.left = '0%'; 
     menu.style.transition = '0.5s';
     menuContent.style.position='fixed';
     menuContent.style.top = '0px';
     activador = false;
     all.style.overflowY="hidden";
   }
   else{
    activador = false;
    menu.style.left = '-100%';
    all.style.overflowY="auto";
    activador = true;
   }

});

// Add class "active"
let enlaces = document.querySelectorAll('.lists li a');

enlaces.forEach((element) => {
   
  element.addEventListener('click', (event) => {
   enlaces.forEach((link) => {
     link.classList.remove('active');
   });
    event.target.classList.add('active');

  });

});

//Scroll Efect

 let prevScrollPos = window.pageYOffset;
 let goTop = document.querySelector('.go-top');

window.onscroll = () => {
  
  //Hide & Show - Scroll Menu (Function)
  let currentScrollPos = window.pageYOffset;

  if (prevScrollPos > currentScrollPos) {
    menuContent.style.top = '0px';
    menuContent.style.transition = '0.5s';
  }else{
    menuContent.style.top = '-60px';
    menuContent.style.transition = '0.5s';
  }
  prevScrollPos = currentScrollPos;
  
  //Scoll Menu & Go Top & See Down (Styles)
  let arriba = window.pageYOffset;

  //Conditions
  if(arriba <= 600){
    menuContent.style.borderBottom = 'none';

    //Ocultar Go Top
    goTop.style.right = '-100px';
  }else{
    menuContent.style.borderBottom = '3px solid #ff2e63';

    //Mostrar Go Top
    goTop.style.right = '0px';
  }
  
}

//Go Top Click
goTop.addEventListener('click', () => {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
});

let abajo = document.querySelector('#abajo');

abajo.addEventListener('click', () => {
  document.body.scrollTop = 600;
  document.documentElement.scrollTop = 600;
  
});

//  === FUNCIONES PARA MANEJO DEL CARRUCEL
class Carrusel1 {
  constructor({ id_Item, nombre, descrip_carrusel, titulo_fotos, fotos, descripciones }, contenedorId, tiempo = 8000) {
    this.id = id_Item;
    this.nombre = nombre;
    this.descripcionCarrusel = descrip_carrusel;
    this.titulos = titulo_fotos.split(',');
    this.fotos = fotos.split(',');
    this.descripciones = descripciones.split(',');
    this.index = 0;
    this.tiempo = tiempo;
    this.timer = null;
    this.render(contenedorId);
  }

  render(contenedorId) {
    const contenedor = document.createElement('div');
    const wrapper = document.getElementById(contenedorId);

    const tituloHtml = `<div class="carrusel-titulo">${this.nombre}</div>`;
    const descripcionHtml = `<div class="descripcion-carrusel">${this.descripcionCarrusel}</div>`;

    wrapper.insertAdjacentHTML('beforeend', tituloHtml + descripcionHtml);

    contenedor.className = 'carrusel-container';
    contenedor.innerHTML = `
      <div class="carrusel-imagen">
        <span class="flecha izq">&#10094;</span>
        <img src="./audiovisual/proy_${this.id}/${this.fotos[0].trim()}" alt="imagen">
        <span class="flecha der">&#10095;</span>
        <div class="titulo-foto">${this.titulos[0]}</div>
      </div>
      <div class="descripcion-foto">${this.descripciones[0]}</div>
      <div class="miniaturas">
        ${this.fotos.map((f, i) => `<img src="./audiovisual/proy_${this.id}/${f.trim()}" data-index="${i}" alt="miniatura">`).join('')}
      </div>
    `;

    wrapper.appendChild(contenedor);

    this.img = contenedor.querySelector('img');
    this.titulo = contenedor.querySelector('.titulo-foto');
    this.descripcion = contenedor.querySelector('.descripcion-foto');
    this.miniaturas = contenedor.querySelectorAll('.miniaturas img');

    contenedor.querySelector('.flecha.izq').onclick = () => this.cambiar(-1);
    contenedor.querySelector('.flecha.der').onclick = () => this.cambiar(1);

    this.miniaturas.forEach(img => {
      img.addEventListener('click', e => {
        this.index = parseInt(e.target.dataset.index);
        this.actualizar();
      });
    });

    this.img.addEventListener('click', () => this.abrirModal());

    this.autoSlide();
  }

  cambiar(delta) {
    this.index = (this.index + delta + this.fotos.length) % this.fotos.length;
    this.actualizar();
  }

  actualizar() {
    this.img.src = `./audiovisual/proy_${this.id}/${this.fotos[this.index].trim()}`;
    this.titulo.textContent = this.titulos[this.index].trim();
    this.descripcion.textContent = this.descripciones[this.index].trim();
    this.miniaturas.forEach((img, i) => img.classList.toggle('active', i === this.index));
  }

  autoSlide() {
    this.timer = setInterval(() => {
      this.cambiar(1);
    }, this.tiempo);
  }

  abrirModal() {
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modal-img');
    modal.style.display = 'flex';
    modalImg.src = this.img.src;
    document.body.style.overflow = 'hidden';

    modal.onclick = () => {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  }
}
// Ejemplo de uso:
// new Carrusel1(configuracionObjeto, intervaloMilisegundos, contenedorDOM);


// Función para actualizar el tamaño de imagenesrotadas

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