const { Op } = require('sequelize');
const db = require('../models');
const { deleteFile } = require('../utils/fileHelper');

exports.getCars = async (req, res) => {
  try {
    const {
      page = 1, limit = 12,
      brand, location, transmission, fuelType, category,
      minPrice, maxPrice, availability, search, featured, sort
    } = req.query;

    const where = {};
    if (brand)        where.brand        = { [Op.like]: `%${brand}%` };
    if (location)     where.location     = { [Op.like]: `%${location}%` };
    if (transmission) where.transmission = transmission;
    if (fuelType)     where.fuelType     = fuelType;
    if (category)     where.category     = category;
    if (featured)     where.featured     = featured === 'true';
    if (availability) where.availability = availability === 'true';
    if (minPrice || maxPrice) {
      where.pricePerDay = {};
      if (minPrice) where.pricePerDay[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.pricePerDay[Op.lte] = parseFloat(maxPrice);
    }
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { brand: { [Op.like]: `%${search}%` } },
        { model: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const order = [];
    if (sort === 'price_low') order.push(['pricePerDay', 'ASC']);
    else if (sort === 'price_high') order.push(['pricePerDay', 'DESC']);
    else order.push(['createdAt', 'DESC']);

    const today = new Date().toISOString().split('T')[0];
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await db.Car.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order,
      include: [
        {
          model: db.Booking,
          as: 'bookings',
          required: false,
          where: {
            status: 'confirmed',
            endDate: { [Op.gte]: today }
          },
          attributes: ['id']
        }
      ],
      distinct: true
    });

    const carsWithStatus = rows.map(car => {
      const plainCar = car.get({ plain: true });
      plainCar.isCurrentlyBooked = plainCar.bookings && plainCar.bookings.length > 0;
      delete plainCar.bookings;
      return plainCar;
    });

    res.json({
      success: true,
      data: carsWithStatus,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCarById = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const car = await db.Car.findByPk(req.params.id, {
      include: [
        {
          model: db.Review,
          as: 'reviews',
          include: [{ model: db.User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'avatar'] }],
          order: [['createdAt', 'DESC']],
          limit: 10
        },
        {
          model: db.Booking,
          as: 'bookings',
          required: false,
          where: {
            status: 'confirmed',
            endDate: { [Op.gte]: today }
          },
          attributes: ['id']
        }
      ]
    });
    if (!car) return res.status(404).json({ success: false, message: 'Car not found.' });

    const plainCar = car.get({ plain: true });
    plainCar.isCurrentlyBooked = plainCar.bookings && plainCar.bookings.length > 0;
    delete plainCar.bookings;

    const similar = await db.Car.findAll({
      where: {
        id: { [Op.ne]: car.id },
        [Op.or]: [{ brand: car.brand }, { category: car.category }]
      },
      limit: 4,
      order: [['rating', 'DESC']]
    });

    res.json({ success: true, data: plainCar, similar });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createCar = async (req, res) => {
  try {
    const carData = { ...req.body };
    if (req.files && req.files.length > 0) {
      carData.images = req.files.map(f => `/uploads/${f.filename}`);
    }
    if (typeof carData.images === 'string') {
      try { carData.images = JSON.parse(carData.images); } catch { carData.images = [carData.images]; }
    }
    const car = await db.Car.create(carData);
    res.status(201).json({ success: true, data: car });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateCar = async (req, res) => {
  try {
    const car = await db.Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found.' });

    const updates = { ...req.body };
    if (req.files && req.files.length > 0) {
      if (car.images && Array.isArray(car.images)) {
        car.images.forEach(img => deleteFile(img));
      }
      updates.images = req.files.map(f => `/uploads/${f.filename}`);
    }
    if (typeof updates.images === 'string') {
      try { updates.images = JSON.parse(updates.images); } catch { updates.images = [updates.images]; }
    }
    await car.update(updates);
    res.json({ success: true, data: car });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCar = async (req, res) => {
  try {
    const car = await db.Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found.' });
    if (car.images && Array.isArray(car.images)) {
      car.images.forEach(img => deleteFile(img));
    }
    await car.destroy();
    res.json({ success: true, message: 'Car deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getLocations = async (req, res) => {
  try {
    const locations = await db.Car.findAll({
      attributes: [[db.Sequelize.fn('DISTINCT', db.Sequelize.col('location')), 'location']],
      raw: true
    });
    res.json({ success: true, data: locations.map(l => l.location) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBrands = async (req, res) => {
  try {
    const brands = await db.Car.findAll({
      attributes: [[db.Sequelize.fn('DISTINCT', db.Sequelize.col('brand')), 'brand']],
      raw: true
    });
    res.json({ success: true, data: brands.map(b => b.brand) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
