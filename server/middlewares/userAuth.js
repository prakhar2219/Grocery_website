import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const authUser = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    try {
        const tokenDecoded = jwt.verify(token, process.env.JWT_SECRET);
if(tokenDecoded.id){
    req.body.userId = tokenDecoded.id;
}
else{
    return res.status(401).json({ success: false, message: "Not authorized" });

}
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message:error.message });
    }
}
export default authUser;