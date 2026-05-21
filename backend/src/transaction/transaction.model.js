import { model, Schema } from "mongoose";

const TransactionSchema = new Schema({
    transactionType: {
        type: String,
        trim: true,
        required: true,
        lowercase: true,
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title:{
        type: String,
        trim: true,
        required: true,
        lowercase: true,
    },
    amount:{
        type: Number,
        required: true,
        min: 0,
    },
    category:{
        type: String,
        trim: true,
        lowercase: true,
        default: "general",
    },
    paymentMethod:{
        type: String,
        trim: true,
        required: true,
        lowercase: true,
    },
    notes:{
        type: String,
        trim: true,
        lowercase: true,
    }

}, { timestamps: true });

const TransactionModel = model("Transaction", TransactionSchema);

export default TransactionModel;
