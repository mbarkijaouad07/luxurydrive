const db = require('../models');

exports.sendMessage = async (req, res) => {
  try {
    const { carId, reservationId, category, priority, subject, body, image } = req.body;
    if (carId) {
      const car = await db.Car.findByPk(carId);
      if (!car) return res.status(404).json({ success: false, message: 'Car not found.' });
    }

    const msg = await db.Message.create({
      senderId: req.user.id,
      carId,
      reservationId,
      category,
      priority,
      subject,
      body,
      image
    });

    res.status(201).json({ success: true, data: msg, message: 'Your request has been submitted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyMessages = async (req, res) => {
  try {
    const messages = await db.Message.findAll({
      where: { senderId: req.user.id },
      include: [{ model: db.Car, as: 'car', attributes: ['id', 'title', 'images'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
