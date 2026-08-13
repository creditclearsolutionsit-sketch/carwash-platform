const { Booking, Customer, Vehicle, ServiceCatalog, JobCard } = require('../models');

exports.list = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [Customer, Vehicle, ServiceCatalog, JobCard],
      order: [['scheduled_at', 'DESC']],
      limit: 100,
    });
    res.json(bookings);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.get = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [Customer, Vehicle, ServiceCatalog, JobCard],
    });
    if (!booking) return res.status(404).json({ error: 'Not found' });
    res.json(booking);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const { customer_id, vehicle_id, service_ids, scheduled_at, source, notes, branch_id } = req.body;

    const booking = await Booking.create({
      scheduled_at, source: source || 'walk_in', notes,
      CustomerId: customer_id, VehicleId: vehicle_id, BranchId: branch_id,
    });

    if (Array.isArray(service_ids) && service_ids.length) {
      const services = await ServiceCatalog.findAll({ where: { id: service_ids } });
      await booking.setServiceCatalogs(services);
    }

    // Auto-create a job card in the queue
    const job_number = `JC-${Date.now().toString().slice(-8)}`;
    await JobCard.create({ job_number, status: 'queued', BookingId: booking.id });

    const full = await Booking.findByPk(booking.id, { include: [Customer, Vehicle, ServiceCatalog, JobCard] });
    res.status(201).json(full);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Not found' });
    await booking.update({ status });
    res.json(booking);
  } catch (err) { res.status(400).json({ error: err.message }); }
};
