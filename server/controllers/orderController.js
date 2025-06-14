import Order from "../models/order.js";
import stripe from "stripe";
import Product from "../models/Product.js";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();
export const placeOrderCOD = async (req, res) => {
  try {
    const { userId, items, address } = req.body;

    if (!address || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order data",
      });
    }

    let amount = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }
      amount += product.offerPrice * item.quantity;
    }

    amount += Math.floor(amount * 0.02); // 2% extra charge (tax/delivery etc.)

    await Order.create({
      userId,
      items,
      address,
      amount,
      paymentType: "COD",
    });

    res.status(200).json({
      success: true,
      message: "Order placed successfully with COD",
    });
  } catch (error) {
    console.error("placeOrderCOD error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, address } = req.body;
    const {origin}=req.headers
    if (!address || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid data",
      });
    }
    // acc-> initial count of the amount
    let productData=[]
    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      productData.push({
        name: product.name,
        price:product.offerPrice,
        quantity: item.quantity,
      })
      return (await acc) + product.price * item.quantity;
    }, 0);

    amount += Math.floor(amount * 0.02);
  const order =await Order.create({
      userId,
      items,
      address,
      amount,
      paymentType: "Online",
    });

      const stripeInstance =new  stripe(process.env.STRIPE_SECRET_KEY);
      const line_items = productData.map((item) => {
        return {
        price_data: {
          currency: "AUD",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.floor(item.price+item.price*0.02)*100// Stripe expects amount in cents
        },
        quantity: item.quantity,
      }})

      const session = await stripeInstance.checkout.sessions.create({
        line_items,
        mode: "payment",
        success_url: `${origin}/loader?next=my-orders`,
        cancel_url: `${origin}/cart`,
        metadata: {
          orderId: order._id.toString(),
          userId: userId,
        },
      })

    res.status(200).json({
      success: true,
      url: session.url,
     
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export const stripeWebhooks = async (req, res) => {
  const stripeInstance =new stripe(process.env.STRIPE_SECRET_KEY);
const sig=req.headers["stripe-signature"]; 
let event;
try {
  event = stripeInstance.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)}
catch (error) {
  res.status(400).send(`Webhook Error: ${error.message}`);
}
switch (event.type) {
  case "payment_intent.succeeded":{
    const paymentIntent = event.data.object;
    const paymentIntentId = paymentIntent.id;
    const session=await stripeInstance.checkout.sessions.list({
      payment_intent: paymentIntentId,
    })
    const {orderId,userId} = session.data[0].metadata;
    await Order.findByIdAndUpdate(orderId, {isPaid:true});
    await User.findByIdAndUpdate(userId, {
      cartItems:{}

    })
    break;
  }
    
  case "payment_intent.payment_failed":{
    const paymentIntent = event.data.object;
    const paymentIntentId = paymentIntent.id;
    const session=await stripeInstance.checkout.sessions.list({
      payment_intent: paymentIntentId,
    })
    const {orderId} = session.data[0].metadata;
    await Order.findByIdAndUpdate(orderId);
    break;
  }

  default:
    console.error(`Unhandled event type ${event.type}`);
    break;
}
res.status(200).json({received:true})
}

export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.query; // Use query parameters for GET requests
    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const getAllOrders = async (req, res) => {
    try {
      const orders = await Order.find({
        $or: [{ paymentType: "COD" }, { isPaid: true }],
      })
        .populate("items.product address")
        .sort({ createdAt: -1 });
      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  