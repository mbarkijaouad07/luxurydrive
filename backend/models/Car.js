module.exports = (sequelize, DataTypes) => {
  const Car = sequelize.define('Car', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    brand: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    model: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1990, max: 2030 }
    },
    pricePerDay: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 }
    },
    images: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fuelType: {
      type: DataTypes.ENUM('diesel', 'petrol', 'electric', 'hybrid'),
      allowNull: false
    },
    transmission: {
      type: DataTypes.ENUM('manual', 'automatic'),
      allowNull: false
    },
    availability: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    seats: {
      type: DataTypes.INTEGER,
      defaultValue: 5
    },
    doors: {
      type: DataTypes.INTEGER,
      defaultValue: 4
    },
    mileage: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    horsepower: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    category: {
      type: DataTypes.ENUM('sedan', 'suv', 'sports', 'luxury', 'electric', 'convertible', 'pickup'),
      defaultValue: 'sedan'
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0
    },
    totalReviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'cars',
    timestamps: true
  });

  return Car;
};
