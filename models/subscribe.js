import mongoose from 'mongoose';


//Account model
const SubscribeSchema = new mongoose.Schema({
    profile_email:{
        type: String,
        required: true,
      },
    subscribers:[String],
});

const Subscribe = mongoose.model("subscribers", SubscribeSchema);

export default Subscribe;