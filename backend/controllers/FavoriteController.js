const db = require('../models');

exports.toggleFavorite = async (req, res) => {
  try {
    const { carId } = req.body;
    const car = await db.Car.findByPk(carId);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found.' });

    const existing = await db.Favorite.findOne({ where: { userId: req.user.id, carId } });
    if (existing) {
      await existing.destroy();
      return res.json({ success: true, favorited: false, message: 'Removed from favorites.' });
    }
    await db.Favorite.create({ userId: req.user.id, carId });
    res.json({ success: true, favorited: true, message: 'Added to favorites.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyFavorites = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user.id, {
      include: [{ model: db.Car, as: 'favoriteCars' }]
    });
    res.json({ success: true, data: user.favoriteCars });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.checkFavorite = async (req, res) => {
  try {
    const { carId } = req.params;
    const fav = await db.Favorite.findOne({ where: { userId: req.user.id, carId } });
    res.json({ success: true, favorited: !!fav });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
