import TransactionModel from "./transaction.model.js";

const normalizeTransaction = (payload) => ({
    ...payload,
    amount: Number(payload.amount),
    category: payload.category || "general",
});

const buildTransactionFilter = (req) => {
    const { id, role } = req.user;
    const { search, type, paymentMethod, category } = req.query;
    const filter = role === "admin" ? {} : { userId: id };

    if (type && type !== "all") filter.transactionType = type;
    if (paymentMethod && paymentMethod !== "all") filter.paymentMethod = paymentMethod;
    if (category && category !== "all") filter.category = category;
    if (search) {
        const keyword = new RegExp(search, "i");
        filter.$or = [
            { title: keyword },
            { notes: keyword },
            { paymentMethod: keyword },
            { category: keyword },
            { transactionType: keyword },
        ];
    }

    return filter;
};

export const createTransaction = async (req, res) => {
    try {
        const data = normalizeTransaction(req.body);
        const { id } = req.user;
        if (!data.amount || data.amount <= 0) {
            return res.status(400).json({ message: "Amount must be greater than 0" });
        }
        data.userId = id;
        const transaction = await new TransactionModel(data).save();
        res.json(transaction);
    } catch (err) {
        res.status(500).json({ message: err.message || "Internal Server error"})
    }
}

export const updateTransaction = async (req, res) => {
    try {
        const data = normalizeTransaction(req.body);
        const { id } = req.params;
        if (!data.amount || data.amount <= 0) {
            return res.status(400).json({ message: "Amount must be greater than 0" });
        }
        const ownerFilter = req.user.role === "admin" ? { _id: id } : { _id: id, userId: req.user.id };
        const transaction = await TransactionModel.findOneAndUpdate(ownerFilter, data, {new: true});
        if(!transaction)          
            return res.status(404).json({message: "Transaction not found !",
            transaction});
        res.json(transaction);
    } catch (err) {
        res.status(500).json({ message: err.message || "Internal Server error"})
    }
}

export const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const ownerFilter = req.user.role === "admin" ? { _id: id } : { _id: id, userId: req.user.id };
        const transaction = await TransactionModel.findOneAndDelete(ownerFilter);
        if(!transaction)          
            return res.status(404).json({message: "Transaction not found !",
            transaction});
       res.json(transaction);
    } catch (err) {
        res.status(500).json({ message: err.message || "Internal Server error"})
    }
}

export const getTransaction = async (req, res) => {
    try {
        const { page =1 ,limit = 5}= req.query;
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;
        const filter = buildTransactionFilter(req);
         const transactions = await TransactionModel.find(filter).sort({createdAt: -1})
        .skip(skip).limit(limitNumber);
        const total = await TransactionModel.countDocuments(filter);
        res.json({
            data : transactions,
            total
        });
    } catch (err) {
        res.status(500).json({ message: err.message || "Internal Server error"})
    }
}
