import express from 'express';
import { getAllOrders, getUserOrders, placeOrderCOD, placeOrderStripe } from '../controllers/orderController.js';
import authSeller from '../middlewares/sellerAuth.js';
import authUser from '../middlewares/userAuth.js';
const orderRouter = express.Router();
orderRouter.post('/cod', authUser,placeOrderCOD)
orderRouter.post('/stripe', authUser,placeOrderStripe)
orderRouter.get('/user', authUser,getUserOrders)
orderRouter.get('/seller', authSeller,getAllOrders)

export default orderRouter;
