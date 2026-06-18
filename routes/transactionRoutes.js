const express = require("express");
const router = express.Router();
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect); // all transaction routes are protected

router.route("/").get(getTransactions).post(createTransaction);
router.route("/:id").put(updateTransaction).delete(deleteTransaction);

module.exports = router;