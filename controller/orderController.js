import Order from "../models/orderModel.js";
import { triggerNotification } from "../utils/notifyHelper.js";
import * as OrderService from "../service/orderService.js";
import User from "../models/userModels.js";

// Create Order
export const createOrder = async (req, res) => {
  try {
    // Debug: Cek data body dan userId
    // console.log("Request body:", req.body);
    // console.log("User ID:", req.user?.id);
    const user = await User.findById(req.user.id);

    // Ambil data dari body
    const {
      origin,
      destination,
      weight,
      courier,
      service,
      shipping_cost,
      cart,
      total,
      discount,
    } = req.body;

    // Validasi input
    if (
      !origin ||
      !destination ||
      !weight ||
      !courier ||
      !service ||
      !shipping_cost ||
      !cart ||
      !total
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    // Pastikan req.user ada dan memiliki id
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Membuat order baru dengan userId yang diambil dari req.user.id
    const newOrder = new Order({
      origin,
      destination,
      weight,
      courier,
      service,
      shipping_cost,
      cart,
      total,
      discount,
      userId: user, // Referensi ke pengguna (hanya ID pengguna)
    });

    // Perbarui stok produk berdasarkan cart
    for (const item of user.cart) {
      await OrderService.updateProductStock(item.productId, item.quantity);
    }

    // Kosongkan keranjang belanja
    user.cart = [];
    await user.save();

    // Kirimkan notifikasi ke user
    triggerNotification(
      user._id,
      `Your order has been placed successfully. Order ID: ${newOrder._id}`,
      "security"
    );

    // Debug: Cek data order sebelum disimpan
    // console.log("New Order:", newOrder);

    // Simpan ke database
    const savedOrder = await newOrder.save();

    // Kirim respons sukses
    res
      .status(201)
      .json({ message: "Order created successfully", order: savedOrder });
  } catch (error) {
    console.error("Error creating order:", error.message);
    res
      .status(500)
      .json({ message: "Failed to create order", error: error.message });
  }
};

// Get Orders by User
export const getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }); // Pastikan req.userId ada dari middleware autentikasi
    res.status(200).json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get orders", error: error.message });
  }
};

// Get Order by ID
export const getOrderById = async (req, res) => {
  try {
    // Panggil OrderService.getOrderById untuk mendapatkan detail order
    const order = await OrderService.getOrderById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("cart.productId");
    res.status(200).json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get orders", error: error.message });
  }
};

// Upload Bukti Pembayaran
export const uploadPaymentProof = async (req, res) => {
  const user = await User.findById(req.user.id);
  try {
    // Validasi apakah ada file yang diunggah
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded" });
    }

    // Mengunggah gambar ke Cloudinary
    const imageUrls = await Promise.all(
      req.files.map(async (file) => {
        const uploaded = await cloudinary.uploader.upload(file.path, {
          folder: "uploads/orders",
          public_id: file.originalname.split(".")[0],
          resource_type: "image",
          overwrite: true,
        });

        // Hapus file lokal setelah diunggah ke Cloudinary

        return uploaded.secure_url;
      })
    );

    // Simpan URL bukti pembayaran di database
    const { orderId } = req.params; // Pastikan orderId dikirimkan di body
    const order = await Order.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Perbarui field `paymentProof` dan status
    order.paymentProof = imageUrls[0]; // Mengambil URL pertama
    order.paymentStatus = "waiting";
    await order.save();

    // Kirimkan notifikasi ke user
    triggerNotification(
      user._id,
      `Your payment proof has been uploaded. Waiting for approval`,
      "security"
    );

    res.status(200).json({
      success: true,
      message: "Payment proof uploaded successfully",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin Mengonfirmasi Bukti Pembayaran
export const approvePayment = async (req, res) => {
  const user = await User.findById(req.user.id);
  try {
    const { action } = req.body; // Ambil data dari body request
    const { orderId } = req.params;
    if (!orderId || !action) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID and action are required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (action === "approved") {
      order.paymentStatus = "approved";
      order.status_pembayaran = "paid";
    } else if (action === "rejected") {
      order.paymentStatus = "rejected";
      order.status_pembayaran = "unpaid";
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid action" });
    }

    await order.save();

    // Kirimkan notifikasi ke user
    triggerNotification(
      user._id,
      `Your payment proof has been ${action}`,
      "security"
    );

    res.status(200).json({
      message: `Payment has been ${action}`,
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
