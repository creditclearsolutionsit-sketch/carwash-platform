const { Payment, Booking, ServiceCatalog } = require('../models');

exports.checkout = async (req, res) => {
  try {
    const { booking_id, method } = req.body;
    const booking = await Booking.findByPk(booking_id, { include: [ServiceCatalog] });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const total = booking.ServiceCatalogs.reduce((sum, s) => sum + parseFloat(s.price), 0);

    const payment = await Payment.create({
      amount: total, method: method || 'cash', status: 'paid',
      reference: `PAY-${Date.now().toString().slice(-8)}`,
      BookingId: booking.id, processed_by: req.user.id,
    });

    await booking.update({ status: 'completed' });

    res.status(201).json({ payment, total });
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.listPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({ include: [Booking], order: [['created_at', 'DESC']], limit: 100 });
    res.json(payments);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
