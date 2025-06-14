import {v2 as cloudinary} from 'cloudinary';
import Product from '../models/Product.js';
export const addProduct = async (req, res) => {
  try {
    let productData = JSON.parse(req.body.productData);
    const images = req.files;
    let imageUrls = await Promise.all(
      images.map(async (image) => {
        let result = await cloudinary.uploader.upload(image.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );
    await Product.create({
      ...productData,
      images: imageUrls
    });
    res.status(201).json({
      success: true,
      message: "Product added successfully",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const productList = async (req, res) => {
    try {
       const products = await Product.find({});
        res.status(200).json({
            success: true,
            products
        }); 
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const productById = async (req, res) => {
    try {
        const { id } = req.body;
        const product = await Product.findById(id);
        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const changeStock = async (req, res) => {
    try {
        const { id, inStock } = req.body;
        await Product.findByIdAndUpdate(id, { inStock });
        res.status(200).json({
            success: true,
            message: "Stock updated successfully",
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
