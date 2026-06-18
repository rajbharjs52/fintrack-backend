const Transaction = require("../models/Transaction");

exports.getSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const transactions = await Transaction.find({ user: userId });

    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    res.json({
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      totalTransactions: transactions.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMonthly = async (req, res) => {
  try {
    const data = await Transaction.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: { month: { $month: "$date" }, year: { $year: "$date" }, type: "$type" },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const formatted = {};

    data.forEach(({ _id, total }) => {
      const key = `${months[_id.month - 1]} ${_id.year}`;
      if (!formatted[key]) formatted[key] = { month: key, income: 0, expense: 0 };
      formatted[key][_id.type] = total;
    });

    res.json(Object.values(formatted));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = { user: req.user._id, type: "expense" };

    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) match.date.$lte = new Date(endDate);
    }

    const data = await Transaction.aggregate([
      { $match: match },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]);

    res.json(data.map((d) => ({ name: d._id, value: d.total })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};