import { generateSnapToken } from "../controller/paymentController.js";
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:orderId/pay", authMiddleware, generateSnapToken);

export default router;
