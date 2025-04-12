import pkg from 'cloudinary';
const { v2: Cloudinary } = pkg;
const connectCloudinary = async() => {
Cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
}
export default connectCloudinary;