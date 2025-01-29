import express from "express";
import {
  createOrder,
  getOrdersByUser,
  getOrderById,
  getAllOrders,
  uploadPaymentProof,
  approvePayment,
} from "../controller/orderController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Create Order
router.post("/", authMiddleware, createOrder);

// Get Orders by User
router.get("/user", authMiddleware, getOrdersByUser);

// Get Order by ID
router.get("/:orderId", authMiddleware, getOrderById);

// Get All Orders (Admin only)
router.get("/", authMiddleware, getAllOrders);

// Route untuk mengunggah bukti pembayaran
router.post(
  "/upload-payment-proof/:orderId",
  authMiddleware,
  upload.array("paymentProof", 1),
  uploadPaymentProof
);

// Route untuk menyetujui pembayaran
router.patch("/approve/:orderId", authMiddleware, approvePayment);

export default router;
