
import { Stamp, Neighborhood, Finalist, TriviaCategory, TriviaQuestion, TriviaHistoryItem, FamilyMember, FamilyGoal, FamilyContribution } from './types';

export const FAMILY_MEMBERS: FamilyMember[] = [
  { id: 'm1', name: 'Mamá Michelle', avatar: '/gobe.jpg', points: 350, isLead: true },
  { id: 'm2', name: 'Papá Ricardo', avatar: '/16790601617461.jpg', points: 200 },
  { id: 'm3', name: 'Mateo', avatar: '/joven.avif', points: 150 },
  { id: 'm4', name: 'Jose Manuel', avatar: '/jose manuel.webp', points: 100 },
  { id: 'm5', name: 'Abuelo Juan', avatar: '/Rafael-Blanco.webp', points: 50 },
];

export const FAMILY_GOAL: FamilyGoal = {
  id: 'g1',
  name: 'Meta de la Fiesta',
  description: 'Faltan 150 pts para el Pack Familiar',
  target: 1000,
  current: 850,
  image: 'https://picsum.photos/seed/icecream-party/800/600'
};

export const FAMILY_CONTRIBUTIONS: FamilyContribution[] = [
  { id: 'c1', memberName: 'Papá', avatar: 'https://i.pravatar.cc/150?u=ricardo', amount: 100, time: 'HACE 2 HORAS' },
  { id: 'c2', memberName: 'Tú (Laura)', avatar: 'https://i.pravatar.cc/150?u=me', amount: 250, time: 'AYER' },
];

export const STAMPS: Stamp[] = [
  { id: 's1', name: 'Fresa', collected: true, image: '/fresa-bon.jpg', date: '10 Oct 2023', rarity: 'Común', popularity: 'Alta', description: 'El clásico sabor a fresas frescas recolectadas a mano.' },
  { id: 's2', name: 'Chocolate', collected: true, image: '/chocolate-bon.jpg', date: '12 Oct 2023', rarity: 'Común', popularity: 'Muy Alta' },
  { id: 's3', name: 'Vainilla', collected: true, image: '/vainilla-bon.jpg', date: '15 Oct 2023', rarity: 'Común', popularity: 'Alta' },
  { id: 's4', name: 'Pistacho', collected: true, image: '/pistacho-1.png', date: '18 Oct 2023', rarity: 'Rara', popularity: 'Media' },
  { id: 's12', name: 'Sabor Azul', collected: false, image: '/saborazul.png', rarity: 'Rara', popularity: 'Alta', description: 'El misterioso y delicioso sabor azul de Bon.' },
  { id: 's13', name: 'Coralium', collected: false, image: '/coralium.png', rarity: 'Épica', popularity: 'Alta', description: 'Una joya del mar hecha helado.' },

  { id: 's6', name: 'Coco', collected: true, image: '/coco.png', date: '20 Oct 2023', rarity: 'Común', popularity: 'Baja' },
  { id: 's7', name: 'Dulce de leche', collected: true, image: '/dulce.webp', date: '22 Oct 2023', rarity: 'Rara', popularity: 'Alta' },
  { id: 's8', name: 'Oreo', collected: true, image: '/oreo.png', date: '25 Oct 2023', rarity: 'Común', popularity: 'Media' },

  { id: 's11', name: 'Uva', collected: false, image: '/UVA-bon.png', rarity: 'Común', popularity: 'Media', description: 'El dulce sabor de la uva en un cremoso helado.' },
  { id: 's10', name: 'Bomba Tropical', collected: false, image: '/sabor tropical.jpg', date: '15 Oct 2023', rarity: 'Épica', popularity: 'Muy Alta', isSpecial: true, description: 'Una explosión frutal que te transporta directamente al corazón del Caribe. Piña fresca, maracuyá intenso y el toque secreto de Bon.' },
];

export const NEIGHBORHOODS: Neighborhood[] = [
  { id: 'n1', name: 'Piantini', points: 28400, residents: 1240 },
  { id: 'n2', name: 'Bella Vista', points: 25150, residents: 980 },
  { id: 'n3', name: 'Naco', points: 22100, residents: 850, isUserSector: true },
  { id: 'n4', name: 'Arroyo Hondo', points: 19800, residents: 720 },
  { id: 'n5', name: 'Gazcue', points: 15400, residents: 650 },
  { id: 'n6', name: 'Quisqueya', points: 12200, residents: 510 },
];

export const FINALISTS: Finalist[] = [
  {
    id: 'f1',
    name: 'El Tumba Dieta',
    author: 'Maria Rodriguez',
    description: 'Helado de pistacho, con chocolate, bizcoho y coco, con un topping especial de fresa',
    votes: 1240,
    image: '/explosion.png',
    rank: 'TOP #1',
    type: 'vaso'
  },
  {
    id: 'f2',
    name: 'Pistacho Remix',
    author: 'Juan Carlos',
    description: 'combinación especial de pistacho, con dulce de leche y un topping de fresa',
    votes: 982,
    image: '/heladobonvainilla.png',
    rank: 'TOP #2',
    type: 'vaso'
  }
];

