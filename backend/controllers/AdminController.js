const { Op } = require('sequelize');
const db = require('../models');

exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalCars, totalBookings, revenueResult] = await Promise.all([
      db.User.count({ where: { role: 'user' } }),
      db.Car.count(),
      db.Booking.count({ where: { status: { [Op.ne]: 'cancelled' } } }),
      db.Booking.sum('totalPrice', { where: { paymentStatus: 'paid' } })
    ]);

    const activeUsers = await db.User.count({ where: { role: 'user', isActive: true } });
    const pendingBookings = await db.Booking.count({ where: { status: 'pending' } });
    const confirmedBookings = await db.Booking.count({ where: { status: 'confirmed' } });
    const cancelledBookings = await db.Booking.count({ where: { status: 'cancelled' } });
    const totalAllBookings = await db.Booking.count();

    const popularCars = await db.Car.findAll({
      attributes: { include: [[db.Sequelize.fn('COUNT', db.Sequelize.col('bookings.id')), 'bookingCount']] },
      include: [{ model: db.Booking, as: 'bookings', attributes: [] }],
      group: ['Car.id'],
      order: [[db.Sequelize.literal('bookingCount'), 'DESC']],
      limit: 5,
      subQuery: false
    });

    // Monthly revenue
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentBookings = await db.Booking.findAll({
      where: { createdAt: { [Op.gte]: sixMonthsAgo }, paymentStatus: 'paid' },
      attributes: ['totalPrice', 'createdAt']
    });

    res.json({
      success: true,
      data: {
        totalUsers, totalCars, totalBookings, activeUsers, totalAllBookings,
        totalRevenue: revenueResult || 0,
        pendingBookings, confirmedBookings, cancelledBookings,
        popularCars,
        recentBookings
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const where = {};
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    const { count, rows } = await db.User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: rows, pagination: { total: count, page: parseInt(page) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    await user.update(req.body);
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot delete admin.' });
    await user.destroy();
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const where = {};
    if (status) where.status = status;
    const { count, rows } = await db.Booking.findAndCountAll({
      where,
      include: [
        { model: db.User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: db.Car, as: 'car', attributes: ['id', 'title', 'images'] }
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: rows, pagination: { total: count, page: parseInt(page) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const booking = await db.Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    await booking.update({ status: req.body.status });
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllMessages = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const { count, rows } = await db.Message.findAndCountAll({
      include: [{ model: db.User, as: 'sender', attributes: ['id', 'firstName', 'lastName', 'email'] }],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: rows, pagination: { total: count, page: parseInt(page) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: db.Booking, as: 'bookings', include: [{ model: db.Car, as: 'car' }] }
      ]
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.acknowledgeMessage = async (req, res) => {
  try {
    const msg = await db.Message.findByPk(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    await msg.update({ status: 'acknowledged' });
    res.json({ success: true, data: msg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.replyMessage = async (req, res) => {
  try {
    const msg = await db.Message.findByPk(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    await msg.update({ status: 'replied', adminReply: req.body.reply });
    res.json({ success: true, data: msg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
