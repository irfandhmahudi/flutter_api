import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import cookieParser from "cookie-parser";

// Import routes
import userRoutes from "./route/userRoute.js";
import avatarRoutes from "./route/avatarRoute.js";
import productRoutes from "./route/productRoute.js";
import notifyRoutes from "./route/notifyRoute.js";
import cartRoutes from "./route/cartRoute.js";
import couponRoutes from "./route/coupunRoutes.js";
import ongkirController from "./controller/ongkirController.js";
import orderRoutes from "./route/orderRoute.js";
import paymentRoutes from "./route/paymentRoute.js";

dotenv.config();
connectDB();

const app = express();
app.use(cookieParser());

// Middleware untuk parsing body JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [
      "https://flutter-ui-iota.vercel.app", // Untuk aplikasi di Vercel
      // "https://flutter-ui-git-main-irfandhamhudis-projects.vercel.app",
      "http://localhost:3000",
      "http://10.0.2.2:3000",
      "http://10.0.2.16:3000",
      "http://192.168.1.2:3000",
      "http://localhost:5173",
    ],
    credentials: true, // Membolehkan cookies dikirimkan
  })
);

// Route for users
app.use("/api/user", userRoutes);

// Route for avatars
app.use("/api/avatar", avatarRoutes);

// Route for products
app.use("/api/product", productRoutes);

// Route for notifications
app.use("/api/notify", notifyRoutes);

// Route for cart
app.use("/api/cart", cartRoutes);

// Route for coupons
app.use("/api/coupons", couponRoutes);

// Route for ongkir
app.post("/api/ongkir/cost", ongkirController.getOngkir);
app.get("/api/ongkir/provinces", ongkirController.getProvinces);
app.get("/api/ongkir/cities", ongkirController.getCities);
app.get("/api/ongkir/cities/:provinceId", ongkirController.getCitiesByProvince);

// Route for order
app.use("/api/order", orderRoutes);

// Route for payment
app.use("/api/payment", paymentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
