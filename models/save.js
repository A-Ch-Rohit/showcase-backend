import mongoose from 'mongoose';


//Account model
const SaveSchema = new mongoose.Schema({
    user_email:{
        type: String,
        required: true,
      },
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
});

const Save = mongoose.model("saveds", SaveSchema);

export default Save;