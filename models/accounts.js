import mongoose from 'mongoose';
import crypto from 'crypto';


//Account model
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
  },
  code:{
      type: String,
  },
  type: {
    type: String,
    required: true,
  },
  country: {
    type: String,
  },
  isVerified:{
      type:Boolean,
  }
});

const User = mongoose.model("accounts", UserSchema);

export default User;