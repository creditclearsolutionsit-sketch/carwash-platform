const { Op } = require('sequelize');
const dayjs = require('dayjs');
const { Booking, Payment, Customer, JobCard, InventoryItem } = require('../models');

exports.summary = async (req, res) => {
  try {
    const todayStart = dayjs().startOf('day').toDate();
    const todayEnd = dayjs().endOf('day').toDate();

    const [todayBookings, activeJobs, todayRevenueRows, totalCustomers, lowStock] = await Promise.all([
      Booking.count({ where: { scheduled_at: { [Op.between]: [todayStart, todayEnd] } } }),
      JobCard.count({ where: { status: { [Op.in]: ['queued', 'in_progress', 'quality_check'] } } }),
      Payment.findAll({
        where: { status: 'paid', created_at: { [Op.between]: [todayStart, todayEnd] } },
        attributes: ['amount'],
      }),
      Customer.count(),
      InventoryItem.findAll({ where: { quantity_on_hand: { [Op.lte]: sequelizeCol() } } }).catch(() => []),
    ]);

    const todayRevenue = todayRevenueRows.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    res.json({
      today_bookings: todayBookings,
      active_jobs: activeJobs,
      today_revenue: todayRevenue,
      total_customers: totalCustomers,
      low_stock_items: Array.isArray(lowStock) ? lowStock.length : 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

function sequelizeCol() {
  const { sequelize } = require('../models');
  return sequelize.col('reorder_level');
}
