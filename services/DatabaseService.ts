import * as SQLite from 'expo-sqlite';
import { Booking } from '../models/Booking';

const DB_NAME = 'vacation_app.db';

class DatabaseService {
  private static instance: DatabaseService;
  private db: SQLite.SQLiteDatabase | null = null;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync(DB_NAME);
      await this.createTables();
      await this.seedInitialData();
      if (__DEV__) console.log('✅ Database initialized successfully');
    } catch (error) {
      if (__DEV__) console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS user_profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        avatar TEXT,
        bio TEXT,
        location TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      );

      CREATE TABLE IF NOT EXISTS destinations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        country TEXT NOT NULL,
        rating REAL NOT NULL,
        review_count INTEGER NOT NULL,
        price REAL NOT NULL,
        currency TEXT NOT NULL,
        image_url TEXT NOT NULL,
        images TEXT NOT NULL,
        description TEXT NOT NULL,
        amenities TEXT NOT NULL,
        category TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      );

      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        destination_id TEXT NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
        UNIQUE(destination_id)
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        destination_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        user_avatar TEXT,
        rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS hosts (
        id TEXT PRIMARY KEY,
        destination_id TEXT NOT NULL UNIQUE,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        persona TEXT NOT NULL,
        avatar TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        destination_id TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        timestamp INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        destination_id TEXT NOT NULL,
        user_id TEXT,
        check_in_date TEXT NOT NULL,
        check_out_date TEXT NOT NULL,
        guests INTEGER NOT NULL DEFAULT 1,
        total_price REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'confirmed',
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_destinations_category ON destinations(category);
      CREATE INDEX IF NOT EXISTS idx_destinations_price ON destinations(price);
      CREATE INDEX IF NOT EXISTS idx_favorites_destination ON favorites(destination_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_destination ON reviews(destination_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
      CREATE INDEX IF NOT EXISTS idx_hosts_destination ON hosts(destination_id);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_destination ON chat_messages(destination_id);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);
      CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
    `);
  }

  private async seedInitialData(): Promise<void> {
    if (!this.db) return;

    const count = await this.db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM destinations'
    );

    if (count && count.count > 0) {
      if (__DEV__) console.log('Database already seeded');
      return;
    }

    const destinations = this.generateDestinations();
    const destinationIds: string[] = [];
    
    for (const dest of destinations) {
      destinationIds.push(dest.id);
      await this.db.runAsync(
        `INSERT INTO destinations (
          id, name, location, country, rating, review_count, price, currency,
          image_url, images, description, amenities, category, latitude, longitude
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          dest.id,
          dest.name,
          dest.location,
          dest.country,
          dest.rating,
          dest.reviewCount,
          dest.price,
          dest.currency,
          dest.imageUrl,
          JSON.stringify(dest.images),
          dest.description,
          JSON.stringify(dest.amenities),
          dest.category,
          dest.coordinates.latitude,
          dest.coordinates.longitude,
        ]
      );
    }

    // Générer les reviews pour chaque destination
    const reviews = this.generateReviews(destinationIds);
    for (const review of reviews) {
      await this.db.runAsync(
        `INSERT INTO reviews (id, destination_id, user_name, user_avatar, rating, comment, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          review.id,
          review.destinationId,
          review.userName,
          review.userAvatar,
          review.rating,
          review.comment,
          review.createdAt,
        ]
      );
    }

    // Générer les hôtes pour chaque destination
    const hosts = this.generateHosts(destinationIds);
    for (const host of hosts) {
      await this.db.runAsync(
        `INSERT INTO hosts (id, destination_id, first_name, last_name, persona, avatar)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          host.id,
          host.destinationId,
          host.firstName,
          host.lastName,
          host.persona,
          host.avatar,
        ]
      );
    }

    if (__DEV__) console.log(`✅ Seeded ${destinations.length} destinations with hosts`);
  }

  private generateDestinations() {
    const destinations = [];

    const beachDestinations = [
      { name: 'Bali Beach Resort', location: 'Seminyak', country: 'Indonesia', lat: -8.6705, lng: 115.2126, price: 150, img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4' },
      { name: 'Santorini Villa', location: 'Oia', country: 'Greece', lat: 36.4618, lng: 25.3753, price: 320, img: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e' },
      { name: 'Maldives Paradise', location: 'Malé', country: 'Maldives', lat: 4.1755, lng: 73.5093, price: 450, img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8' },
      { name: 'Phuket Beach House', location: 'Patong', country: 'Thailand', lat: 7.8804, lng: 98.3923, price: 180, img: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5' },
      { name: 'Miami Beach Hotel', location: 'Miami Beach', country: 'USA', lat: 25.7907, lng: -80.1300, price: 280, img: 'https://images.unsplash.com/photo-1533903345306-15d1c30952de' },
      { name: 'Cancun Resort', location: 'Cancún', country: 'Mexico', lat: 21.1619, lng: -86.8515, price: 220, img: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1' },
      { name: 'Bora Bora Bungalow', location: 'Vaitape', country: 'French Polynesia', lat: -16.5004, lng: -151.7415, price: 550, img: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3' },
      { name: 'Seychelles Beach Villa', location: 'Victoria', country: 'Seychelles', lat: -4.6796, lng: 55.4920, price: 480, img: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482' },
      { name: 'Fiji Island Resort', location: 'Nadi', country: 'Fiji', lat: -17.7765, lng: 177.4417, price: 390, img: 'https://images.unsplash.com/photo-1571757767119-68b8dbed8c97' },
      { name: 'Amalfi Coast House', location: 'Positano', country: 'Italy', lat: 40.6280, lng: 14.4850, price: 350, img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64' },
      { name: 'Hawaii Beach Villa', location: 'Maui', country: 'USA', lat: 20.7984, lng: -156.3319, price: 420, img: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19' },
      { name: 'Costa Rica Beach', location: 'Tamarindo', country: 'Costa Rica', lat: 10.2988, lng: -85.8391, price: 195, img: 'https://images.unsplash.com/photo-1621277224630-81a3e6f6e8f7' },
      { name: 'Zanzibar Resort', location: 'Nungwi', country: 'Tanzania', lat: -5.7263, lng: 39.2903, price: 310, img: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f' },
      { name: 'Barbados Beach House', location: 'Bridgetown', country: 'Barbados', lat: 13.0969, lng: -59.6145, price: 380, img: 'https://images.unsplash.com/photo-1580541631950-7282082b53ce' },
      { name: 'Mauritius Paradise', location: 'Grand Baie', country: 'Mauritius', lat: -20.0105, lng: 57.5801, price: 440, img: 'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f' },
    ];

    const mountainDestinations = [
      { name: 'Swiss Alps Chalet', location: 'Zermatt', country: 'Switzerland', lat: 45.9763, lng: 7.6586, price: 280, img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4' },
      { name: 'Aspen Lodge', location: 'Aspen', country: 'USA', lat: 39.1911, lng: -106.8175, price: 420, img: 'https://images.unsplash.com/photo-1605540436563-5bca919ae766' },
      { name: 'Chamonix Cabin', location: 'Chamonix', country: 'France', lat: 45.9237, lng: 6.8694, price: 310, img: 'https://images.unsplash.com/photo-1551524164-687a55dd1126' },
      { name: 'Whistler Retreat', location: 'Whistler', country: 'Canada', lat: 50.1163, lng: -122.9574, price: 340, img: 'https://images.unsplash.com/photo-1605540436563-5bca919ae766' },
      { name: 'Dolomites Hideaway', location: 'Cortina', country: 'Italy', lat: 46.5369, lng: 12.1357, price: 290, img: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e' },
      { name: 'Patagonia Lodge', location: 'El Chaltén', country: 'Argentina', lat: -49.3314, lng: -72.8860, price: 260, img: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5' },
      { name: 'Banff Mountain House', location: 'Banff', country: 'Canada', lat: 51.1784, lng: -115.5708, price: 300, img: 'https://images.unsplash.com/photo-1542224566-6e85f2e6772f' },
      { name: 'Interlaken Chalet', location: 'Interlaken', country: 'Switzerland', lat: 46.6863, lng: 7.8632, price: 330, img: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7' },
      { name: 'Queenstown Villa', location: 'Queenstown', country: 'New Zealand', lat: -45.0312, lng: 168.6626, price: 370, img: 'https://images.unsplash.com/photo-1589802829985-817e51171b92' },
      { name: 'Innsbruck Lodge', location: 'Innsbruck', country: 'Austria', lat: 47.2692, lng: 11.4041, price: 270, img: 'https://images.unsplash.com/photo-1551632811-561732d1e306' },
      { name: 'Himalaya Retreat', location: 'Manali', country: 'India', lat: 32.2396, lng: 77.1887, price: 140, img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23' },
      { name: 'Rocky Mountains Cabin', location: 'Estes Park', country: 'USA', lat: 40.3772, lng: -105.5217, price: 295, img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b' },
      { name: 'Andes Mountain Lodge', location: 'Cusco', country: 'Peru', lat: -13.5319, lng: -71.9675, price: 175, img: 'https://images.unsplash.com/photo-1526392060635-9d6019884377' },
      { name: 'Pyrenees Chalet', location: 'Andorra la Vella', country: 'Andorra', lat: 42.5063, lng: 1.5218, price: 245, img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4' },
      { name: 'Carpathian Lodge', location: 'Zakopane', country: 'Poland', lat: 49.2992, lng: 19.9496, price: 165, img: 'https://images.unsplash.com/photo-1605540436563-5bca919ae766' },
    ];

    const cityDestinations = [
      { name: 'Tokyo City Hotel', location: 'Shibuya', country: 'Japan', lat: 35.6762, lng: 139.6503, price: 120, img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf' },
      { name: 'Paris Apartment', location: 'Marais', country: 'France', lat: 48.8566, lng: 2.3522, price: 250, img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34' },
      { name: 'New York Loft', location: 'Manhattan', country: 'USA', lat: 40.7128, lng: -74.0060, price: 380, img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9' },
      { name: 'London Flat', location: 'Soho', country: 'UK', lat: 51.5074, lng: -0.1278, price: 290, img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad' },
      { name: 'Barcelona Suite', location: 'Gothic Quarter', country: 'Spain', lat: 41.3851, lng: 2.1734, price: 200, img: 'https://images.unsplash.com/photo-1583422409516-2895a77efded' },
      { name: 'Dubai Penthouse', location: 'Downtown', country: 'UAE', lat: 25.2048, lng: 55.2708, price: 450, img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c' },
      { name: 'Singapore Hotel', location: 'Marina Bay', country: 'Singapore', lat: 1.3521, lng: 103.8198, price: 280, img: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd' },
      { name: 'Rome Apartment', location: 'Trastevere', country: 'Italy', lat: 41.9028, lng: 12.4964, price: 220, img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5' },
      { name: 'Amsterdam Canal House', location: 'Jordaan', country: 'Netherlands', lat: 52.3676, lng: 4.8852, price: 240, img: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017' },
      { name: 'Berlin Loft', location: 'Kreuzberg', country: 'Germany', lat: 52.5200, lng: 13.4050, price: 180, img: 'https://images.unsplash.com/photo-1560969184-10fe8719e047' },
      { name: 'Sydney Apartment', location: 'Darling Harbour', country: 'Australia', lat: -33.8688, lng: 151.2093, price: 310, img: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9' },
      { name: 'Hong Kong Suite', location: 'Central', country: 'Hong Kong', lat: 22.2783, lng: 114.1747, price: 420, img: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1' },
      { name: 'Istanbul Flat', location: 'Beyoğlu', country: 'Turkey', lat: 41.0082, lng: 28.9784, price: 165, img: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200' },
      { name: 'Seoul Hotel', location: 'Gangnam', country: 'South Korea', lat: 37.5665, lng: 126.9780, price: 195, img: 'https://images.unsplash.com/photo-1601024445121-e5b82f020549' },
      { name: 'Prague Apartment', location: 'Old Town', country: 'Czech Republic', lat: 50.0755, lng: 14.4378, price: 175, img: 'https://images.unsplash.com/photo-1541849546-216549ae216d' },
      { name: 'Lisbon Loft', location: 'Alfama', country: 'Portugal', lat: 38.7223, lng: -9.1393, price: 210, img: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a' },
      { name: 'Vienna Suite', location: 'Innere Stadt', country: 'Austria', lat: 48.2082, lng: 16.3738, price: 265, img: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af' },
      { name: 'Copenhagen Flat', location: 'Nyhavn', country: 'Denmark', lat: 55.6761, lng: 12.5683, price: 305, img: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc' },
      { name: 'Stockholm Apartment', location: 'Gamla Stan', country: 'Sweden', lat: 59.3293, lng: 18.0686, price: 285, img: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11' },
      { name: 'Buenos Aires Loft', location: 'Palermo', country: 'Argentina', lat: -34.6037, lng: -58.3816, price: 155, img: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849' },
    ];

    const countrysideDestinations = [
      { name: 'Tuscany Farmhouse', location: 'Chianti', country: 'Italy', lat: 43.5455, lng: 11.2558, price: 230, img: 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216' },
      { name: 'Provence Villa', location: 'Luberon', country: 'France', lat: 43.8345, lng: 5.2515, price: 270, img: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a' },
      { name: 'Irish Cottage', location: 'Connemara', country: 'Ireland', lat: 53.5444, lng: -9.7489, price: 160, img: 'https://images.unsplash.com/photo-1590004953392-5aba2e72269a' },
      { name: 'Scottish Highlands Lodge', location: 'Inverness', country: 'Scotland', lat: 57.4778, lng: -4.2247, price: 190, img: 'https://images.unsplash.com/photo-1552084162-ec07b3f162dc' },
      { name: 'Cotswolds Manor', location: 'Bibury', country: 'UK', lat: 51.7645, lng: -1.8200, price: 250, img: 'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f' },
      { name: 'Napa Valley Estate', location: 'Napa', country: 'USA', lat: 38.2975, lng: -122.2869, price: 320, img: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb' },
      { name: 'Bordeaux Château', location: 'Saint-Émilion', country: 'France', lat: 44.8944, lng: -0.1557, price: 340, img: 'https://images.unsplash.com/photo-1584738766473-61c083514bf4' },
      { name: 'Alentejo Farm', location: 'Évora', country: 'Portugal', lat: 38.5714, lng: -7.9087, price: 170, img: 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72' },
      { name: 'Vermont Farmhouse', location: 'Stowe', country: 'USA', lat: 44.4654, lng: -72.6874, price: 200, img: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791' },
      { name: 'Lake District Cottage', location: 'Windermere', country: 'UK', lat: 54.3800, lng: -2.9080, price: 210, img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d' },
      { name: 'Andalusia Finca', location: 'Ronda', country: 'Spain', lat: 36.7423, lng: -5.1676, price: 215, img: 'https://images.unsplash.com/photo-1568084680786-a84f91d1153c' },
      { name: 'Umbria Villa', location: 'Assisi', country: 'Italy', lat: 43.0708, lng: 12.6172, price: 255, img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945' },
      { name: 'Douro Valley Estate', location: 'Peso da Régua', country: 'Portugal', lat: 41.1638, lng: -7.7875, price: 280, img: 'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f' },
      { name: 'Normandy Farmhouse', location: 'Honfleur', country: 'France', lat: 49.4186, lng: 0.2330, price: 235, img: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a' },
      { name: 'Sonoma Ranch', location: 'Healdsburg', country: 'USA', lat: 38.6102, lng: -122.8694, price: 350, img: 'https://images.unsplash.com/photo-1560184897-ae75f418493e' },
      { name: 'Bavaria Cottage', location: 'Garmisch', country: 'Germany', lat: 47.4924, lng: 11.0955, price: 225, img: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791' },
      { name: 'Welsh Farmhouse', location: 'Snowdonia', country: 'Wales', lat: 53.0685, lng: -3.9247, price: 185, img: 'https://images.unsplash.com/photo-1590004953392-5aba2e72269a' },
      { name: 'Oregon Ranch', location: 'Willamette Valley', country: 'USA', lat: 44.8458, lng: -123.1107, price: 265, img: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb' },
      { name: 'Dordogne Villa', location: 'Sarlat', country: 'France', lat: 44.8912, lng: 1.2161, price: 295, img: 'https://images.unsplash.com/photo-1584738766473-61c083514bf4' },
      { name: 'New Zealand Farm', location: 'Wanaka', country: 'New Zealand', lat: -44.7034, lng: 169.1322, price: 240, img: 'https://images.unsplash.com/photo-1589802829985-817e51171b92' },
    ];

    const allLocations = [
      ...beachDestinations.map((d, i) => ({ ...d, category: 'beach' as const, id: `beach-${i + 1}` })),
      ...mountainDestinations.map((d, i) => ({ ...d, category: 'mountain' as const, id: `mountain-${i + 1}` })),
      ...cityDestinations.map((d, i) => ({ ...d, category: 'city' as const, id: `city-${i + 1}` })),
      ...countrysideDestinations.map((d, i) => ({ ...d, category: 'countryside' as const, id: `countryside-${i + 1}` })),
    ];

    const amenitiesByCategory = {
      beach: ['WiFi', 'Pool', 'Beach Access', 'Restaurant', 'Spa', 'Bar', 'Water Sports', 'Gym'],
      mountain: ['WiFi', 'Fireplace', 'Ski Storage', 'Hot Tub', 'Mountain View', 'Hiking Trails', 'Restaurant'],
      city: ['WiFi', 'Gym', 'Restaurant', 'Bar', 'City View', 'Concierge', 'Business Center', 'Rooftop'],
      countryside: ['WiFi', 'Garden', 'Terrace', 'Kitchen', 'Fireplace', 'BBQ', 'Wine Cellar', 'Bike Rental'],
    };

    for (const loc of allLocations) {
      const rating = +(Math.random() * 1.5 + 3.5).toFixed(1);
      const reviewCount = Math.floor(Math.random() * 400) + 50;
      const amenities = amenitiesByCategory[loc.category]
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);

      destinations.push({
        id: loc.id,
        name: loc.name,
        location: loc.location,
        country: loc.country,
        rating,
        reviewCount,
        price: loc.price,
        currency: 'USD',
        imageUrl: `${loc.img}?w=800&q=80`,
        images: [
          `${loc.img}?w=800&q=80`,
          `${loc.img}?w=800&q=80&sat=-100`,
          `${loc.img}?w=800&q=80&brightness=10`,
        ],
        description: `Experience luxury ${loc.category} living with stunning views and world-class amenities in ${loc.location}, ${loc.country}.`,
        amenities,
        category: loc.category,
        coordinates: {
          latitude: loc.lat,
          longitude: loc.lng,
        },
      });
    }

    return destinations;
  }

  async getAllDestinations() {
    if (!this.db) throw new Error('Database not initialized');
    
    const rows = await this.db.getAllAsync<any>('SELECT * FROM destinations ORDER BY rating DESC');
    
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      location: row.location,
      country: row.country,
      rating: row.rating,
      reviewCount: row.review_count,
      price: row.price,
      currency: row.currency,
      imageUrl: row.image_url,
      images: JSON.parse(row.images),
      description: row.description,
      amenities: JSON.parse(row.amenities),
      category: row.category,
      isFavorite: false,
      availableDates: [],
      coordinates: {
        latitude: row.latitude,
        longitude: row.longitude,
      },
    }));
  }

  async getDestinationsByCategory(category: string) {
    if (!this.db) throw new Error('Database not initialized');
    
    if (category === 'all') {
      return this.searchDestinations('', {});
    }

    const rows = await this.db.getAllAsync<any>(
      `SELECT 
        d.*,
        COALESCE(AVG(r.rating), d.rating) as actual_rating,
        COUNT(r.id) as actual_review_count
       FROM destinations d
       LEFT JOIN reviews r ON d.id = r.destination_id
       WHERE d.category = ?
       GROUP BY d.id
       ORDER BY actual_rating DESC`,
      [category]
    );
    
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      location: row.location,
      country: row.country,
      rating: parseFloat(row.actual_rating.toFixed(1)),
      reviewCount: row.actual_review_count,
      price: row.price,
      currency: row.currency,
      imageUrl: row.image_url,
      images: JSON.parse(row.images),
      description: row.description,
      amenities: JSON.parse(row.amenities),
      category: row.category,
      isFavorite: false,
      availableDates: [],
      coordinates: {
        latitude: row.latitude,
        longitude: row.longitude,
      },
    }));
  }

  async searchDestinations(
    query: string,
    filters?: {
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      minRating?: number;
      amenities?: string[];
      sortBy?: 'rating' | 'price_asc' | 'price_desc' | 'name';
    }
  ) {
    if (!this.db) throw new Error('Database not initialized');
    
    let sql = `
      SELECT 
        d.*,
        COALESCE(AVG(r.rating), d.rating) as actual_rating,
        COUNT(r.id) as actual_review_count
      FROM destinations d
      LEFT JOIN reviews r ON d.id = r.destination_id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Recherche textuelle intelligente
    if (query && query.trim()) {
      const searchQuery = `%${query.toLowerCase()}%`;
      sql += ` AND (
        LOWER(d.name) LIKE ? 
        OR LOWER(d.location) LIKE ? 
        OR LOWER(d.country) LIKE ?
        OR LOWER(d.description) LIKE ?
      )`;
      params.push(searchQuery, searchQuery, searchQuery, searchQuery);
    }

    // Filtre catégorie
    if (filters?.category && filters.category !== 'all') {
      sql += ' AND d.category = ?';
      params.push(filters.category);
    }

    // Filtre prix
    if (filters?.minPrice !== undefined) {
      sql += ' AND d.price >= ?';
      params.push(filters.minPrice);
    }
    if (filters?.maxPrice !== undefined) {
      sql += ' AND d.price <= ?';
      params.push(filters.maxPrice);
    }

    // Filtre amenities (recherche JSON)
    if (filters?.amenities && filters.amenities.length > 0) {
      const amenityConditions = filters.amenities.map(() => 'd.amenities LIKE ?').join(' AND ');
      sql += ` AND (${amenityConditions})`;
      filters.amenities.forEach(amenity => {
        params.push(`%"${amenity}"%`);
      });
    }

    sql += ' GROUP BY d.id';

    // Filtre rating (après GROUP BY)
    if (filters?.minRating !== undefined) {
      sql += ' HAVING actual_rating >= ?';
      params.push(filters.minRating);
    }

    // Tri
    switch (filters?.sortBy) {
      case 'price_asc':
        sql += ' ORDER BY d.price ASC';
        break;
      case 'price_desc':
        sql += ' ORDER BY d.price DESC';
        break;
      case 'name':
        sql += ' ORDER BY d.name ASC';
        break;
      case 'rating':
      default:
        sql += ' ORDER BY actual_rating DESC, actual_review_count DESC';
        break;
    }

    const rows = await this.db.getAllAsync<any>(sql, params);
    
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      location: row.location,
      country: row.country,
      rating: parseFloat(row.actual_rating.toFixed(1)),
      reviewCount: row.actual_review_count,
      price: row.price,
      currency: row.currency,
      imageUrl: row.image_url,
      images: JSON.parse(row.images),
      description: row.description,
      amenities: JSON.parse(row.amenities),
      category: row.category,
      isFavorite: false,
      availableDates: [],
      coordinates: {
        latitude: row.latitude,
        longitude: row.longitude,
      },
    }));
  }

  async getDestinationById(id: string) {
    if (!this.db) throw new Error('Database not initialized');
    
    const row = await this.db.getFirstAsync<any>(
      `SELECT 
        d.*,
        COALESCE(AVG(r.rating), d.rating) as actual_rating,
        COUNT(r.id) as actual_review_count
       FROM destinations d
       LEFT JOIN reviews r ON d.id = r.destination_id
       WHERE d.id = ?
       GROUP BY d.id`,
      [id]
    );
    
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      location: row.location,
      country: row.country,
      rating: parseFloat(row.actual_rating.toFixed(1)),
      reviewCount: row.actual_review_count,
      price: row.price,
      currency: row.currency,
      imageUrl: row.image_url,
      images: JSON.parse(row.images),
      description: row.description,
      amenities: JSON.parse(row.amenities),
      category: row.category,
      isFavorite: false,
      availableDates: [],
      coordinates: {
        latitude: row.latitude,
        longitude: row.longitude,
      },
    };
  }

  async getFavorites(): Promise<string[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const rows = await this.db.getAllAsync<{ destination_id: string }>(
      'SELECT destination_id FROM favorites'
    );
    
    return rows.map((row) => row.destination_id);
  }

  async addFavorite(destinationId: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      await this.db.runAsync(
        'INSERT OR IGNORE INTO favorites (destination_id) VALUES (?)',
        [destinationId]
      );
      return true;
    } catch (error) {
      if (__DEV__) console.error('Error adding favorite:', error);
      return false;
    }
  }

  async removeFavorite(destinationId: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      await this.db.runAsync(
        'DELETE FROM favorites WHERE destination_id = ?',
        [destinationId]
      );
      return true;
    } catch (error) {
      if (__DEV__) console.error('Error removing favorite:', error);
      return false;
    }
  }

  async getUserProfile() {
    if (!this.db) throw new Error('Database not initialized');
    
    const row = await this.db.getFirstAsync<any>(
      'SELECT * FROM user_profile LIMIT 1'
    );
    
    if (!row) return null;

    return {
      name: row.name,
      email: row.email,
      phone: row.phone,
      avatar: row.avatar,
      bio: row.bio,
      location: row.location,
    };
  }

  async saveUserProfile(profile: {
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    bio?: string;
    location?: string;
  }): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      await this.db.runAsync(
        `INSERT INTO user_profile (id, name, email, phone, avatar, bio, location, updated_at) 
         VALUES (1, ?, ?, ?, ?, ?, ?, strftime('%s', 'now'))
         ON CONFLICT(id) DO UPDATE SET
           name = excluded.name,
           email = excluded.email,
           phone = excluded.phone,
           avatar = excluded.avatar,
           bio = excluded.bio,
           location = excluded.location,
           updated_at = strftime('%s', 'now')`,
        [profile.name, profile.email, profile.phone || null, profile.avatar || null,
         profile.bio || null, profile.location || null]
      );
      return true;
    } catch (error) {
      if (__DEV__) console.error('Error saving user profile:', error);
      return false;
    }
  }

  async updateUserAvatar(avatarUri: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      await this.db.runAsync(
        `UPDATE user_profile SET avatar = ?, updated_at = strftime('%s', 'now') WHERE id = 1`,
        [avatarUri]
      );
      return true;
    } catch (error) {
      if (__DEV__) console.error('Error updating avatar:', error);
      return false;
    }
  }

  private generateReviews(destinationIds: string[]): {
    id: string;
    destinationId: string;
    userName: string;
    userAvatar: string;
    rating: number;
    comment: string;
    createdAt: number;
  }[] {
    const reviews: {
      id: string;
      destinationId: string;
      userName: string;
      userAvatar: string;
      rating: number;
      comment: string;
      createdAt: number;
    }[] = [];
    const userNames = [
      'Sarah Johnson', 'Michael Chen', 'Emma Williams', 'David Martinez', 'Sophie Anderson',
      'James Brown', 'Olivia Taylor', 'Lucas Garcia', 'Isabella Rodriguez', 'Noah Wilson',
      'Ava Thompson', 'Ethan Moore', 'Mia Jackson', 'Alexander Lee', 'Charlotte Harris',
      'William Clark', 'Amelia Lewis', 'Benjamin Walker', 'Harper Hall', 'Daniel Allen'
    ];

    const comments = {
      5: [
        'Absolutely amazing experience! Everything was perfect from start to finish.',
        'Best vacation ever! The place exceeded all our expectations.',
        'Stunning location with incredible amenities. Highly recommend!',
        'Perfect getaway! Will definitely come back again.',
        'Outstanding service and beautiful surroundings. 5 stars!',
      ],
      4: [
        'Great place with minor room for improvement. Overall very satisfied.',
        'Really enjoyed our stay. Good value for money.',
        'Nice location and friendly staff. Would recommend.',
        'Very good experience, just a few small issues.',
        'Lovely place, almost perfect!',
      ],
      3: [
        'Decent place, met our basic expectations.',
        'Average experience. Nothing special but okay.',
        'Good location but some facilities need updating.',
        'Fair value. Some aspects were good, others not so much.',
        'Acceptable stay, could be better.',
      ],
      2: [
        'Disappointed with several aspects. Not worth the price.',
        'Below expectations. Several issues during our stay.',
        'Not as advertised. Needs significant improvements.',
        'Poor service and maintenance issues.',
        'Would not recommend. Many problems.',
      ],
      1: [
        'Terrible experience. Do not book!',
        'Worst vacation ever. Complete waste of money.',
        'Horrible conditions and terrible service.',
        'Avoid at all costs. Major issues throughout.',
        'Extremely disappointed. Nothing worked as promised.',
      ],
    };

    // Générer 3-8 reviews par destination
    destinationIds.forEach((destId) => {
      const reviewCount = Math.floor(Math.random() * 6) + 3; // 3 à 8 reviews
      
      for (let i = 0; i < reviewCount; i++) {
        const rating = Math.floor(Math.random() * 5) + 1; // 1 à 5
        const userName = userNames[Math.floor(Math.random() * userNames.length)];
        const commentList = comments[rating as keyof typeof comments];
        const comment = commentList[Math.floor(Math.random() * commentList.length)];
        
        // Date aléatoire dans les 6 derniers mois
        const daysAgo = Math.floor(Math.random() * 180);
        const createdAt = Math.floor(Date.now() / 1000) - (daysAgo * 24 * 60 * 60);
        
        reviews.push({
          id: `review_${destId}_${i}`,
          destinationId: destId,
          userName,
          userAvatar: `https://i.pravatar.cc/150?u=${userName}`,
          rating,
          comment,
          createdAt,
        });
      }
    });

    return reviews;
  }

  private generateHosts(destinationIds: string[]): {
    id: string;
    destinationId: string;
    firstName: string;
    lastName: string;
    persona: string;
    avatar: string;
  }[] {
    const hosts: {
      id: string;
      destinationId: string;
      firstName: string;
      lastName: string;
      persona: string;
      avatar: string;
    }[] = [];

    const firstNames = [
      'Sophie', 'Marco', 'Elena', 'Lucas', 'Maria', 'Pierre', 'Isabella', 'Jean',
      'Carmen', 'André', 'Lucia', 'François', 'Ana', 'Henri', 'Rosa', 'Michel',
      'Gabriela', 'Antoine', 'Valentina', 'Philippe', 'Chiara', 'Laurent', 'Nina',
      'Olivier', 'Alessia', 'Thomas', 'Camila', 'Nicolas', 'Sofia', 'Alexandre'
    ];

    const lastNames = [
      'Dubois', 'Garcia', 'Rossi', 'Silva', 'Martinez', 'Bernard', 'Lopez', 'Moreau',
      'Rodriguez', 'Petit', 'Fernandez', 'Blanc', 'Gonzalez', 'Rousseau', 'Santos',
      'Vincent', 'Perez', 'Leroy', 'Costa', 'Girard', 'Alves', 'Bonnet', 'Oliveira'
    ];

    const personaTemplates = [
      "Je suis un hôte passionné par l'hospitalité et le partage de ma région. J'adore rencontrer des voyageurs du monde entier et leur faire découvrir les trésors cachés de ma destination. Toujours disponible pour des recommandations personnalisées !",
      "Propriétaire depuis plus de 10 ans, j'ai à cœur d'offrir une expérience authentique et mémorable. Je connais tous les meilleurs restaurants, plages secrètes et activités locales. N'hésitez pas à me demander conseil !",
      "Ancien guide touristique reconverti dans l'hébergement, je mets mon expertise au service de mes hôtes. Je suis chaleureux, attentif aux détails et toujours prêt à rendre votre séjour inoubliable.",
      "Passionné de voyages moi-même, je comprends l'importance d'un bon accueil. Je suis réactif, flexible et j'aime créer une atmosphère conviviale. Mon objectif : que vous vous sentiez comme chez vous !",
      "Natif de la région, je suis fier de partager mon coin de paradis avec les visiteurs. Je privilégie les échanges authentiques et les recommandations hors des sentiers battus. Contactez-moi pour des conseils d'initiés !",
      "Hôte expérimenté et polyglotte, j'accueille des voyageurs depuis de nombreuses années. Je suis organisé, professionnel et toujours à l'écoute. Votre confort et votre satisfaction sont ma priorité.",
      "Amoureux de ma ville/région, je suis enthousiaste à l'idée de vous faire découvrir ses merveilles. Je suis disponible, souriant et j'adore partager mes bons plans. Bienvenue chez moi !",
      "Hôte attentionné avec une passion pour la gastronomie locale et la culture. Je peux vous recommander les meilleures expériences culinaires et culturelles. Toujours ravi d'échanger et de vous aider !",
    ];

    destinationIds.forEach((destId, index) => {
      const firstName = firstNames[index % firstNames.length];
      const lastName = lastNames[index % lastNames.length];
      const persona = personaTemplates[index % personaTemplates.length];
      
      hosts.push({
        id: `host_${destId}`,
        destinationId: destId,
        firstName,
        lastName,
        persona,
        avatar: `https://i.pravatar.cc/150?u=${firstName}${lastName}`,
      });
    });

    return hosts;
  }

  async getReviewsByDestination(destinationId: string, ratingFilter?: number) {
    if (!this.db) throw new Error('Database not initialized');
    
    let sql = 'SELECT * FROM reviews WHERE destination_id = ?';
    const params: any[] = [destinationId];
    
    if (ratingFilter) {
      sql += ' AND rating = ?';
      params.push(ratingFilter);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const rows = await this.db.getAllAsync<any>(sql, params);
    
    return rows.map((row) => ({
      id: row.id,
      destinationId: row.destination_id,
      userName: row.user_name,
      userAvatar: row.user_avatar,
      rating: row.rating,
      comment: row.comment,
      createdAt: row.created_at,
    }));
  }

  async getReviewStats(destinationId: string) {
    if (!this.db) throw new Error('Database not initialized');
    
    const stats = await this.db.getFirstAsync<any>(
      `SELECT 
        COUNT(*) as total,
        AVG(rating) as average,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
       FROM reviews WHERE destination_id = ?`,
      [destinationId]
    );
    
    return {
      total: stats?.total || 0,
      average: stats?.average || 0,
      distribution: {
        5: stats?.five_star || 0,
        4: stats?.four_star || 0,
        3: stats?.three_star || 0,
        2: stats?.two_star || 0,
        1: stats?.one_star || 0,
      },
    };
  }

  async getHostByDestinationId(destinationId: string) {
    if (!this.db) throw new Error('Database not initialized');
    
    const row = await this.db.getFirstAsync<any>(
      'SELECT * FROM hosts WHERE destination_id = ?',
      [destinationId]
    );
    
    if (!row) return null;

    return {
      id: row.id,
      destinationId: row.destination_id,
      firstName: row.first_name,
      lastName: row.last_name,
      persona: row.persona,
      avatar: row.avatar,
    };
  }

  async getChatMessages(destinationId: string) {
    if (!this.db) throw new Error('Database not initialized');
    
    const rows = await this.db.getAllAsync<any>(
      'SELECT * FROM chat_messages WHERE destination_id = ? ORDER BY timestamp ASC',
      [destinationId]
    );
    
    return rows.map((row) => ({
      id: row.id,
      destinationId: row.destination_id,
      role: row.role as 'user' | 'assistant',
      content: row.content,
      timestamp: row.timestamp,
    }));
  }

  async saveChatMessage(
    destinationId: string,
    role: 'user' | 'assistant',
    content: string
  ): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');
    
    const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Math.floor(Date.now() / 1000);
    
    await this.db.runAsync(
      'INSERT INTO chat_messages (id, destination_id, role, content, timestamp) VALUES (?, ?, ?, ?, ?)',
      [id, destinationId, role, content, timestamp]
    );
    
    return id;
  }

  async clearChatMessages(destinationId: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      await this.db.runAsync(
        'DELETE FROM chat_messages WHERE destination_id = ?',
        [destinationId]
      );
      return true;
    } catch (error) {
      if (__DEV__) console.error('Error clearing chat messages:', error);
      return false;
    }
  }

  async getActiveConversations() {
    if (!this.db) throw new Error('Database not initialized');
    
    const rows = await this.db.getAllAsync<any>(
      `SELECT 
        d.id as destination_id,
        d.name as destination_name,
        d.image_url as destination_image,
        h.first_name as host_first_name,
        h.last_name as host_last_name,
        h.avatar as host_avatar,
        cm.content as last_message,
        cm.role as last_message_role,
        cm.timestamp as last_message_time,
        COUNT(cm2.id) as message_count
       FROM chat_messages cm
       INNER JOIN destinations d ON cm.destination_id = d.id
       INNER JOIN hosts h ON d.id = h.destination_id
       LEFT JOIN chat_messages cm2 ON cm.destination_id = cm2.destination_id
       WHERE cm.timestamp = (
         SELECT MAX(timestamp) 
         FROM chat_messages 
         WHERE destination_id = cm.destination_id
       )
       GROUP BY d.id
       ORDER BY cm.timestamp DESC`
    );
    
    return rows.map((row) => ({
      destinationId: row.destination_id,
      destinationName: row.destination_name,
      destinationImage: row.destination_image,
      hostFirstName: row.host_first_name,
      hostLastName: row.host_last_name,
      hostAvatar: row.host_avatar,
      lastMessage: row.last_message,
      lastMessageRole: row.last_message_role as 'user' | 'assistant',
      lastMessageTime: row.last_message_time,
      messageCount: row.message_count,
    }));
  }

  async createBooking(booking: Booking): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(
        `INSERT INTO bookings (
          id, destination_id, user_id, check_in_date, check_out_date,
          guests, total_price, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          booking.id,
          booking.destinationId,
          booking.userId,
          booking.checkInDate.toISOString(),
          booking.checkOutDate.toISOString(),
          booking.guests,
          booking.totalPrice,
          booking.status,
          booking.createdAt.toISOString(),
        ]
      );
    } catch (error) {
      if (__DEV__) console.error('Error creating booking:', error);
      throw error;
    }
  }

  async getBookings(): Promise<Booking[]> {
    if (!this.db) throw new Error('Database not initialized');

    const rows = await this.db.getAllAsync<any>(
      'SELECT * FROM bookings ORDER BY created_at DESC'
    );

    return rows.map((row) => ({
      id: row.id,
      destinationId: row.destination_id,
      userId: row.user_id,
      checkInDate: new Date(row.check_in_date),
      checkOutDate: new Date(row.check_out_date),
      guests: row.guests,
      totalPrice: row.total_price,
      status: row.status as Booking['status'],
      createdAt: new Date(row.created_at),
    }));
  }

  async updateBookingStatus(id: string, status: Booking['status']): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(
        'UPDATE bookings SET status = ? WHERE id = ?',
        [status, id]
      );
    } catch (error) {
      if (__DEV__) console.error('Error updating booking status:', error);
      throw error;
    }
  }

  async deleteBooking(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync('DELETE FROM bookings WHERE id = ?', [id]);
    } catch (error) {
      if (__DEV__) console.error('Error deleting booking:', error);
      throw error;
    }
  }
}

const databaseService = DatabaseService.getInstance();
export default databaseService;
