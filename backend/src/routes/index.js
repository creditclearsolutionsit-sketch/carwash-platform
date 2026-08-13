const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const crudFactory = require('../controllers/crudFactory');
const authController = require('../controllers/authController');
const dashboardController = require('../controllers/dashboardController');
const bookingController = require('../controllers/bookingController');
const posController = require('../controllers/posController');
const aiController = require('../controllers/aiController');

const {
  Branch, Customer, Vehicle, ServiceCatalog, Employee, InventoryItem, JobCard,
} = require('../models');

// Auth
router.post('/auth/register', authenticate, authorize('admin'), authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authenticate, authController.me);

// Everything below requires a valid token
router.use(authenticate);

// Dashboard
router.get('/dashboard/summary', dashboardController.summary);

// Branches (admin only for write)
const branchCrud = crudFactory(Branch);
router.get('/branches', branchCrud.list);
router.get('/branches/:id', branchCrud.get);
router.post('/branches', authorize('admin'), branchCrud.create);
router.put('/branches/:id', authorize('admin'), branchCrud.update);
router.delete('/branches/:id', authorize('admin'), branchCrud.remove);

// Customers
const customerCrud = crudFactory(Customer, { include: [Vehicle], searchFields: ['name', 'phone', 'email'] });
router.get('/customers', customerCrud.list);
router.get('/customers/:id', customerCrud.get);
router.post('/customers', customerCrud.create);
router.put('/customers/:id', customerCrud.update);
router.delete('/customers/:id', authorize('admin', 'manager'), customerCrud.remove);

// Vehicles
const vehicleCrud = crudFactory(Vehicle, { searchFields: ['plate_number', 'make', 'model'] });
router.get('/vehicles', vehicleCrud.list);
router.get('/vehicles/:id', vehicleCrud.get);
router.post('/vehicles', vehicleCrud.create);
router.put('/vehicles/:id', vehicleCrud.update);
router.delete('/vehicles/:id', authorize('admin', 'manager'), vehicleCrud.remove);

// Service Catalog
const serviceCrud = crudFactory(ServiceCatalog, { searchFields: ['name', 'category'] });
router.get('/services', serviceCrud.list);
router.get('/services/:id', serviceCrud.get);
router.post('/services', authorize('admin', 'manager'), serviceCrud.create);
router.put('/services/:id', authorize('admin', 'manager'), serviceCrud.update);
router.delete('/services/:id', authorize('admin', 'manager'), serviceCrud.remove);

// Employees
const employeeCrud = crudFactory(Employee, { searchFields: ['full_name', 'position'] });
router.get('/employees', employeeCrud.list);
router.get('/employees/:id', employeeCrud.get);
router.post('/employees', authorize('admin', 'manager'), employeeCrud.create);
router.put('/employees/:id', authorize('admin', 'manager'), employeeCrud.update);
router.delete('/employees/:id', authorize('admin', 'manager'), employeeCrud.remove);

// Inventory
const inventoryCrud = crudFactory(InventoryItem, { searchFields: ['name', 'sku'] });
router.get('/inventory', inventoryCrud.list);
router.get('/inventory/:id', inventoryCrud.get);
router.post('/inventory', authorize('admin', 'manager'), inventoryCrud.create);
router.put('/inventory/:id', authorize('admin', 'manager'), inventoryCrud.update);
router.delete('/inventory/:id', authorize('admin', 'manager'), inventoryCrud.remove);

// Job Cards
const jobCardCrud = crudFactory(JobCard);
router.get('/job-cards', jobCardCrud.list);
router.get('/job-cards/:id', jobCardCrud.get);
router.put('/job-cards/:id', jobCardCrud.update);

// Bookings (custom controller: creates booking + job card + links services)
router.get('/bookings', bookingController.list);
router.get('/bookings/:id', bookingController.get);
router.post('/bookings', bookingController.create);
router.put('/bookings/:id/status', bookingController.updateStatus);

// POS / Payments
router.post('/pos/checkout', posController.checkout);
router.get('/payments', posController.listPayments);

// AI (WhatsApp receptionist / chatbot stubs powered by Anthropic API)
router.post('/ai/chat', aiController.chat);
router.post('/ai/whatsapp-webhook', aiController.whatsappWebhook);

module.exports = router;
