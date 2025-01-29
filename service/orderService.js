import Order from "../models/orderModel.js";
import Product from "../models/productModels.js";

export const createOrder = async (orderData) => {
  try {
    // Membuat order baru
    const order = new Order(orderData);
    await order.save();
    return order;
  } catch (error) {
    throw new Error("Error creating order: " + error.message);
  }
};

export const getOrderById = async (orderId) => {
  try {
    // Menggunakan populate langsung di query
    const order = await Order.findById(orderId).populate(
      "cart.productId", // Populasi data produk dari productId
      "name price size images" // Ambil field tertentu saja
    );
    return order;
  } catch (error) {
    throw new Error("Error fetching order: " + error.message);
  }
};

export const getAllOrders = async () => {
  try {
    const orders = await Order.find({});
    return orders;
  } catch (error) {
    throw new Error("Error fetching orders: " + error.message);
  }
};

export const updateProductStock = async (productId, quantity) => {
  try {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    if (product.stock < quantity) {
      throw new Error(`Insufficient stock for product: ${product.name}`);
    }

    product.stock -= quantity;
    await product.save();
  } catch (error) {
    throw new Error("Error updating product stock: " + error.message);
  }
};
