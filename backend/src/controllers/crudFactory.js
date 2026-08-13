// Generic CRUD controller factory to keep resource controllers concise & consistent
function crudFactory(Model, options = {}) {
  const { include = [], searchFields = [] } = options;

  return {
    list: async (req, res) => {
      try {
        const { page = 1, limit = 25, q } = req.query;
        const where = {};
        if (q && searchFields.length) {
          const { Op } = require('sequelize');
          where[Op.or] = searchFields.map((f) => ({ [f]: { [Op.iLike]: `%${q}%` } }));
        }
        const offset = (page - 1) * limit;
        const { rows, count } = await Model.findAndCountAll({
          where, include, limit: parseInt(limit), offset: parseInt(offset),
          order: [['created_at', 'DESC']],
        });
        res.json({ data: rows, total: count, page: parseInt(page), pages: Math.ceil(count / limit) });
      } catch (err) { res.status(500).json({ error: err.message }); }
    },
    get: async (req, res) => {
      try {
        const record = await Model.findByPk(req.params.id, { include });
        if (!record) return res.status(404).json({ error: 'Not found' });
        res.json(record);
      } catch (err) { res.status(500).json({ error: err.message }); }
    },
    create: async (req, res) => {
      try {
        const record = await Model.create(req.body);
        res.status(201).json(record);
      } catch (err) { res.status(400).json({ error: err.message }); }
    },
    update: async (req, res) => {
      try {
        const record = await Model.findByPk(req.params.id);
        if (!record) return res.status(404).json({ error: 'Not found' });
        await record.update(req.body);
        res.json(record);
      } catch (err) { res.status(400).json({ error: err.message }); }
    },
    remove: async (req, res) => {
      try {
        const record = await Model.findByPk(req.params.id);
        if (!record) return res.status(404).json({ error: 'Not found' });
        await record.destroy();
        res.status(204).send();
      } catch (err) { res.status(500).json({ error: err.message }); }
    },
  };
}

module.exports = crudFactory;
