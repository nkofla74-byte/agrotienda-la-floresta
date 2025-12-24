export const products = [
  // --- AGUACATES ---
  {
    id: 1,
    nombre: "Aguacate Hass",
    descripcion: "Cremoso, calidad exportación. La joya de Fresno.",
    imagen: "/images/aguacatehas.jpeg",
    categoria: "Frutas",
    disponible: true,
    variantes: [
      { nombre: "Libra (500g)", precio: 3500 },
      { nombre: "Kilo (1000g)", precio: 6500 },
      { nombre: "Bolsa Familiar (3kg)", precio: 18000 }
    ]
  },
  {
    id: 2,
    nombre: "Aguacate Choquet",
    descripcion: "De gran tamaño y sabor suave. Ideal para ensaladas.",
    imagen: "/images/choquete.jpg", // Foto genérica (sugerencia: cambiar)
    categoria: "Frutas",
    disponible: true,
    variantes: [
      { nombre: "Libra", precio: 3000 },
      { nombre: "Kilo", precio: 5500 },
      { nombre: "Paquete (3 Und grandes)", precio: 15000 }
    ]
  },
  {
    id: 3,
    nombre: "Aguacate Semil",
    descripcion: "Variedad resistente y de pulpa firme.",
    imagen: "/images/cemil.jpg", // Foto genérica (sugerencia: cambiar)
    categoria: "Frutas",
    disponible: true,
    variantes: [
      { nombre: "Libra", precio: 3000 },
      { nombre: "Kilo", precio: 5500 },
      { nombre: "Bolsa (3kg)", precio: 15000 }
    ]
  },
  {
    id: 4,
    nombre: "Aguacate Papelillo",
    descripcion: "Piel brillante y sabor mantequilloso.",
    imagen: "/images/papelillo.jpg",
    categoria: "Frutas",
    disponible: true,
    variantes: [
      { nombre: "Libra", precio: 3200 },
      { nombre: "Kilo", precio: 6000 },
      { nombre: "Bolsa (3kg)", precio: 17000 }
    ]
  },

  // --- TUBÉRCULOS ---
  {
    id: 5,
    nombre: "Yuca Fresca",
    descripcion: "Yuca que 'abre' garantizada. Harinosa y suave.",
    imagen: "/images/yuca.jpeg",
    categoria: "Verduras",
    disponible: true,
    variantes: [
      { nombre: "Libra", precio: 2000 },
      { nombre: "Kilo", precio: 3800 },
      { nombre: "Bolsa (5kg)", precio: 18000 }
    ]
  },

  // --- PLÁTANOS Y BANANOS ---
  {
    id: 6,
    nombre: "Plátano Verde",
    descripcion: "Ideal para patacones crocantes o sopas.",
    imagen: "/images/platano.jpg", // Usando imagen de verde disponible
    categoria: "Verduras",
    disponible: true,
    variantes: [
      { nombre: "Libra", precio: 1800 },
      { nombre: "Kilo", precio: 3500 },
      { nombre: "Paquete (5 Und)", precio: 8000 }
    ]
  },
  {
    id: 7,
    nombre: "Plátano Maduro",
    descripcion: "Dulce, perfecto para tajadas o al horno.",
    imagen: "/images/bananomadurom.jpg",
    categoria: "Verduras",
    disponible: true,
    variantes: [
      { nombre: "Libra", precio: 1800 },
      { nombre: "Kilo", precio: 3500 },
      { nombre: "Paquete (5 Und)", precio: 8000 }
    ]
  },
  {
    id: 8,
    nombre: "Banano Común",
    descripcion: "La fruta infaltable. Energía natural.",
    imagen: "/images/bananomaduro.jpg", // Sugerencia: Actualizar foto a banano maduro
    categoria: "Frutas",
    disponible: true,
    variantes: [
      { nombre: "Libra (Gajo peq)", precio: 1500 },
      { nombre: "Kilo", precio: 2800 },
      { nombre: "Bolsa (Gajo grande)", precio: 5000 }
    ]
  },
  {
    id: 9,
    nombre: "Banano Bocadillo",
    descripcion: "Pequeño, dulce y delicioso. El favorito de los niños.",
    imagen: "/images/bocadillo.jpg", // Sugerencia: Actualizar foto
    categoria: "Frutas",
    disponible: true,
    variantes: [
      { nombre: "Libra", precio: 2000 },
      { nombre: "Kilo", precio: 3800 },
      { nombre: "Paquete (Gajo grande)", precio: 6000 }
    ]
  },

  // --- FRUTAS VARIAS ---
  {
    id: 10,
    nombre: "Maracuyá",
    descripcion: "Puro sabor cítrico para jugos y postres.",
    imagen: "/images/maraculla.jpeg",
    categoria: "Frutas",
    disponible: true,
    variantes: [
      { nombre: "Libra", precio: 2800 },
      { nombre: "Kilo", precio: 5000 },
      { nombre: "Bolsa (10kg)", precio: 45000 }
    ]
  },

  // --- DESPENSA ---
  {
    id: 11,
    nombre: "Panela Artesanal",
    descripcion: "El dulce sabor de nuestros trapiches.",
    imagen: "/images/panela.jpeg",
    categoria: "Despensa",
    disponible: true,
    variantes: [
      { nombre: "Unidad (Par)", precio: 4000 },
      { nombre: "Paca (12 Pares)", precio: 45000 },
      { nombre: "Caja (24 Pares)", precio: 85000 }
    ]
  }
];