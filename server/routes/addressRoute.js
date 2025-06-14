import express from 'express';
import { addAddress, getAddress } from '../controllers/addressController.js';
import authUser from '../middlewares/userAuth.js';
const addressRouter = express.Router();
addressRouter.post('/add',authUser,addAddress);
addressRouter.get('/get',getAddress);
export default addressRouter;