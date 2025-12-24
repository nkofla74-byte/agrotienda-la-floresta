export const products = [
  {
    id: 1,
    nombre: "Aguacate Hass",
    descripcion: "Cremoso, calidad exportación. La joya de Fresno.",
    imagen: "/images/aguacatehas.jpeg",
    categoria: "Frutas",
    disponible: true, // <--- DISPONIBLE
    variantes: [
      { nombre: "Unidad Madura", precio: 2500 },
      { nombre: "Kilo", precio: 8000 },
      { nombre: "Canastilla (20kg)", precio: 140000 }
    ]
  },
  {
    id: 2,
    nombre: "Plátano Maduro",
    descripcion: "Dulce, ideal para tajadas o aborrajados.",
    imagen: "/images/platano.jpg",
    categoria: "Frutas",
    disponible: true, // <--- DISPONIBLE
    variantes: [
      { nombre: "Unidad", precio: 1200 },
      { nombre: "Mano (Gajo)", precio: 5000 },
      { nombre: "Bulto", precio: 85000 }
    ]
  },
  {
      id: 3,
      nombre: "Maíz Tierno",
      descripcion: "Mazorcas grandes y dulces, recién cogidas.",
      imagen: "/images/maiztierno.jpg",
      categoria: "Verduras",
      disponible: false, // <--- EJEMPLO: NO DISPONIBLE (Agotado)
      variantes: [
        { nombre: "Unidad", precio: 1500 },
        { nombre: "Mano (5 und)", precio: 6000 },
        { nombre: "Bulto", precio: 70000 }
      ]
  },
  {
      id: 4,
      nombre: "Maracuyá",
      descripcion: "Puro sabor cítrico para jugos y postres.",
      imagen: "/images/maraculla.jpeg",
      categoria: "Frutas",
      disponible: true,
      variantes: [
        { nombre: "Libra", precio: 2800 },
        { nombre: "Kilo", precio: 5000 },
        { nombre: "Bolsa 10kg", precio: 45000 }
      ]
  },
  {
      id: 5,
      nombre: "Yuca",
      descripcion: "Yuca que 'abre' garantizada. Harinosa y suave.",
      imagen: "/images/yuca.jpeg",
      categoria: "Verduras",
      disponible: true,
      variantes: [
        { nombre: "Libra", precio: 2000 },
        { nombre: "Kilo", precio: 3800 },
        { nombre: "Bulto", precio: 90000 }
      ]
  },
  {
      id: 6,
      nombre: "Panela Artesanal",
      descripcion: "El dulce sabor de nuestros trapiches.",
      imagen: "/images/panela.jpeg",
      categoria: "Despensa",
      disponible: true,
      variantes: [
        { nombre: "Par (2 und)", precio: 4000 },
        { nombre: "Pacas (24 und)", precio: 42000 }
      ]
  },
  {
      id: 7,
      nombre: "Bocadillo Fresnense",
      descripcion: "Tradición dulce de guayaba y hoja de bijao.",
      imagen: "/images/bocadillo.jpg",
      categoria: "Dulces",
      disponible: false, // <--- EJEMPLO: NO DISPONIBLE
      variantes: [
        { nombre: "Lonja", precio: 3500 },
        { nombre: "Caja x 12", precio: 15000 }
      ]
  },
  {
      id: 8,
      nombre: "Café de Montaña",
      descripcion: "Aroma y cuerpo medio. Tostión artesanal.",
      imagen: "/images/cafe.webp",
      categoria: "Despensa",
      disponible: true,
      variantes: [
        { nombre: "Media Libra", precio: 18000 },
        { nombre: "Libra", precio: 32000 }
      ]
  }
];