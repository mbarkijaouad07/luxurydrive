const { Op } = require('sequelize');
const db = require('../models');
const PDFDocument = require('pdfkit');

exports.createBooking = async (req, res) => {
  try {
    const { carId, startDate, endDate, pickupLocation, dropoffLocation, notes, paymentMethod } = req.body;
    const car = await db.Car.findByPk(carId);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found.' });
    if (!car.availability) return res.status(400).json({ success: false, message: 'Car is not available.' });

    // Check date conflicts
    const conflict = await db.Booking.findOne({
      where: {
        carId,
        status: { [Op.in]: ['pending', 'confirmed'] },
        [Op.or]: [
          { startDate: { [Op.between]: [startDate, endDate] } },
          { endDate: { [Op.between]: [startDate, endDate] } },
          { [Op.and]: [{ startDate: { [Op.lte]: startDate } }, { endDate: { [Op.gte]: endDate } }] }
        ]
      }
    });
    if (conflict) return res.status(409).json({ success: false, message: 'Car already booked for these dates.' });

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (totalDays < 1) return res.status(400).json({ success: false, message: 'Invalid date range.' });

    const totalPrice = totalDays * parseFloat(car.pricePerDay);
    const booking = await db.Booking.create({
      userId: req.user.id,
      carId,
      startDate,
      endDate,
      totalDays,
      totalPrice,
      pickupLocation: pickupLocation || car.location,
      dropoffLocation: dropoffLocation || car.location,
      notes,
      paymentMethod: paymentMethod || 'card',
      status: 'confirmed',
      paymentStatus: 'paid'
    });

    const populated = await db.Booking.findByPk(booking.id, {
      include: [{ model: db.Car, as: 'car' }]
    });

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const where = { userId: req.user.id };
    if (status) where.status = status;

    const bookings = await db.Booking.findAll({
      where,
      include: [{ model: db.Car, as: 'car' }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await db.Booking.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: db.Car, as: 'car' }, { model: db.User, as: 'user', attributes: { exclude: ['password'] } }]
    });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.downloadReceipt = async (req, res) => {
  try {
    const booking = await db.Booking.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [
        { model: db.Car, as: 'car' },
        { model: db.User, as: 'user' }
      ]
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const doc = new PDFDocument({ margin: 50 });
    const filename = `receipt-${booking.id}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    doc.pipe(res);

    const primaryColor = '#2563eb';
    const secondaryColor = '#0f172a';

    // Header
    doc.fillColor(primaryColor).fontSize(24).text('LUXURY DRIVE', { align: 'center', characterSpacing: 2 });
    doc.fillColor(secondaryColor).fontSize(10).text('Official Reservation Receipt', { align: 'center', characterSpacing: 1 });
    doc.moveDown(2);

    // Receipt Info
    doc.fontSize(14).text(`Receipt for Booking #LD-${String(booking.id).padStart(6, '0')}`, { underline: true });
    doc.fontSize(10).text(`Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Status: ${booking.status.toUpperCase()}`);
    doc.moveDown();

    // Customer Info
    doc.fontSize(12).text('Customer Details', { underline: true });
    doc.fontSize(10).text(`Name: ${booking.user.firstName} ${booking.user.lastName}`);
    doc.text(`Email: ${booking.user.email}`);
    doc.moveDown();

    // Car Info
    doc.fontSize(12).text('Vehicle Details', { underline: true });
    doc.fontSize(10).text(`Car: ${booking.car.title}`);
    doc.text(`Pickup Date: ${new Date(booking.startDate).toLocaleDateString()}`);
    doc.text(`Return Date: ${new Date(booking.endDate).toLocaleDateString()}`);
    doc.text(`Total Days: ${booking.totalDays}`);
    doc.moveDown();

    // Payment Info
    doc.fontSize(12).text('Payment Breakdown', { underline: true });
    doc.fontSize(10).text(`Rate: ${booking.pricePerDay || (booking.totalPrice / booking.totalDays).toFixed(2)} DH / day`);
    doc.moveDown();

    doc.fillColor(primaryColor).fontSize(16).text(`Total Paid: ${booking.totalPrice.toFixed(2)} DH`, { align: 'right' });

    // Footer
    doc.moveDown(4);
    doc.fillColor('gray').fontSize(8).text('LuxuryDrive Morocco - Specialized in Premium Automotive Experiences', { align: 'center' });

    doc.end();
  } catch (err) {
    console.error('Error generating PDF:', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Could not generate PDF' });
    }
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await db.Booking.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    if (['cancelled', 'completed'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: `Booking already ${booking.status}.` });
    }
    await booking.update({ status: 'cancelled', paymentStatus: 'refunded' });
    res.json({ success: true, message: 'Booking cancelled.', data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.checkAvailability = async (req, res) => {
  try {
    const { carId, startDate, endDate } = req.query;
    const conflict = await db.Booking.findOne({
      where: {
        carId,
        status: { [Op.in]: ['pending', 'confirmed'] },
        [Op.or]: [
          { startDate: { [Op.between]: [startDate, endDate] } },
          { endDate: { [Op.between]: [startDate, endDate] } },
          { [Op.and]: [{ startDate: { [Op.lte]: startDate } }, { endDate: { [Op.gte]: endDate } }] }
        ]
      }
    });
    res.json({ success: true, available: !conflict });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
