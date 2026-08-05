import { dbReady } from './database.js';
import bcrypt from 'bcryptjs';

async function seed() {
  const db = await dbReady;

  // Seed categories
  const categories = [
    { name: 'Montres Homme', description: 'Collection de montres pour hommes', image: '/images/cat-homme.jpg' },
    { name: 'Montres Femme', description: 'Collection de montres pour femmes', image: '/images/cat-femme.jpg' },
    { name: 'Montres Sport', description: 'Montres sportives et robustes', image: '/images/cat-sport.jpg' },
    { name: 'Montres Luxe', description: 'Montres de luxe haut de gamme', image: '/images/cat-luxe.jpg' },
    { name: 'Montres Connectées', description: 'Montres intelligentes et connectées', image: '/images/cat-connected.jpg' },
  ];

  for (const c of categories) {
    try {
      db.prepare('INSERT OR IGNORE INTO categories (name, description, image) VALUES (?, ?, ?)').run(c.name, c.description, c.image);
    } catch(e) {}
  }

  // Seed products
  const products = [
    {
      name: 'Rolex Submariner',
      description: 'La Rolex Submariner est une montre de plongée emblématique. Boîtier en acier Oystersteel, lunette tournante unidirectionnelle Cerachrom en céramique noire.',
      price: 85000, brand: 'Rolex', category_id: 4, stock: 3, is_featured: 1,
      image: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600&h=600&fit=crop',
    },
    {
      name: 'Omega Seamaster 300M',
      description: 'L\'Omega Seamaster Professional 300M incarne l\'héritage maritime de la marque. Cadran bleu, mouvement Co-Axial Master Chronometer.',
      price: 52000, brand: 'Omega', category_id: 4, stock: 5, is_featured: 1,
      image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop',
    },
    {
      name: 'TAG Heuer Carrera',
      description: 'La TAG Heuer Carrera Chronograph est un hommage à la course automobile. Mouvement automatique, cadran noir avec compteurs.',
      price: 38000, brand: 'TAG Heuer', category_id: 1, stock: 8, is_featured: 1,
      image: 'https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=600&h=600&fit=crop',
    },
    {
      name: 'Casio G-Shock Mudmaster',
      description: 'Montre G-Shock ultra-résistante, conçue pour les environnements extrêmes. Résistante aux chocs, à l\'eau 200m, avec boussole et altimètre.',
      price: 4500, brand: 'Casio', category_id: 3, stock: 25, is_featured: 1,
      image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&h=600&fit=crop',
    },
    {
      name: 'Seiko Presage Cocktail',
      description: 'La Seiko Presage "Cocktail Time" présente un cadran texturé inspiré d\'un cocktail. Mouvement automatique 4R35, boîtier en acier inoxydable.',
      price: 3200, brand: 'Seiko', category_id: 1, stock: 12, is_featured: 0,
      image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&h=600&fit=crop',
    },
    {
      name: 'Tissot PRX Powermatic 80',
      description: 'La Tissot PRX Powermatic 80 combine élégance rétro et technologie moderne. Réserve de marche de 80 heures, finition soignée.',
      price: 7500, brand: 'Tissot', category_id: 1, stock: 15, is_featured: 1,
      image: 'https://images.unsplash.com/photo-1526045431048-f857369baa09?w=600&h=600&fit=crop',
    },
    {
      name: 'Longines HydroConquest',
      description: 'Montre de plongée Longines HydroConquest. Mouvement automatique, cadran bleu, lunette tournante unidirectionnelle.',
      price: 14500, brand: 'Longines', category_id: 3, stock: 7, is_featured: 0,
      image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=600&h=600&fit=crop',
    },
    {
      name: 'Apple Watch Ultra 2',
      description: 'La montre connectée la plus robuste d\'Apple. Écran Always-On, GPS de précision, autonomie de 36 heures. Titane et verre saphir.',
      price: 9900, brand: 'Apple', category_id: 5, stock: 20, is_featured: 1,
      image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&h=600&fit=crop',
    },
    {
      name: 'Samsung Galaxy Watch 6',
      description: 'Montre connectée Samsung avec écran Super AMOLED, suivi santé avancé, GPS intégré et design élégant.',
      price: 3200, brand: 'Samsung', category_id: 5, stock: 18, is_featured: 0,
      image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=600&fit=crop',
    },
    {
      name: 'Citizen Eco-Drive',
      description: 'Montre Citizen Eco-Drive alimentée par la lumière. Pas de changement de pile nécessaire. Design classique intemporel.',
      price: 2800, brand: 'Citizen', category_id: 1, stock: 20, is_featured: 0,
      image: 'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=600&h=600&fit=crop',
    },
    {
      name: 'Michael Rose Gold',
      description: 'Montre Michael Kors féminine en acier plaqué or rose. Cadran nacré avec index diamants, bracelet maille milanaise.',
      price: 3500, brand: 'Michael Kors', category_id: 2, stock: 14, is_featured: 1,
      image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&h=600&fit=crop',
    },
    {
      name: 'Dior Malice',
      description: 'La Dior Malice incarne l\'élégance parisienne. Cadran mère de perle, bracelet en cuir, design raffiné pour femmes.',
      price: 28000, brand: 'Dior', category_id: 4, stock: 4, is_featured: 1,
      image: 'https://images.unsplash.com/photo-1639037687665-7e4a59e1e3a1?w=600&h=600&fit=crop',
    },
    {
      name: 'Garmin Fenix 7X',
      description: 'Montre multisport GPS haut de gamme. Cartographie, solaire, autonomie jusqu\'à 37 jours en mode smartwatch.',
      price: 8900, brand: 'Garmin', category_id: 3, stock: 10, is_featured: 0,
      image: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=600&h=600&fit=crop',
    },
    {
      name: 'Patek Philippe Nautilus',
      description: 'La Patek Philippe Nautilus 5711 est l\'une des montres les plus convoitées au monde. Design iconique, finition exceptionnelle.',
      price: 350000, brand: 'Patek Philippe', category_id: 4, stock: 1, is_featured: 1,
      image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&h=600&fit=crop',
    },
    {
      name: 'Fossil Grant',
      description: 'Montre Fossil Grant pour homme. Style classique avec mouvement quartz, boîtier en acier inoxydable, bracelet cuir.',
      price: 1500, brand: 'Fossil', category_id: 1, stock: 30, is_featured: 0,
      image: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=600&h=600&fit=crop',
    },
    {
      name: 'Chanel J12',
      description: 'La Chanel J12 en céramique noire est un incontournable de l\'horlogerie féminine. Mouvement automatique, design iconique.',
      price: 65000, brand: 'Chanel', category_id: 2, stock: 3, is_featured: 1,
      image: 'https://images.unsplash.com/photo-1606859191213-97a62295cc3e?w=600&h=600&fit=crop',
    },
  ];

  for (const p of products) {
    try {
      db.prepare('INSERT OR IGNORE INTO products (name, description, price, brand, category_id, stock, is_featured, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
        p.name, p.description, p.price, p.brand, p.category_id, p.stock, p.is_featured, p.image
      );
    } catch(e) {}
  }

  // Seed admin user
  const adminPassword = bcrypt.hashSync('admin123', 10);
  try {
    db.prepare('INSERT OR IGNORE INTO users (email, password, name, phone, address, city, is_admin) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      'admin@watchstore.ma', adminPassword, 'Admin', '0600000000', 'Casablanca', 'Casablanca', 1
    );
  } catch(e) {}

  // Seed test customer
  const testPassword = bcrypt.hashSync('test123', 10);
  try {
    db.prepare('INSERT OR IGNORE INTO users (email, password, name, phone, address, city, is_admin) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      'client@test.ma', testPassword, 'Ahmed Benali', '0612345678', '123 Bd Mohammed V', 'Casablanca', 0
    );
  } catch(e) {}

  console.log('✅ Base de données initialisée avec succès');
  console.log('   Admin: admin@watchstore.ma / admin123');
  console.log('   Client test: client@test.ma / test123');
  console.log(`   ${products.length} produits et ${categories.length} catégories ajoutés`);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
