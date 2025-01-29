import mongoose from "mongoose";

const cartItemSchema = mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, default: 1 },
    size: { type: String, required: true }, // Menambahkan ukuran
  },
  {
    timestamps: true,
  }
);

// Skema untuk Order
const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  origin: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  weight: {
    type: Number, // Berat barang (dalam gram)
    required: true,
  },
  courier: {
    type: String, // JNE, POS, TIKI, dll.
    required: true,
  },
  service: {
    type: String, // Jenis layanan (misalnya "regular", "express", dll.)
    required: true,
  },
  shipping_cost: {
    type: Number, // Biaya pengiriman
    required: true,
  },
  cart: [cartItemSchema], // Keranjang pengguna dengan properti size
  total: {
    type: Number, // Subtotal sebelum diskon
    required: true,
  },
  discount: {
    type: Number, // Diskon yang diterapkan
    default: 0,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "canceled"], // Status order
    default: "pending",
  },
  status_pembayaran: {
    type: String,
    enum: ["paid", "unpaid"], // Status pembayaran dalam B. Indonesia
    default: "unpaid",
  },
  paymentProof: {
    type: String, // URL gambar bukti pembayaran
  },
  paymentStatus: {
    type: String,
    enum: ["waiting", "approved", "rejected"],
    default: "waiting", // Status pembayaran menunggu konfirmasi admin
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Model Order
const Order = mongoose.model("Order", orderSchema);
export default Order;