export const TRIVIA_CATEGORIES: TriviaCategory[] = [
  { id: 'cat1', name: 'Historia Bon', description: 'Desde 1972 repartiendo alegría.', icon: '📖', color: 'bg-yellow-400', image: '/tienda,bon.jpg' },

];

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    id: 'q1',
    question: '¿En qué año se fundó la primera tienda de Helados Bon en la calle Espaillat?',
    options: ['1972', '1980', '1995'],
    correctAnswer: 0,
    image: '/heladeria.jpg',
    fact: '¡Así es! Bon inició en 1972 con su primera tienda en Santo Domingo, refrescando a todos con sus sabores icónicos.'
  },
  {
    id: 'q2',
    question: '¿Cuál es el sabor más vendido históricamente en República Dominicana?',
    options: ['Vainilla', 'Chocolate', 'Fresa'],
    correctAnswer: 1,
    fact: 'El chocolate belga de Bon es el favorito indiscutible de los dominicanos por generaciones.'
  },
  {
    id: 'q3',
    question: '¿Cómo se llama la línea de helados Premium de chocolate de Bon?',
    options: ['Etiqueta Azul', 'Gran Chocolate', 'Etiqueta Negra'],
    correctAnswer: 2,
    fact: 'Bon Etiqueta Negra es sinónimo de chocolate premium en Helados Bon.'
  }
];

export const TRIVIA_HISTORY: TriviaHistoryItem[] = [
  { id: 'h1', name: 'Jueves de TBT Bon', date: 'Jueves, 14 de Oct, 2023 • 4:15 PM', points: 85, maxPoints: 100, reward: 'Cupón 10% Descuento', type: 'TBT' },
  { id: 'h2', name: 'Trivia de Sabores', date: 'Lunes, 10 de Oct, 2023 • 2:30 PM', points: 95, maxPoints: 100, reward: 'Sabor del Mes Gratis', type: 'SABORES' },
  { id: 'h3', name: 'Clásicos de Bon', date: 'Jueves, 07 de Oct, 2023 • 5:00 PM', points: 100, maxPoints: 100, reward: '2x1 en Barquillas', type: 'TBT' },
  { id: 'h4', name: 'Menú de Temporada', date: 'Domingo, 03 de Oct, 2023 • 11:20 AM', points: 40, maxPoints: 100, type: 'TEMPORADA' },
];

export const LAB_OPTIONS = {
  bases: ['Vainilla', 'Chocolate', 'Fresa'],
  fruits: ['Cereza Roja'],
  toppings: ['Chocolate', 'Lluvia de Colores', 'Sirope Caramelo', 'Fresa']
};

export const MENU_CATEGORIES = [
  { id: 'cat_sabores', name: 'Sabores', icon: '🍦' },
  { id: 'cat_conos', name: 'Tipo de Conos', icon: '🍦' },
  { id: 'cat_batidas', name: 'Batidas', icon: '🥤' },
  { id: 'cat_pintas', name: 'Pintas', icon: '📦' },
];

export const MENU_ITEMS = [
  {
    id: 'item1',
    name: 'Fresa',
    description: 'El clásico y refrescante sabor de fresa.',
    price: 150,
    category: 'cat_sabores',
    image: '/fresa-bon.jpg', // Placeholder, using what might be available or generic
    calories: 220
  },
  {
    id: 'item2',
    name: 'Caramelo',
    description: 'Dulce y cremoso caramelo con un toque salado.',
    price: 160,
    category: 'cat_sabores',
    image: '/dulce.webp',
    calories: 280
  },
  {
    id: 'item_pistacho',
    name: 'Pistacho',
    description: 'El sabor único del pistacho real.',
    price: 180,
    category: 'cat_sabores',
    image: '/pistacho-1.png',
    calories: 260
  },
  {
    id: 'item_bonito',
    name: 'Bonito',
    description: 'El clásico cono pequeño de Bon.',
    price: 50,
    category: 'cat_conos',
    image: '/vain.jpg',
    calories: 120
  },
  {
    id: 'item_barquito',
    name: 'Barquito',
    description: 'Crujiente barquilla en forma de canasta.',
    price: 180,
    category: 'cat_conos',
    image: '/barquito.jpg',
    calories: 320
  },

  {
    id: 'item5',
    name: 'Batido Chinola Fresa',
    description: 'Refrescante combinación de chinola y fresa.',
    price: 200,
    category: 'cat_batidas',
    image: '/batidos.png',
    calories: 280
  },
  {
    id: 'item_mango_pina',
    name: 'Batido Mango y Piña',
    description: 'Tropical mezcla de mango y piña.',
    price: 200,
    category: 'cat_batidas',
    image: '/mango y pina.png',
    calories: 260
  },
  {
    id: 'item_fresa_pina',
    name: 'Batido Fresa y Piña',
    description: 'Dulce encuentro entre fresa y piña.',
    price: 200,
    category: 'cat_batidas',
    image: '/fresaypina.png',
    calories: 270
  },
  {
    id: 'item6',
    name: '1 Pinta',
    description: 'Lleva tu sabor favorito a casa (16oz).',
    price: 300,
    category: 'cat_pintas',
    image: '/1 pinta.png',
    calories: 1200
  },
  {
    id: 'item_2pintas',
    name: '2 Pintas',
    description: 'Doble sabor para compartir (2x16oz).',
    price: 500,
    category: 'cat_pintas',
    image: '/2 pintas.png',
    calories: 2400
  },
  {
    id: 'item_mediogalon',
    name: '1/2 Galón',
    description: 'El tamaño perfecto para compartir (32oz).',
    price: 800,
    category: 'cat_pintas',
    image: '/1 2 galon.png',
    calories: 4800
  }
];
