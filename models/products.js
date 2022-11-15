import mongoose from 'mongoose';
import crypto from 'crypto';


//Account model
const UserSchema = new mongoose.Schema({
  pdt_brand: {
    type: String,
    required: true,
  },
  pdt_type: {
    type: String,
    required: true,
  },
  pdt_category: {
    type: String,
    required: true,
  },
  pdt_amt: {
    type: Number,
  },
  pdt_description: {
    type: String,
      required: true,
  },
  company_email:{
      type: String,
      required: true,
  },
  company_name: {
    type: String,
    required: true,
  },
  pdt_video: {
    type: String,
    required: true,
  },
  pdt_filename:{
    type: String,
    required: true,
  }
});

const Product = mongoose.model("products", UserSchema);

export default Product;