import Address from "../models/address.js";

export const addAddress = async (req, res) => {
    try {
       const {address,userId} = req.body;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "Missing userId in request body",
            });
        }
       await Address.create({...address,userId});
       res.status(200).json({
           success: true,
           message: "Address added successfully",
       }); 
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success: false,
            message: error.message,
        }); 
        
    }
}

  


export const getAddress = async (req, res) => {
    try {
    const {userId} = req.query; // ✅ Correct for GET request
     if (!userId) {
      return res.status(400).json({ success: false, message: "Missing userId" });
    }
       const addresses = await Address.find({userId});
       res.status(200).json({
           success: true,
           addresses
       }); 
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success: false,
            message: error.message,
        }); 
        
    }
}