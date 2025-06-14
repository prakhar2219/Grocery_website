import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const authSeller = async (req, res, next) => {
  const { SellerToken } = req.cookies;
  if (!SellerToken) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  try {
    const tokenDecoded = jwt.verify(SellerToken, process.env.JWT_SECRET);
    if (tokenDecoded.email === process.env.SELLER_EMAIL) {
      next();
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message });
  }
};
export default authSeller;
