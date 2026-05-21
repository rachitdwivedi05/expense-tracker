import TransactionModel from "../transaction/transaction.model.js";

const monthLabel = (date) => new Date(date).toLocaleString("en-US", {
  month: "short",
  year: "numeric",
});

const formatDateKey = (date) => new Date(date).toISOString().slice(0, 10);

const buildDailyChart = (transactions) => {
  if (!transactions.length) return [];

  const dailyMap = {};
  transactions.forEach((txn) => {
    const date = formatDateKey(txn.createdAt);
    dailyMap[date] = (dailyMap[date] || 0) + (Number(txn.amount) || 0);
  });

  const latestTransactionDate = new Date(transactions[transactions.length - 1].createdAt);
  const days = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date(latestTransactionDate);
    d.setDate(d.getDate() - i);
    const dateStr = formatDateKey(d);
    days.push({
      date: dateStr,
      total: dailyMap[dateStr] || 0,
    });
  }

  return days;
};

export const getReport = async (req, res) => {
  try {
    const { id, role } = req.user;
    let transactions =[];
    
    if (role === "admin") {
       transactions = await TransactionModel.find().lean(); 
    } else {
       transactions = await TransactionModel.find({ userId: id }).lean(); 
    }
    transactions.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    let totalCredit = 0;
    let totalDebit = 0;
    const categoryMap = {};
    const monthlyMap = {};

    transactions.forEach((txn) => {
      const amount = Number(txn.amount) || 0;
      if (txn.transactionType === "cr") {
        totalCredit += amount;
      } else if (txn.transactionType === "dr") {
        totalDebit += amount;
        const category = txn.category || txn.title || "general";
        categoryMap[category] = (categoryMap[category] || 0) + amount;
      }

      const month = monthLabel(txn.createdAt);
      if (!monthlyMap[month]) {
        monthlyMap[month] = { month, income: 0, expenses: 0, balance: 0 };
      }
      if (txn.transactionType === "cr") monthlyMap[month].income += amount;
      if (txn.transactionType === "dr") monthlyMap[month].expenses += amount;
      monthlyMap[month].balance = monthlyMap[month].income - monthlyMap[month].expenses;
    });

    const totalTransactions = transactions.length;
    const balance = totalCredit - totalDebit;

    const estimate = (value) => Math.floor(value + value * 0.15);


    const dailyChart = buildDailyChart(transactions);
    const monthlySummary = Object.values(monthlyMap).slice(-6);
    const categoryBreakdown = Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    const recentTransactions = [...transactions]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);

    res.status(200).json({
        summary: {
            totalTransactions,
            totalCredit,
            totalDebit,
            totalIncome: totalCredit,
            totalExpenses: totalDebit,
            balance,

            totalTransactionEstimate: estimate(totalTransactions),
            totalCreditEstimate: estimate(totalCredit),
            totalDebitEstimate: estimate(totalDebit),
            balanceEstimate: estimate(balance),
        },
        chart : dailyChart,
        monthlySummary,
        categoryBreakdown,
        recentTransactions
    });
        
    
  } catch (err) {
    res.status(500).json({
      message: err.message || "Internal server error",
    });
  }
};
