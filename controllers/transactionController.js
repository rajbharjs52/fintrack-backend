const Transaction = require("../models/Transaction");

// GET /api/transactions
exports.getTransactions = async (req, res) => {
  try {
    const { type, category, startDate, endDate, search, page = 1, limit = 10 } = req.query;
    const filter = { user: req.user._id };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ transactions, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/transactions
exports.createTransaction = async (req, res) => {
  try {
    const { amount, type, category, description, date } = req.body;
    const transaction = await Transaction.create({
      user: req.user._id,
      amount,
      type,
      category,
      description,
      date,
    });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/transactions/:id
exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    Object.assign(transaction, req.body);
    await transaction.save();
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/transactions/:id
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    res.json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};