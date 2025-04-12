import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export const sellerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }
    if(password==process.env.SELLER_PASSWORD && email==process.env.SELLER_EMAIL){
        const token = jwt.sign({ email }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        res.cookie("SellerToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? 'none' : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.json({ success: true, message: "Login successful" });
    }
    else{
        return res.status(400).json({ success: false, message: "Invalid credentials" });
    }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({success:false, error: error.message });
        
    }
}


export const isSellerAuth=async (req, res) => {
    try {
        
        return res.status(200).json({success:true});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({success:false, error: error.message });
    }
}

export const Sellerlogout = async (req, res) => {
    try {
        res.clearCookie("SellerToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? 'none':"strict",
        });
        return res.status(200).json({success:true,message:"Logged out successfully"});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({success:false, error: error.message });
    }
}