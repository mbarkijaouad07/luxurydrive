const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT || 'sqlite',
  logging: false,
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
};

if (config.dialect === 'sqlite') {
  config.storage = process.env.DB_STORAGE || './database.sqlite';
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  config
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// ─── Models ────────────────────────────────────────────────────────────────────
db.User = require('./User')(sequelize, DataTypes);
db.Car = require('./Car')(sequelize, DataTypes);
db.Booking = require('./Booking')(sequelize, DataTypes);
db.Review = require('./Review')(sequelize, DataTypes);
db.Favorite = require('./Favorite')(sequelize, DataTypes);
db.Message = require('./Message')(sequelize, DataTypes);

// ─── Relationships ─────────────────────────────────────────────────────────────

// User ↔ Bookings (1-N)
db.User.hasMany(db.Booking, { foreignKey: 'userId', as: 'bookings' });
db.Booking.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// Car ↔ Bookings (1-N)
db.Car.hasMany(db.Booking, { foreignKey: 'carId', as: 'bookings' });
db.Booking.belongsTo(db.Car, { foreignKey: 'carId', as: 'car' });

// User ↔ Reviews (1-N)
db.User.hasMany(db.Review, { foreignKey: 'userId', as: 'reviews' });
db.Review.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// Car ↔ Reviews (1-N)
db.Car.hasMany(db.Review, { foreignKey: 'carId', as: 'reviews' });
db.Review.belongsTo(db.Car, { foreignKey: 'carId', as: 'car' });

// User ↔ Favorites (N-N through Favorite)
db.User.belongsToMany(db.Car, { through: db.Favorite, as: 'favoriteCars', foreignKey: 'userId' });
db.Car.belongsToMany(db.User, { through: db.Favorite, as: 'favoritedBy', foreignKey: 'carId' });

// User ↔ Messages (1-N)
db.User.hasMany(db.Message, { foreignKey: 'senderId', as: 'sentMessages' });
db.Message.belongsTo(db.User, { foreignKey: 'senderId', as: 'sender' });
db.Car.hasMany(db.Message, { foreignKey: 'carId', as: 'messages' });
db.Message.belongsTo(db.Car, { foreignKey: 'carId', as: 'car' });

module.exports = db;
