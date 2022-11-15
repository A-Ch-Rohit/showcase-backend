import { Strategy as GoogleStrategy} from 'passport-google-oauth20';
import passport from 'passport';
import mongoose from 'mongoose';

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

  module.exports=function (passport){
      passport.use(
          new GoogleStrategy(
              {
                  clientID:"266180329378-p4p9u02r34bi2oai9j9enmnsjf0j3vg8.apps.googleusercontent.com",
                  clientSecret:"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",
                  clientURL:'auth/google/callback',
              },
              async(accessToken,refreshToken,profile, done)=>{
                return done(null,profile);
              }
          )
      )
      passport.serializeUser((user,done)=>{
          done(null,user)
      })
      passport.deserializeUser((user,done)=>{
            done(null,user)
      })
  }