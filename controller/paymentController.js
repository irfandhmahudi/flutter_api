import midtransClient from "midtrans-client";
import User from "../models/userModels.js";
import Order from "../models/orderModel.js";

import dotenv from "dotenv";
dotenv.config();

// Konfigurasi Midtrans
const snap = new midtransClient.Snap({
  isProduction: false, // Ganti ke true jika aplikasi sudah live
  serverKey: process.env.SERVER_KEY,
  clientKey: process.env.CLIENT_KEY,
});

// Fungsi untuk menghasilkan Snap token
export const generateSnapToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { orderId } = req.params;

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Data transaksi yang akan dikirimkan ke Midtrans
    const parameter = {
      transaction_details: {
        order_id: `INV-${order._id}-${Date.now()}`,
        gross_amount: order.total, // Total harga yang akan dibayar
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        username: user.username,
        cart: order.cart,
        email: user.email,
      },
    };

    // Generate Snap token dari Midtrans
    const transaction = await snap.createTransaction(parameter);

    // Kirimkan token Snap ke frontend
    res.status(200).json({
      success: true,
      message: "Snap token generated successfully",
      snapToken: transaction.token,
      redirectUrl: transaction.redirect_url,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
