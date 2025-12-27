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
      { nombre: "Libra (500g)", precio: 4200 }, // Ajustado base mercado
      { nombre: "Kilo (1000g)", precio: 8000 }, // Ref: Costo ~6.5k + 20%
      { nombre: "Bolsa Familiar (3kg)", precio: 22000 }
    ]
  },
  {
    id: 2,
    nombre: "Aguacate Choquet",
    descripcion: "De gran tamaño y sabor suave. Ideal para ensaladas.",
    imagen: "/images/choquete.jpg",
    categoria: "Frutas",
    disponible: true,
    variantes: [
      { nombre: "Libra", precio: 4500 },
      { nombre: "Kilo", precio: 8500 }, // Ref: Costo ~7k + 20%
      { nombre: "Paquete (3 Und grandes)", precio: 24000 }
    ]
  },
  {
    id: 3,
    nombre: "Aguacate Semil",
    descripcion: "Variedad resistente y de pulpa firme.",
    imagen: "/images/cemil.jpg",
    categoria: "Frutas",
    disponible: true,
    variantes: [
      { nombre: "Libra", precio: 3800 },
      { nombre: "Kilo", precio: 7000 }, // Subida moderada
      { nombre: "Bolsa (3kg)", precio: 19000 }
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
      { nombre: "Libra", precio: 6800 }, // ⚠️ Subida fuerte por escasez
      { nombre: "Kilo", precio: 13500 }, // Ref: Costo ~11k + 20% margen
      { nombre: "Bolsa (3kg)", precio: 38000 }
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
      { nombre: "Libra", precio: 2400 }, // +20% sobre tu precio anterior
      { nombre: "Kilo", precio: 4600 },
      { nombre: "Bolsa (5kg)", precio: 22000 }
    ]
  },

  // --- PLÁTANOS Y BANANOS ---
  {
    id: 6,
    nombre: "Plátano Verde",
    descripcion: "Ideal para patacones crocantes o sopas.",
    imagen: "/images/platano.jpg",
    categoria: "Verduras",
    disponible: true,
    variantes: [
      { nombre: "Libra", precio: 2400 },
      { nombre: "Kilo", precio: 4600 }, // Ref: Costo ~3.8k + 20%
      { nombre: "Paquete (5 Und)", precio: 10000 }
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
      { nombre: "Libra", precio: 2400 },
      { nombre: "Kilo", precio: 4600 }, // Ref: Costo ~3.8k + 20%
      { nombre: "Paquete (5 Und)", precio: 10000 }
    ]
  },
  {
    id: 8,
    nombre: "Banano Común",
    descripcion: "La fruta infaltable. Energía natural.",
    imagen: "/images/bananomaduro.jpg",
    categoria: "Frutas",
    disponible: true,
    variantes: [
      { nombre: "Libra (Gajo peq)", precio: 1800 },
      { nombre: "Kilo", precio: 3400 }, // Ref: Costo ~2.8k + 20%
      { nombre: "Bolsa (Gajo grande)", precio: 6000 }
    ]
  },
  {
    id: 9,
    nombre: "Banano Bocadillo",
    descripcion: "Pequeño, dulce y delicioso. El favorito de los niños.",
    imagen: "/images/bocadillo.jpg",
    categoria: "Frutas",
    disponible: true,
    variantes: [
      { nombre: "Libra", precio: 2400 },
      { nombre: "Kilo", precio: 4600 }, // +20% sobre tu precio anterior
      { nombre: "Paquete (Gajo grande)", precio: 7500 }
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
      { nombre: "Libra", precio: 3400 }, // +20% sobre tu precio anterior
      { nombre: "Kilo", precio: 6000 },
      { nombre: "Bolsa (10kg)", precio: 54000 }
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
      { nombre: "Unidad (unidad)", precio: 4800 }, // +20% sobre tu precio anterior
      { nombre: "Paca (25 unidades ", precio: 95000},
      { nombre: "Caja (50unidades)", precio: 190000 }
    ]
  }
];
