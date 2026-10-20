const db = require('../models');

const { Op } = require('sequelize');

exports.createReview = async (req, res) => {
  try {
    const { carId, bookingId, rating, comment, title } = req.body;
    const car = await db.Car.findByPk(carId);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found.' });

    if (bookingId) {
      const booking = await db.Booking.findOne({ where: { id: bookingId, userId: req.user.id, carId } });
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
      if (booking.isReviewed) return res.status(409).json({ success: false, message: 'Already reviewed this booking.' });
      
      const review = await db.Review.create({ userId: req.user.id, carId, bookingId, rating, comment, title });
      await booking.update({ isReviewed: true });
    } else {
      return res.status(400).json({ success: false, message: 'Booking ID is required to leave a review.' });
    }

    // Update car rating
    const reviews = await db.Review.findAll({ where: { carId }, attributes: ['rating'] });
    const avg = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
    await car.update({ rating: avg.toFixed(2), totalReviews: reviews.length });

    const populated = await db.Review.findOne({
      where: { userId: req.user.id, carId, bookingId },
      include: [{ model: db.User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'avatar'] }]
    });
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPendingReview = async (req, res) => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const pendingBooking = await db.Booking.findOne({
      where: {
        userId: req.user.id,
        status: { [Op.in]: ['confirmed', 'completed'] },
        isReviewed: false,
        endDate: { [Op.lt]: todayStr }
      },
      include: [{ model: db.Car, as: 'car', attributes: ['id', 'title', 'images'] }],
      order: [['endDate', 'ASC']]
    });

    res.json({ success: true, data: pendingBooking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCarReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await db.Review.findAndCountAll({
      where: { carId: req.params.carId },
      include: [{ model: db.User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'avatar'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });
    res.json({ success: true, data: rows, pagination: { total: count, page: parseInt(page) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const review = await db.Review.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    await review.update(req.body);

    const reviews = await db.Review.findAll({ where: { carId: review.carId }, attributes: ['rating'] });
    const avg = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
    await db.Car.update({ rating: avg.toFixed(2), totalReviews: reviews.length }, { where: { id: review.carId } });

    res.json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await db.Review.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    const carId = review.carId;
    await review.destroy();
    const reviews = await db.Review.findAll({ where: { carId }, attributes: ['rating'] });
    const avg = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
    await db.Car.update({ rating: avg.toFixed(2), totalReviews: reviews.length }, { where: { id: carId } });
    res.json({ success: true, message: 'Review deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
