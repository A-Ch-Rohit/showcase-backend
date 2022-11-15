import Express from 'express';
import session from 'express-session';
import mongodb from 'mongodb';
import ejs, { render } from 'ejs';
import mongoose from 'mongoose';
import path from 'path';
import bodyParser from 'body-parser';
import cors from "cors";
import dotenv from 'dotenv';
import {OAuth2Client} from 'google-auth-library';
import sgMail from '@sendgrid/mail';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import Product from './models/products.js';
import Save from './models/save.js';
import Subscribe from './models/subscribe.js';
import { cachedDataVersionTag } from 'v8';
import Razorpay from "razorpay"
import shortid from 'shortid';
import fetch from "node-fetch";
import global from "global"
import document from 'global/document.js';
import window from 'global/window.js';

//require('./passport-setup');
//importing the routing modules


const app = Express();
dotenv.config();



//Google Api OAuth
const CLIENT_ID="266180329378-p4p9u02r34bi2oai9j9enmnsjf0j3vg8.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

//SendGrid Api
var SENDGRID_API_KEY="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";
sgMail.setApiKey(SENDGRID_API_KEY);
var JWT_ACC_ACTIVATE="accountactivate123";

//Firebase Api
const firebase = {
    apiKey: "AIzaSyDPOH76XqzglF-v1w2KoDmI4zeo9GDo-tA",
    authDomain: "showcase-7121e.firebaseapp.com",
    projectId: "showcase-7121e",
    storageBucket: "showcase-7121e.appspot.com",
    messagingSenderId: "242305064415",
    appId: "1:242305064415:web:39d96662217ef6adb6386a",
    measurementId: "G-4X4Z7VQDW0"
  };


var MongoClient = mongodb.MongoClient;
mongoose.connect(
    "mongodb+srv://rohit_qs:quri442@cluster0.xngju.mongodb.net/Showcase?retryWrites=true&w=majority", 

  );

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
    whatsapp:{
        type: Number,
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
    location:{
        type: [Number],
        index: '2d',
      },
    address:{
        type:String,
    },
    country: {
      type: String,
    },
    isVerified:{
        type:Boolean,
    },
    picture:{
        type:String,
    },
    bio:{
        type:String,
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    isPaid:{
        type:Boolean
    },
    orderId:{
        type:String
    }
  });
  
  const User = mongoose.model("accounts", UserSchema);

app.locals.rmWhitespace = true;
app.locals.rmWhitespace = true;




const NODE_ENV='development';
const __dirname = path.resolve();
app.set('views',path.join(__dirname +'/views'));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(Express.static("public"));

/*var corsOptions = {
  origin: "http://localhost:8081"
};*/

//app.use(cors(corsOptions));
app.use(Express.json());
app.use(cors());

//Session
app.use(
    session({
        name:'sid',
        saveUninitialized:true,
        resave:false,
        secret:'Cant disclose it pal! its a secret',
        cookie:{
            //60000 = 1 minute
            //30min
            maxAge:1000*60*30,
            sameSite:true,
            secure:process.env.NODE_ENV === 'production',
        }
    })
)


const reDirectLogin=(req,res,next)=>{
    if(!req.session.userId){
        res.redirect('/login');
    }else{
        next();
    }
}

var shoes;

var company_products=[];
var wtp=[];
/*app.get('/locate',(req,res)=>{
    res.render('locate');
})*/
MongoClient.connect('mongodb+srv://rohit_qs:quri442@cluster0.xngju.mongodb.net/Showcase?retryWrites=true&w=majority', function (err, client) {
    if (err) throw err
    var db = client.db('Showcase')
    db.collection('accounts').find({type:"business"}).toArray(function (err, result) {
        if (err) throw err
           wtp=result;
       }
   )
})
app.get('/',(req,res)=>{
   /* if(ss){
        profile();
    }*/
    const user=req.session;
    MongoClient.connect('mongodb+srv://rohit_qs:quri442@cluster0.xngju.mongodb.net/Showcase?retryWrites=true&w=majority', function (err, client) {
    if (err) throw err

    var db = client.db('Showcase')
    db.collection('accounts').find({type:"business"}).toArray(function (err, result) {
        if (err) throw err
           wtp=result;
       }
   )

    db.collection('products').find().toArray(function (err, result) {
         if (err) throw err
            shoes=result;
            if(shoes){
                res.render('landing',{user,shoes,wtp});
            }
        }
    )

   
})
   
});

app.post('/save-video',(req,res)=>{
    if(req.session.userId && req.session.type==="personal"){
        let product={};
        product.company_name=req.body.video_comp;
        product.company_email=req.body.video_email;
        product.brand=req.body.video_brand;
        product.type=req.body.video_type;
        product.category=req.body.video_category;
        product.amt=req.body.video_amt;
        product.description=req.body.video_description;
        product.video=req.body.video_link;
        let newsave = new Save({
            user_email:req.session.email,
            pdt_brand: product.brand,
            pdt_type: product.type,
            pdt_category: product.category,
            pdt_amt: product.amt,
            pdt_description:product.description,
            company_email:product.company_email,
            company_name: product.company_name,
            pdt_video: product.video,
            pdt_filename:product.filename,
        });
        newsave.save();
        //res.redirect(req.originalUrl) refresh current page
        res.redirect('back');
    }
})
var ss;
var prof;
var prof_name="";
/*function profile(){*/
    /*if(ss){
        console.log("split");
        prof=ss.split(" ");
        for(let i=0;i<prof.length;i++){
            prof_name=prof_name+prof[i];
          
        }
        console.log(prof_name);
    }*/
 /*  profiles.forEach(item=>{

    })
}*/
//razorpay============================================================================================
const razorpay = new Razorpay({
    key_id: 'rzp_test_Rk1Z4keHMYy91P',
    key_secret: 'Le625ybfI51ywnWUNCF41Pht',
});

app.post("/razorpay",async (req,res)=>{    
    
    const options = {
        amount: 10000,  
        currency: "INR",
        receipt: shortid.generate()
    };
    await razorpay.orders.create(options, async function(err, order) {
        await User.updateOne({"email":req.session.email},{createdAt:Date(),orderId:order.id,isPaid:true})
        res.json({
            id:order.id,
            currency:order.currency,
            amount:order.amount
    })
    });
      
})

app.get("/qurinom.jpg",(req,res)=>{
    res.sendFile(path.join(__dirname, 'qurinom.jpg'))
})

const checkValidity=(req,res,next)=>{
    MongoClient.connect('mongodb+srv://rohit_qs:quri442@cluster0.xngju.mongodb.net/Showcase?retryWrites=true&w=majority', function (err, client) {
        if (err) throw err
        var db = client.db('Showcase')
        db.collection('accounts').findOne({"email" : req.session.email,"type":"business"},function (err, result) {
          if (err) throw err
          console.log(result)
          if(result){
              const prevDate=result.createdAt
              const currDate=new Date()
              var diff=currDate.getTime()-prevDate.getTime()
              const days=Math.ceil(diff/(1000*3600*24))
              if(days>30){
                  res.sendFile(path.join(__dirname+"/index.html"))
              }
          }
        next()
        })
    })
    
}

//var profiles=[];
var profile={};
app.get('/profile',checkValidity,(req,res)=>{

    
    if(req.session.userId){
        var user;
      
        MongoClient.connect('mongodb+srv://rohit_qs:quri442@cluster0.xngju.mongodb.net/Showcase?retryWrites=true&w=majority', function (err, client) {
            if (err) throw err
      
            var db = client.db('Showcase')
      
            db.collection('accounts').findOne({"email":req.session.email},(function (err, result) {
                 if (err) throw err
                 if(result.picture!==undefined&&result.picture){
                     req.session.picture=result.picture;
                }
                if(result.bio!==undefined&&result.bio){
                    profile.bio=result.bio;
                }
                if(req.session.type==="business"){
                    profile.phone=result.phone;
                    profile.code=result.code;
                }
                 

                user=req.session;
                            if(user.type==="personal"){
                                MongoClient.connect('mongodb+srv://rohit_qs:quri442@cluster0.xngju.mongodb.net/Showcase?retryWrites=true&w=majority', function (err, client) {
                                    if (err) throw err
            
                                    var db = client.db('Showcase')
            
                                    db.collection('saveds').find({"user_email": user.email}).toArray(function (err, result) {
                                        if (err) throw err
                                            res.render("personal-profile",{user,wtp,profile,my_products:result})
                                        }
                                    )
                            })
        
                                
                            }
                            else{
                                MongoClient.connect('mongodb+srv://rohit_qs:quri442@cluster0.xngju.mongodb.net/Showcase?retryWrites=true&w=majority', function (err, client) {
                                        if (err) throw err
                
                                        var db = client.db('Showcase')
                
                                        db.collection('products').find({"company_email": user.email}).toArray(function (err, result) {
                                            if (err) throw err
                                                company_products=result;
                                                res.render("business-profile",{user,profile,wtp,
                                                    my_products:company_products})
                                            }
                                        )
                                })
                               
                            }

            })
            )   
        }) 


        
    }
    else{
        res.redirect('/login');
    }
})
app.get('/account/edit',reDirectLogin,(req,res)=>{
        const user=req.session;
        MongoClient.connect('mongodb+srv://rohit_qs:quri442@cluster0.xngju.mongodb.net/Showcase?retryWrites=true&w=majority', function (err, client) {
            if (err) throw err
      
            var db = client.db('Showcase')
      
            db.collection('accounts').findOne({"email":req.session.email},(function (err, result) {
                 if (err) throw err
                if(result.bio!==undefined&&result.bio){
                    if(req.session.type==="personal"){
                        res.render('edit-personal',{user,wtp,p:{bio:result.bio}});
                    }
                    else if(req.session.type==="business"){
                        /*    profile.phone=result.phone;
                            profile.code=result.code;*/
                        res.render('edit-business',{user,wtp,p:{whatsapp:result.whatsapp,phone:result.phone,bio:result.bio}});
                    }
                }
                else{
                    if(req.session.type==="personal"){
                        res.render('edit-personal',{user,wtp,p:{bio:result.bio}});
                    }
                    else if(req.session.type==="business"){
                        res.render('edit-business',{user,wtp,p:{whatsapp:result.whatsapp,phone:result.phone,bio:result.bio}});
                    }
                }

            }))})
        
})
/*app.get('/:id',(req,res)=>{
    const user=req.session;
    if(user){
                    if(user.type==="personal"){
                        res.render("home",{user,shoes})
                    }
                    else{
                        MongoClient.connect('mongodb+srv://rohit_qs:quri442@cluster0.xngju.mongodb.net/Showcase?retryWrites=true&w=majority', function (err, client) {
                                if (err) throw err
        
                                var db = client.db('Showcase')
        
                                db.collection('products').find({"company_email": user.email}).toArray(function (err, result) {
                                    if (err) throw err
                                        company_products=result;
                                        res.render("business-home",{user,
                                            my_products:company_products})
                                    }
                                )
                        })
                       
                    }

        
    }
    else{
        res.redirect('/login');
    }
})
*/
/*app.get('/p',reDirectLogin,function(req,res){
    const user=req.session;
    MongoClient.connect('mongodb+srv://rohit_qs:quri442@cluster0.xngju.mongodb.net/Showcase?retryWrites=true&w=majority', function (err, client) {
    if (err) throw err

    var db = client.db('Showcase')

    db.collection('accounts').findOne({"email":req.session.email},(function (err, result) {
        if (err) throw err

            if(result.type==="personal"){
                res.render("home",{user,shoes})
            }
            else{
                MongoClient.connect('mongodb+srv://rohit_qs:quri442@cluster0.xngju.mongodb.net/Showcase?retryWrites=true&w=majority', function (err, client) {
                        if (err) throw err

                        var db = client.db('Showcase')

                        db.collection('products').find({"company_email": user.email}).toArray(function (err, result) {
                            if (err) throw err
                                company_products=result;
                                res.render("business-home",{user,
                                    my_products:company_products})
                            }
                        )
                })
               
            }
        })
    )
})
})*/

    /*console.log(req.session);
    console.log(req.session.cookie);
    console.log(req.session.cookie.expires);
    console.log(req.session.cookie.maxAge);
    console.log(req.session.sid);
    console.log(req.sessionID);*/
        



  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error: "));
  db.once("open", function () {
    console.log("Connected successfully");
  });

/*
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile','email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.session.userId=1;
    res.redirect('/');
  });
*/

//login page 

var f_message='';
var email
//login page
app.get('/login',(req,res)=>{
    const user=req.session;
    res.render("login",{user,wtp,f_message});
    f_message="";
})

var session_email = "";

var acct={};
var gVerified=false;
var g_token;
//Google Authentication for Login
app.post('/google-login',(req,res)=>{
    let token=req.body.token;
    g_token=token;
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        acct.name=payload.name;
        acct.email=payload.email;
        acct.picture=payload.picture;
        // If request specified a G Suite domain:
        // const domain = payload['hd'];
      }
      verify().then(()=>{
        MongoClient.connect('mongodb+srv://rohit_qs:quri442@cluster0.xngju.mongodb.net/Showcase?retryWrites=true&w=majority', function (err, client) {
            if (err) throw err
      
            var db = client.db('Showcase')
      
            db.collection('accounts').findOne({"email":acct.email},(function (err, result) {
                 if (err) throw err
                 if(result){

                    req.session.token=token;
                    req.session.userId=1;
                    req.session.email=acct.email;
                    if(result.picture!==undefined&&result.picture){
                        req.session.picture=result.picture;
                    }
                    else{
                        req.session.picture=acct.picture;
                    }
                    req.session.name=result.name;
                    req.session.type=result.type;
                    ss=req.session.name;
                    res.send('success');                     
                }
                else{
                    gVerified=true;
                    res.send('register');
                }
            })
            )   
        })  

      })
      .catch(err=>{
          gVerified=false;
          res.redirect('/login');
    })
})

//Google users to register to our page
app.get('/auth/google/register',(req,res)=>{
    const user=req.session;
    if(gVerified!==true){
        res.redirect('/login');
    }
    else{
        gVerified=false;
        res.render('google-register',{user,wtp,acct});
    }
})


app.post('/auth/google/register',(req,res)=>{
    if(req.body.act_type=="Personal"){
        ty="personal";
        const pass = req.body.gp;
        const saltRounds = 10;
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) {
                throw err
            } else {
            bcrypt.hash(pass, salt, function(err, hash) {
                if (err) {
                    throw err
                } else {
                    let newuser = new User({
                        name : acct.name,
                        email : acct.email,
                        password : hash,
                        type : ty,
                        isVerified:true,
                        picture:acct.picture
                    });
                    req.session.token=g_token;
                    req.session.email=acct.email;
                    req.session.picture=acct.picture;
                    req.session.name=acct.name;
                    req.session.type=ty;
                    req.session.userId=1;
                    ss=req.session.name;
                    newuser.save();
                    console.log("Account Activated!")
                    success=1;
                    res.redirect('/setup-completed');

//$2a$10$FEBywZh8u9M0Cec/0mWep.1kXrwKeiWDba6tdKvDfEBjyePJnDT7K
                }
            })

            }
        }) 
    }
    else{
        business_password=req.body.gp;
        ty="business";
        res.render('google-register-business',{wtp});
    }
})
app.post('/auth/google/register/business',(req,res)=>{
                const pass = business_password;
                const lat=req.body.lat;
                const lon=req.body.lon;
                const saltRounds = 10;
                bcrypt.genSalt(saltRounds, function (err, salt) {
                if (err) {
                    throw err
                } else {
                    bcrypt.hash(pass, salt, function(err, hash) {
                if (err) {
                    throw err
                } else {
                    let ct_cd="";
                    let ct="";
                    country_details.forEach((item)=>{
                        var str=item.name+" "+item.dial_code;
                        if(req.body.country===str){
                            ct_cd=item.dial_code;
                            ct=item.name;
                        }
                    })
                   /* let p_code=ct_cd.split("+")
                    let link="http://wa.me/"+p_code[1]+req.body.wp;*/
                    let newuser = new User({
                        name : acct.name,
                        email : acct.email,
                        password : hash,
                        whatsapp:req.body.wp,
                        //whatsapp_link:link,
                        phone:req.body.ph,
                        code:ct_cd,
                        address:req.body.address,
                        country:ct,
                        type : ty,
                        location:[lat,lon],
                        isVerified:true,
                        picture:acct.picture,
                        bio:"Add Bio"
                    });
                    
                    req.session.userId=1;
                    req.session.token=g_token;
                    req.session.email = acct.email;
                    req.session.picture=acct.picture;
                    req.session.type=ty;
                    req.session.name=acct.name;
                    ss=req.session.name;
                    newuser.save();
                    console.log("Account Activated!")
                    success=1;
                    res.redirect('/setup-completed');

        //$2a$10$FEBywZh8u9M0Cec/0mWep.1kXrwKeiWDba6tdKvDfEBjyePJnDT7K
                        }
                    })
        
                    }
                })
})

app.post('/login',async(req,res)=>{
  
    MongoClient.connect('mongodb+srv://rohit_qs:quri442@cluster0.xngju.mongodb.net/Showcase?retryWrites=true&w=majority', function (err, client) {
        if (err) throw err
  
        var db = client.db('Showcase')
  
         db.collection('accounts').findOne({"email":req.body.e_id},(function (err, result) {
             if (err) throw err
             if(result){

                

                const passwordEnteredByUser = req.body.pwd;
                const hash = result.password;
                bcrypt.compare(passwordEnteredByUser, hash, function(err, isMatch) {
                 if (err) {
                     throw err
                } else if (!isMatch) {
                    f_message="Incorrect Password";
                    res.redirect('/login');
                 } else {
                    session_email = req.body.e_id;
                    req.session.email=req.body.e_id;
                    req.session.name=result.name;
                    req.session.picture="";
                    req.session.userId=1;
                    req.session.type=result.type;
                    ss=req.session.name;
                    res.redirect('/');
                        }
                })

            }
            else{
                f_message="Email Address not found";
                res.redirect('/login');
            }
            })
    )
})

    /*
    if(users){
        if(users.password==pwd){
            req.session.userId=1;
            res.redirect('/');
        }
        else{
            res.send("Incorrect Password")
        }
    }
    else{
        res.send("Email Not found")
    }*/

})


/*app.get('/logout',(req,res,next)=>{
       next()
})*/
app.get('/logout',(req,res)=>{

    session_email = "";
    req.session.destroy((err,next)=>{
        if(err){
            next()
        }
        res.clearCookie('sid');
        res.redirect('/login');
}

)
});

var ty = "";


app.get('/account',(req,res)=>{
    const user=req.session;
    res.render('join-us',{user,wtp});
})
/*app.post('/account',(req,res)=>{
    if(req.body.type=="Personal"){
        ty = "personal";
        res.redirect('/personal/sign-up')
    }
    else{
        ty = "business";
        res.redirect('/business/sign-up')
    }
})*/
var p_message='';
app.get('/personal/sign-up',(req,res)=>{
    const user=req.session;
        res.render("personal-signup",{user,p_message,wtp});
        p_message="";

})

app.post('/personal/sign-up',(req,res)=>{
    MongoClient.connect('mongodb+srv://rohit_qs:quri442@cluster0.xngju.mongodb.net/Showcase?retryWrites=true&w=majority', function (err, client) {
        if (err) throw err
        var db = client.db('Showcase')
        db.collection('accounts').findOne({"email" : req.body.email},function (err, result) {
          if (err) throw err
          if(result){
              p_message="Email already exists !"
              res.redirect('/personal/sign-up');
          }

          else{
            const n=req.body.name;
            const e=req.body.email;
            const p=req.body.cp;
            const token=jwt.sign({n,e,p},JWT_ACC_ACTIVATE,{expiresIn:'20m'})
            

            const msg = {
                to: e, // Change to your recipient
                from: 'showcaseofficial0@gmail.com', // Change to your verified sender
                subject: 'Email Verification - Showcase',
                text: `Hello, thanks for registering on our site.
                        Please copy and paste the address below to verify your account
                        http://localhost:4000/personal/authentication/activate/${token}`,
                html: `<section style="width:70%;margin-left:15%;">
                        <div style="text-align:left">
                        <a href="http://localhost:4000/" class="img-logo" style="text-decoration:none;margin-right:350px">
                        <img src="https://firebasestorage.googleapis.com/v0/b/showcase-7121e.appspot.com/o/logo%2FShowCase%20logo-modified-1.png?alt=media&token=8787372b-88e2-4636-a6c6-05203bf72921" width="150px">
                        </a>
                        </div>
                        <h1 style="text-align:left">✔️ Verify Your Email Address</h1><br>
                        <p style="text-align:left">Hi ${n},</p>
                        <p>Thanks for signing up to Showcase,
                        <p style="text-align:left">To activate and get access to your account please verify your email address by clicking the link below  </p><br>
                                                        
                        <div style="text-align:left;">  <a href="http://localhost:4000/personal/authentication/activate/${token}" style="text-decoration:none;align-items:center;text-align:center;    font-family:Roboto;font-style: normal; font-weight: bold;font-size: 14px;line-height: 20px;letter-spacing: 0.2px;padding: 14px 42px 14px 42px;background-color: #3371f2;color: white;border:none;border-radius: 85px;">Verify email address</a></div><br><br><br>
                        <p style="text-align:left">Or, copy and paste the following URL into your browser:</p>
                        <p style="text-align:left">http://localhost:4000/personal/authentication/activate/${token}</p><br>
                        <hr/>
                        </section>`,
                    }

                sgMail
                .send(msg)
                .then(() => {
                    ty="personal";
                  console.log('Email sent')
                  res.redirect("/authentication/activate/email-sent");
                })
                .catch((error) => {
                  console.error(error)
                })
              
          }
        
        })
    })
})

app.get('/authentication/activate/email-sent',(req,res)=>{
    if(ty===""){
        res.redirect('/account');
      }
      else{
        res.render("email-sent",{e_message,wtp});
      }
})


app.get('/personal/authentication/activate/:token',(req,res)=>{
    if(ty==="personal"){
    ty="personal";
    const token=req.params.token;
    if(token){
        jwt.verify(token,JWT_ACC_ACTIVATE,function(err,decodedToken){

            if(err){
                res.send("Incorrect or Expired Link");
            }
            const {n,e,p}=decodedToken;
            ty="personal";
            if(req.session.userId){
                req.session.destroy((err,next)=>{
                        if(err){
                            next()
                        }
                        res.clearCookie('sid');
                })
                session_email = "";
                }
                


                const pass = p;
                const saltRounds = 10;
                bcrypt.genSalt(saltRounds, function (err, salt) {
                if (err) {
                    throw err
                } else {
                    bcrypt.hash(pass, salt, function(err, hash) {
                if (err) {
                    throw err
                } else {
                    let newuser = new User({
                        name : n,
                        email : e,
                        password : hash,
                        type : ty,
                        isVerified:true,
                    });
                    acct.name=n;
                    acct.email=e;
                    acct.picture="";
                    req.session.userId=1;
                    req.session.email = e;
                    req.session.name=n;
                    req.session.picture="";
                    req.session.type=ty;
                    ss=req.session.name;
                    newuser.save();
                    console.log("Account Activated!")
                    success=1;
                    res.redirect('/setup-completed');

        //$2a$10$FEBywZh8u9M0Cec/0mWep.1kXrwKeiWDba6tdKvDfEBjyePJnDT7K
                        }
                    })
        
                    }
                }) 
        })
    }
    else{
        res.send("Something went wrong");
    }
}
else{
    res.redirect('/account');
}
})


var success=0;
app.get('/setup-completed',(req,res)=>{
    const user=req.session;
    if(ty===""||success===0){
        res.redirect('/account');
      }
      else{
        res.render('setup-completed',{user,wtp});
        success=0;
      }
});
var b_message='';
app.get('/business/sign-up',(req,res)=>{
         const user=req.session;
        res.render("business-signup",{user,wtp,b_message});
        b_message="";

    
})

var business_name= "";
var business_email = "";
var business_password = "";
var business_phone=0;
var business_address="";
var business_country="";
var business_isVerified=false;
var country_details=[{"name":"Afghanistan","dial_code":"+93","code":"AF"},{"name":"Albania","dial_code":"+355","code":"AL"},{"name":"Algeria","dial_code":"+213","code":"DZ"},{"name":"AmericanSamoa","dial_code":"+1 684","code":"AS"},{"name":"Andorra","dial_code":"+376","code":"AD"},{"name":"Angola","dial_code":"+244","code":"AO"},{"name":"Anguilla","dial_code":"+1 264","code":"AI"},{"name":"Antarctica","dial_code":"+672","code":"AQ"},{"name":"Antigua and Barbuda","dial_code":"+1268","code":"AG"},{"name":"Argentina","dial_code":"+54","code":"AR"},{"name":"Armenia","dial_code":"+374","code":"AM"},{"name":"Aruba","dial_code":"+297","code":"AW"},{"name":"Australia","dial_code":"+61","code":"AU"},{"name":"Austria","dial_code":"+43","code":"AT"},{"name":"Azerbaijan","dial_code":"+994","code":"AZ"},{"name":"Bahamas","dial_code":"+1 242","code":"BS"},{"name":"Bahrain","dial_code":"+973","code":"BH"},{"name":"Bangladesh","dial_code":"+880","code":"BD"},{"name":"Barbados","dial_code":"+1 246","code":"BB"},{"name":"Belarus","dial_code":"+375","code":"BY"},{"name":"Belgium","dial_code":"+32","code":"BE"},{"name":"Belize","dial_code":"+501","code":"BZ"},{"name":"Benin","dial_code":"+229","code":"BJ"},{"name":"Bermuda","dial_code":"+1 441","code":"BM"},{"name":"Bhutan","dial_code":"+975","code":"BT"},{"name":"Bolivia, Plurinational State of","dial_code":"+591","code":"BO"},{"name":"Bosnia and Herzegovina","dial_code":"+387","code":"BA"},{"name":"Botswana","dial_code":"+267","code":"BW"},{"name":"Brazil","dial_code":"+55","code":"BR"},{"name":"British Indian Ocean Territory","dial_code":"+246","code":"IO"},{"name":"Brunei Darussalam","dial_code":"+673","code":"BN"},{"name":"Bulgaria","dial_code":"+359","code":"BG"},{"name":"Burkina Faso","dial_code":"+226","code":"BF"},{"name":"Burundi","dial_code":"+257","code":"BI"},{"name":"Cambodia","dial_code":"+855","code":"KH"},{"name":"Cameroon","dial_code":"+237","code":"CM"},{"name":"Canada","dial_code":"+1","code":"CA"},{"name":"Cape Verde","dial_code":"+238","code":"CV"},{"name":"Cayman Islands","dial_code":"+ 345","code":"KY"},{"name":"Central African Republic","dial_code":"+236","code":"CF"},{"name":"Chad","dial_code":"+235","code":"TD"},{"name":"Chile","dial_code":"+56","code":"CL"},{"name":"China","dial_code":"+86","code":"CN"},{"name":"Christmas Island","dial_code":"+61","code":"CX"},{"name":"Cocos (Keeling) Islands","dial_code":"+61","code":"CC"},{"name":"Colombia","dial_code":"+57","code":"CO"},{"name":"Comoros","dial_code":"+269","code":"KM"},{"name":"Congo","dial_code":"+242","code":"CG"},{"name":"Congo, The Democratic Republic of the","dial_code":"+243","code":"CD"},{"name":"Cook Islands","dial_code":"+682","code":"CK"},{"name":"Costa Rica","dial_code":"+506","code":"CR"},{"name":"Cote d'Ivoire","dial_code":"+225","code":"CI"},{"name":"Croatia","dial_code":"+385","code":"HR"},{"name":"Cuba","dial_code":"+53","code":"CU"},{"name":"Cyprus","dial_code":"+357","code":"CY"},{"name":"Czech Republic","dial_code":"+420","code":"CZ"},{"name":"Denmark","dial_code":"+45","code":"DK"},{"name":"Djibouti","dial_code":"+253","code":"DJ"},{"name":"Dominica","dial_code":"+1 767","code":"DM"},{"name":"Dominican Republic","dial_code":"+1 849","code":"DO"},{"name":"Ecuador","dial_code":"+593","code":"EC"},{"name":"Egypt","dial_code":"+20","code":"EG"},{"name":"El Salvador","dial_code":"+503","code":"SV"},{"name":"Equatorial Guinea","dial_code":"+240","code":"GQ"},{"name":"Eritrea","dial_code":"+291","code":"ER"},{"name":"Estonia","dial_code":"+372","code":"EE"},{"name":"Ethiopia","dial_code":"+251","code":"ET"},{"name":"Falkland Islands (Malvinas)","dial_code":"+500","code":"FK"},{"name":"Faroe Islands","dial_code":"+298","code":"FO"},{"name":"Fiji","dial_code":"+679","code":"FJ"},{"name":"Finland","dial_code":"+358","code":"FI"},{"name":"France","dial_code":"+33","code":"FR"},{"name":"French Guiana","dial_code":"+594","code":"GF"},{"name":"French Polynesia","dial_code":"+689","code":"PF"},{"name":"Gabon","dial_code":"+241","code":"GA"},{"name":"Gambia","dial_code":"+220","code":"GM"},{"name":"Georgia","dial_code":"+995","code":"GE"},{"name":"Germany","dial_code":"+49","code":"DE"},{"name":"Ghana","dial_code":"+233","code":"GH"},{"name":"Gibraltar","dial_code":"+350","code":"GI"},{"name":"Greece","dial_code":"+30","code":"GR"},{"name":"Greenland","dial_code":"+299","code":"GL"},{"name":"Grenada","dial_code":"+1 473","code":"GD"},{"name":"Guadeloupe","dial_code":"+590","code":"GP"},{"name":"Guam","dial_code":"+1 671","code":"GU"},{"name":"Guatemala","dial_code":"+502","code":"GT"},{"name":"Guernsey","dial_code":"+44","code":"GG"},{"name":"Guinea","dial_code":"+224","code":"GN"},{"name":"Guinea-Bissau","dial_code":"+245","code":"GW"},{"name":"Guyana","dial_code":"+595","code":"GY"},{"name":"Haiti","dial_code":"+509","code":"HT"},{"name":"Holy See (Vatican City State)","dial_code":"+379","code":"VA"},{"name":"Honduras","dial_code":"+504","code":"HN"},{"name":"Hong Kong","dial_code":"+852","code":"HK"},{"name":"Hungary","dial_code":"+36","code":"HU"},{"name":"Iceland","dial_code":"+354","code":"IS"},{"name":"India","dial_code":"+91","code":"IN"},{"name":"Indonesia","dial_code":"+62","code":"ID"},{"name":"Iran, Islamic Republic of","dial_code":"+98","code":"IR"},{"name":"Iraq","dial_code":"+964","code":"IQ"},{"name":"Ireland","dial_code":"+353","code":"IE"},{"name":"Isle of Man","dial_code":"+44","code":"IM"},{"name":"Israel","dial_code":"+972","code":"IL"},{"name":"Italy","dial_code":"+39","code":"IT"},{"name":"Jamaica","dial_code":"+1 876","code":"JM"},{"name":"Japan","dial_code":"+81","code":"JP"},{"name":"Jersey","dial_code":"+44","code":"JE"},{"name":"Jordan","dial_code":"+962","code":"JO"},{"name":"Kazakhstan","dial_code":"+7 7","code":"KZ"},{"name":"Kenya","dial_code":"+254","code":"KE"},{"name":"Kiribati","dial_code":"+686","code":"KI"},{"name":"Korea, Democratic People's Republic of","dial_code":"+850","code":"KP"},{"name":"Korea, Republic of","dial_code":"+82","code":"KR"},{"name":"Kuwait","dial_code":"+965","code":"KW"},{"name":"Kyrgyzstan","dial_code":"+996","code":"KG"},{"name":"Lao People's Democratic Republic","dial_code":"+856","code":"LA"},{"name":"Latvia","dial_code":"+371","code":"LV"},{"name":"Lebanon","dial_code":"+961","code":"LB"},{"name":"Lesotho","dial_code":"+266","code":"LS"},{"name":"Liberia","dial_code":"+231","code":"LR"},{"name":"Libyan Arab Jamahiriya","dial_code":"+218","code":"LY"},{"name":"Liechtenstein","dial_code":"+423","code":"LI"},{"name":"Lithuania","dial_code":"+370","code":"LT"},{"name":"Luxembourg","dial_code":"+352","code":"LU"},{"name":"Macao","dial_code":"+853","code":"MO"},{"name":"Macedonia, The Former Yugoslav Republic of","dial_code":"+389","code":"MK"},{"name":"Madagascar","dial_code":"+261","code":"MG"},{"name":"Malawi","dial_code":"+265","code":"MW"},{"name":"Malaysia","dial_code":"+60","code":"MY"},{"name":"Maldives","dial_code":"+960","code":"MV"},{"name":"Mali","dial_code":"+223","code":"ML"},{"name":"Malta","dial_code":"+356","code":"MT"},{"name":"Marshall Islands","dial_code":"+692","code":"MH"},{"name":"Martinique","dial_code":"+596","code":"MQ"},{"name":"Mauritania","dial_code":"+222","code":"MR"},{"name":"Mauritius","dial_code":"+230","code":"MU"},{"name":"Mayotte","dial_code":"+262","code":"YT"},{"name":"Mexico","dial_code":"+52","code":"MX"},{"name":"Micronesia, Federated States of","dial_code":"+691","code":"FM"},{"name":"Moldova, Republic of","dial_code":"+373","code":"MD"},{"name":"Monaco","dial_code":"+377","code":"MC"},{"name":"Mongolia","dial_code":"+976","code":"MN"},{"name":"Montenegro","dial_code":"+382","code":"ME"},{"name":"Montserrat","dial_code":"+1664","code":"MS"},{"name":"Morocco","dial_code":"+212","code":"MA"},{"name":"Mozambique","dial_code":"+258","code":"MZ"},{"name":"Myanmar","dial_code":"+95","code":"MM"},{"name":"Namibia","dial_code":"+264","code":"NA"},{"name":"Nauru","dial_code":"+674","code":"NR"},{"name":"Nepal","dial_code":"+977","code":"NP"},{"name":"Netherlands","dial_code":"+31","code":"NL"},{"name":"Netherlands Antilles","dial_code":"+599","code":"AN"},{"name":"New Caledonia","dial_code":"+687","code":"NC"},{"name":"New Zealand","dial_code":"+64","code":"NZ"},{"name":"Nicaragua","dial_code":"+505","code":"NI"},{"name":"Niger","dial_code":"+227","code":"NE"},{"name":"Nigeria","dial_code":"+234","code":"NG"},{"name":"Niue","dial_code":"+683","code":"NU"},{"name":"Norfolk Island","dial_code":"+672","code":"NF"},{"name":"Northern Mariana Islands","dial_code":"+1 670","code":"MP"},{"name":"Norway","dial_code":"+47","code":"NO"},{"name":"Oman","dial_code":"+968","code":"OM"},{"name":"Pakistan","dial_code":"+92","code":"PK"},{"name":"Palau","dial_code":"+680","code":"PW"},{"name":"Palestinian Territory, Occupied","dial_code":"+970","code":"PS"},{"name":"Panama","dial_code":"+507","code":"PA"},{"name":"Papua New Guinea","dial_code":"+675","code":"PG"},{"name":"Paraguay","dial_code":"+595","code":"PY"},{"name":"Peru","dial_code":"+51","code":"PE"},{"name":"Philippines","dial_code":"+63","code":"PH"},{"name":"Pitcairn","dial_code":"+872","code":"PN"},{"name":"Poland","dial_code":"+48","code":"PL"},{"name":"Portugal","dial_code":"+351","code":"PT"},{"name":"Puerto Rico","dial_code":"+1 939","code":"PR"},{"name":"Qatar","dial_code":"+974","code":"QA"},{"name":"Romania","dial_code":"+40","code":"RO"},{"name":"Russia","dial_code":"+7","code":"RU"},{"name":"Rwanda","dial_code":"+250","code":"RW"},{"name":"Réunion","dial_code":"+262","code":"RE"},{"name":"Saint Barthélemy","dial_code":"+590","code":"BL"},{"name":"Saint Helena, Ascension and Tristan Da Cunha","dial_code":"+290","code":"SH"},{"name":"Saint Kitts and Nevis","dial_code":"+1 869","code":"KN"},{"name":"Saint Lucia","dial_code":"+1 758","code":"LC"},{"name":"Saint Martin","dial_code":"+590","code":"MF"},{"name":"Saint Pierre and Miquelon","dial_code":"+508","code":"PM"},{"name":"Saint Vincent and the Grenadines","dial_code":"+1 784","code":"VC"}];

var b=0;

app.post('/business/sign-up',(req,res)=>{
        MongoClient.connect('mongodb+srv://rohit_qs:quri442@cluster0.xngju.mongodb.net/Showcase?retryWrites=true&w=majority', function (err, client) {
            if (err) throw err
            var db = client.db('Showcase')
            db.collection('accounts').findOne({"email" : req.body.b_email},function (err, result) {
              if (err) throw err
              if(result){
                b_message="Email already exists !"
                res.redirect('/business/sign-up');
              }
              else{
                    b=1;
                    business_name=req.body.b_name;
                    business_email=req.body.b_email;
                    business_password=req.body.b_cp;
                    res.redirect("/business/sign-up-2");
              }
            })
        })
});


app.get('/business/sign-up-2',(req,res)=>{
    const user=req.session;
    if(business_name===''|| business_email===''||business_password===''){
        b_message="Please enter all the fields";
        res.redirect('/business/sign-up');
      }
      else{
        res.render("business-signup-2",{user,wtp});
        b_message='';
      }
})



app.post('/business/sign-up-2',(req,res)=>{

    MongoClient.connect('mongodb+srv://rohit_qs:quri442@cluster0.xngju.mongodb.net/Showcase?retryWrites=true&w=majority', function (err, client) {
        if (err) throw err
        var db = client.db('Showcase')
        db.collection('accounts').findOne({"email" : business_email},function (err, result) {
          if (err) throw err
          if(result){
              res.send("email already exists !");
          }
          else if(b===0){
            business_name='';
            business_email='';
            business_password='';
            res.redirect('/account');

          }
          
           else{
            const n=business_name;
            const e=business_email;
            const p=business_password;
            const wp=req.body.wp;
            const ph=req.body.ph;
            const ad=req.body.address;
            const ct=req.body.country;
            const lat=req.body.lat;
            const lon=req.body.lon;

            let ct_cd="";
            let cty="";
                    country_details.forEach((item)=>{
                        var str=item.name+" "+item.dial_code;
                        if(req.body.country===str){
                            ct_cd=item.dial_code;
                            cty=item.name;
                        }
                    })

            business_phone=req.body.ph;
            business_address=req.body.address;
            business_country=req.body.country;
            //console.log(business_name+business_email+business_password+business_phone+business_address+business_country);
            const token=jwt.sign({n,e,p,wp,ph,ct_cd,ad,cty,lat,lon},JWT_ACC_ACTIVATE,{expiresIn:'20m'})
            

            const msg = {
                to: e, // Change to your recipient
                from: 'showcaseofficial0@gmail.com', // Change to your verified sender
                subject: 'Email Verification - Showcase',
                text: `Hello, thanks for registering on our site.
                        Please copy and paste the address below to verify your account
                        http://localhost:4000/business/authentication/activate/${token}`,
                html: `<section style="width:70%;margin-left:15%;">
                        <div style="text-align:left">
                        <a href="http://localhost:4000/" class="img-logo" style="text-decoration:none;margin-right:350px">
                        <img src="https://firebasestorage.googleapis.com/v0/b/showcase-7121e.appspot.com/o/logo%2FShowCase%20logo-modified-1.png?alt=media&token=8787372b-88e2-4636-a6c6-05203bf72921" width="150px">
                        </a>
                        </div>
                        <h1 style="text-align:left">✔️ Verify Your Email Address</h1><br>
                        <p style="text-align:left">Hi ${n},</p>
                        <p>Thanks for signing up to Showcase,
                        <p style="text-align:left">To activate and get access to your account please verify your email address by clicking the link below  </p><br>
                                                        
                        <div style="text-align:left;">  <a href="http://localhost:4000/business/authentication/activate/${token}" style="text-decoration:none;align-items:center;text-align:center;    font-family:Roboto;font-style: normal; font-weight: bold;font-size: 14px;line-height: 20px;letter-spacing: 0.2px;padding: 14px 42px 14px 42px;background-color: #3371f2;color: white;border:none;border-radius: 85px;">Verify email address</a></div><br><br><br>
                        <p style="text-align:left">Or, copy and paste the following URL into your browser:</p>
                        <p style="text-align:left">http://localhost:4000/business/authentication/activate/${token}</p><br>
                        <hr/>
                        </section>`,
              }

                sgMail
                .send(msg)
                .then(() => {
                    ty="business";
                  console.log('Email sent')
                  res.redirect("/authentication/activate/email-sent");
                })
                .catch((error) => {
                  console.error(error)
                })
            }
    
        })
    })
})

app.get('/business/authentication/activate/:token',(req,res)=>{
    if(ty==='business'){
    ty="business";
    const token=req.params.token;
    if(token){
        jwt.verify(token,JWT_ACC_ACTIVATE,function(err,decodedToken){

            if(err){
                res.send("Incorrect or Expired Link");
            }
            const {n,e,p,wp,ph,ct_cd,ad,cty,lat,lon}=decodedToken;
            ty="business";
            if(req.session.userId){
                req.session.destroy((err,next)=>{
                        if(err){
                            next()
                        }
                        res.clearCookie('sid');
                })
                session_email = "";
                }
                
               


                const pass = p;
                const saltRounds = 10;
                bcrypt.genSalt(saltRounds, function (err, salt) {
                if (err) {
                    throw err
                } else {
                    bcrypt.hash(pass, salt, function(err, hash) {
                if (err) {
                    throw err
                } else {
                    acct.name=n;
                    acct.email=e;
                    acct.picture="";
                    req.session.userId=1;
                    req.session.email = e;
                    req.session.name=n;
                    req.session.picture="";
                    req.session.type=ty;
                    ss=req.session.name;
                    
                    let newuser = new User({
                        name : n,
                        email : e,
                        password : hash,
                        whatsapp:wp,
                        phone:ph,
                        code:ct_cd,
                        address:ad,
                        country:cty,
                        type : ty,
                        location:[ lat, lon ],
                        isVerified:true,
                        bio:"Add Bio",
                        isPaid:false
                    });
                    newuser.save();
                    console.log("Account Activated!")
                    success=1;
                    res.redirect('/setup-completed');

        //$2a$10$FEBywZh8u9M0Cec/0mWep.1kXrwKeiWDba6tdKvDfEBjyePJnDT7K
                        }
                    })
        
                    }
                }) 
        })
    }
    else{
        res.send("Something went wrong");
    }
}
else{
    res.redirect('/account');
}
})

var r_message = "";
var e_sent = false;
var r_email = "";

app.get('/reset-password',(req,res)=>{
    const user=req.session;
    res.render('reset-password',{user,wtp,
        r_message
    });
    r_message="";
})

var r_verify = false;

app.post('/reset-password',(req,res)=>{


    MongoClient.connect('mongodb+srv://rohit_qs:quri442@cluster0.xngju.mongodb.net/Showcase?retryWrites=true&w=majority', function (err, client) {
        if (err) throw err
        var db = client.db('Showcase')
        db.collection('accounts').findOne({"email" : req.body.r_email},function (err, result) {
          if (err) throw err
          if(result){

            r_email = result.email;
            const rn=result.name;
            const re=result.email;
            const rp=result.password;
           
            
            const token=jwt.sign({rn,re,rp},JWT_ACC_ACTIVATE,{expiresIn:'20m'})
            

            const msg = {
                to: re, // Change to your recipient
                from: 'showcaseofficial0@gmail.com', // Change to your verified sender
                subject: 'Reset Password Link - Showcase',
                text: `Hello ${rn} , 
                        Please copy and paste the address below to reset your account password.
                        http://localhost:4000/reset-password/verify/${token}`,
                html: `<section style="width:70%;margin-left:15%;">
                        <div style="text-align:left">
                        <a href="http://localhost:4000/" class="img-logo" style="text-decoration:none;margin-right:350px">
                        <img src="https://firebasestorage.googleapis.com/v0/b/showcase-7121e.appspot.com/o/logo%2FShowCase%20logo-modified-1.png?alt=media&token=8787372b-88e2-4636-a6c6-05203bf72921" width="150px">
                        </a>
                        </div>
                        <h1 style="text-align:left;">🔑 Reset Password</h1><br>
                        <p style="text-align:left">Hi ${rn},</p>
                        <p style="text-align:left">To confirm it's you please click the below link and change your account password </p><br>
                                                   
                        <div style="text-align:left;">  <a href="http://localhost:4000/reset-password/verify/${token}" style="text-decoration:none;align-items:center;text-align:center;    font-family:Roboto;font-style: normal; font-weight: bold;font-size: 14px;line-height: 20px;letter-spacing: 0.2px;padding: 14px 42px 14px 42px;background-color: #3371f2;color: white;border:none;border-radius: 85px;">Reset Password</a></div><br><br><br>
                        <p style="text-align:left">Or, copy and paste the following URL into your browser:</p>
                        <p style="text-align:left">http://localhost:4000/reset-password/verify/${token}</p><br><br>
                        <hr/>
                        </section>`,
              }

                sgMail
                .send(msg)
                .then(() => {
                  console.log('Reset password link has been sent to you email.');
                  e_sent = true;
                  e_message="success";
                  res.redirect("/reset-password/email-sent");
                })
                .catch((error) => {
                    e_sent = false;
                  console.error(error);
                })

          }
          else{
                
                r_message="Email not found !";
                res.redirect('/reset-password');
          }
        })
    })


});

var e_message="";
app.get('/reset-password/email-sent',(req,res)=>{

    if(e_sent !== true){
        res.redirect('/reset-password');
    }
    else{
        e_sent = false;
        res.render('email-sent',{e_message,wtp});
        e_message="";
    }

});

app.get('/reset-password/verify/:token',(req,res)=>{
    const token = req.params.token;
    if(token)
    {
        jwt.verify(token,JWT_ACC_ACTIVATE,function(err,decodedToken){

            if(err){
                res.send("Incorrect or Expired Link");
            }
            const {n,e,p}=decodedToken;
            r_verify = true;
            res.redirect('/reset-password/change');
        })
    }
    else{
        f_message="Something went wrong.";
        r_verify = false;
        res.redirect('/login');
    }
})

var c_message = "";


app.get('/reset-password/change',(req,res)=>{
    const user=req.session;
    if(r_verify !== true){
        r_message="Enter the email address first!!"
        res.redirect('/reset-password');
    }
    else{
        r_verify = false;
        res.render('change-password',{user,wtp,
            c_message
        });
        c_message="";
    }
    
});

app.post('/reset-password/change',(req,res)=>{

    
        const pass = req.body.new_pwd;
        const c_pass = req.body.c_pwd;
        if (pass === c_pass){

                const saltRounds = 10;
                bcrypt.genSalt(saltRounds, function (err, salt) {
                if (err) {
                    throw err
                } else {
                    bcrypt.hash(pass, salt, function(err, hash) {
                if (err) {
                    throw err
                } else {


                    User.updateOne({ email: r_email }, { password: hash }, function(
                        err,
                        result
                      ) {
                        if (err) {
                          res.send(err);
                        } else {
                            console.log("Password changed Successfully !!");
                        }
                        f_message="Password changed Successfully !!";
                            res.redirect('/login');
                      });
                    

                    /*MongoClient.connect('mongodb+srv://rohit_qs:quri442@cluster0.xngju.mongodb.net/Showcase?retryWrites=true&w=majority', function (err, client) {
                        if (err) throw err
                        var db = client.db('Showcase');
                        
                                     //Updating the subscribe value
                                    db.collection('accounts').updateOne({"email":r_email},{ $set: { password: hash}}),(function (err, results) {
                                        if (err) throw err
                                        console.log("Password changed Successfully !!");
                                    })
                                    
                                    res.redirect('/login');
                        })*/

        //$2a$10$FEBywZh8u9M0Cec/0mWep.1kXrwKeiWDba6tdKvDfEBjyePJnDT7K
                        }
                    })
        
                    }
                }) 

           

        }
        else{
            r_verify = true;
            c_message = "Password does not match";
            res.redirect('/reset-password/change');
        }
       
    

});
//uploading video
app.post('/upload-video',(req,res)=>{
    if(req.session.userId){
        let product={};
        product.company_name=req.session.name;
        product.company_email=req.session.email;
        product.brand=req.body.c_brand;
        product.type=req.body.c_type;
        product.category=req.body.category;
        product.amt=req.body.c_amt;
        product.description=req.body.c_dp;
        product.video=req.body.video_url;
        product.filename=req.body.filename;
        let newproduct = new Product({
            pdt_brand: product.brand,
            pdt_type: product.type,
            pdt_category: product.category,
            pdt_amt: product.amt,
            pdt_description:product.description,
            company_email:product.company_email,
            company_name: product.company_name,
            pdt_video: product.video,
            pdt_filename:product.filename,
        });
        newproduct.save();
        db.collection('subscribers').findOne( { profile_email:product.company_email } ,(function (err, result) {
            var id,pic;
            db.collection('accounts').findOne( { email:product.company_email } ,(function (err, acc) {
                id=acc._id;
                pic=acc.picture;
                if(result && (result.subscribers).length>0){
                    let pa=[];
                    let i=0;
                    (result.subscribers).forEach((item)=>{
                        pa[i]={to:item};
                        i++;
                    })
                 
                    if(pa.length>0 && pa.length===(result.subscribers).length){
                        const msg = {
                            personalizations: pa,
                            from: 'showcaseofficial0@gmail.com',
                            subject: '📦 New product has been added📦',
                            text: `A brand new product has been added by ${product.company_name}. Please click the link to check it out http://localhost:4000/profile=${id}`,
                            html:  `<div style="text-align:center">
                                    <a href="http://localhost:4000/" class="img-logo" style="text-decoration:none;margin-right:350px">
                                    <img src="https://firebasestorage.googleapis.com/v0/b/showcase-7121e.appspot.com/o/logo%2FShowCase%20logo-modified-1.png?alt=media&token=8787372b-88e2-4636-a6c6-05203bf72921" width="150px">
                                    </a>
                                            <a href="http://localhost:4000/profile=${id}"  style="text-decoration:none;">
                                    <img src="${pic}" width="50px" height="50px" style="margin-bottom:12px;border-radius:100%">
                                    </a>
                                    </div>
                                    <h1 style="text-align:center">📦 Product Added</h1><br>
                                    <p style="text-align:center">A brand new ${product.category} has been added by ${product.company_name}. Please click the link to check it out</p>
                                    <p style="text-align:center">http://localhost:4000/profile=${id}</p><br>
                                                      <div style="text-align:center;">  <a href="http://localhost:4000/profile=${id}" style="text-decoration:none;align-items:center;text-align:center;    font-family:Roboto;font-style: normal; font-weight: bold;font-size: 14px;line-height: 20px;letter-spacing: 0.2px;padding: 14px 42px 14px 42px;background-color: #3371f2;color: white;border:none;border-radius: 85px;">Check Out Profile</a></div>`,
                          };
                          
                          sgMail.send(msg).then(() => {
                            console.log('Email Notification to the Subscribers sent successfully!');
                            res.redirect('/profile');
                           
                            
                          }).catch(error => {
                            console.log(error);
                          });
                    }
                    else{
                        res.redirect('/profile');
                    }
                    
                }
                else{
                    res.redirect('/profile');
                }
            }))

           
        }))
    }
   
})

//editing the post
app.post('/edit-post',(req,res)=>{
    if(req.session.userId){

        let product={};
        product.brand=req.body.u_brand;
        product.type=req.body.u_type;
        product.category=req.body.u_category;
        product.amt=req.body.u_amt;
        product.description=req.body.u_dp;
      Product.updateOne({ company_email:req.session.email,pdt_video:req.body.video }, { pdt_brand : product.brand, pdt_type : product.type, pdt_category : product.category, pdt_amt : product.amt,pdt_description : product.description }, function(
            err,
            result
            
          ) {
            if (err) {
              res.send(err);
            } else {
                res.redirect('/profile');
            }
          });
    }

})
//deleting the post
app.post('/delete-post',(req,res)=>{
if(req.session.userId)
{   
    Product.deleteOne({pdt_video:req.body.del_vid},function(err,result)
    {
      if(err) throw err;
      console.log("Video Deleted");
      res.redirect('/profile');
    })
}
})
app.post('/delete-saved',(req,res)=>{
    if(req.session.userId)
    {   
        Save.deleteOne({pdt_video:req.body.del_vid},function(err,result)
        {
          if(err) throw err;
          res.redirect('/profile');
        })
    }
    })

app.post('/account/edit-profile',(req,res)=>{
    if(req.session.userId){
        let prof={};
        prof.name=req.body.e_name;
        prof.bio=req.body.e_bio;
        if(!prof.bio||prof.bio===""){
            prof.bio="";
        }
        prof.picture=req.body.e_img;
        if(prof.picture===""){
            prof.picture=req.session.picture;
        }
        if(req.session.type=="personal"){
            User.updateOne({ email:req.session.email }, { name:prof.name, picture:prof.picture, bio: prof.bio}, function(
                err,
                result
                
              ) {
                if (err) {
                  res.send(err);
                } else {
                    req.session.picture=prof.picture;
                    req.session.name=prof.name;
                    res.redirect('/profile');
                }
              });
        }
        else if(req.session.type=="business"){
            User.updateOne({ email:req.session.email }, { name:prof.name, whatsapp:req.body.e_wp,phone:req.body.e_ph,picture:prof.picture, bio: prof.bio}, function(
                err,
                result
                
              ) {
                if (err) {
                  res.send(err);
                } else {
                    Product.updateMany({ company_email:req.session.email }, { company_name:prof.name}, function(
                        err,
                        result
                        
                      ) {
                        if (err) {
                          res.send(err);
                        } else {
                            req.session.picture=prof.picture;
                            req.session.name=prof.name;
                            res.redirect('/profile');
                        }
                      });
                }
              });
        }
      
    }
    else{
        res.send("Something went wrong");
    }
})
app.post('/account/delete',(req,res)=>{
    if(req.session.userId){
        const user=req.session;
        if(user.type=="personal"){
            Save.deleteMany({user_email:user.email},function(err,result)
            {   
                User.deleteOne({email:user.email},function(err,result)
                {
                    if(err) throw err;
                    req.session.destroy((err,next)=>{
                        if(err){
                            next()
                        }
                        res.clearCookie('sid');
                        res.redirect('/');
                    });
                })
                if(err) throw err;
               
            })

        }
        else if(user.type=="business"){
            Product.deleteMany({company_email:user.email},function(err,result)
            {   
                Save.deleteMany({company_email:user.email},function(err,result){});
                Subscribe.deleteOne({profile_email:user.email},function(err,result){});
                User.deleteOne({email:user.email},function(err,result)
                {
                    if(err) throw err;
                    req.session.destroy((err,next)=>{
                        if(err){
                            next()
                        }
                        res.clearCookie('sid');
                        res.redirect('/');
                    });
               
            })
                if(err) throw err;
               
            })
        }
    }
    else{
        res.redirect('/login');
    }
})
var pwd_message="";
app.get('/account/change-p',reDirectLogin,(req,res)=>{
    const user=req.session;
    res.render('edit-password',{user,wtp,pwd_message});
    pwd_message="";
})
app.post('/account/change-p',reDirectLogin,(req,res)=>{
    const user=req.session;
    
    MongoClient.connect('mongodb+srv://rohit_qs:quri442@cluster0.xngju.mongodb.net/Showcase?retryWrites=true&w=majority', function (err, client) {
        if (err) throw err
  
        var db = client.db('Showcase')
  
         db.collection('accounts').findOne({"email":user.email},(function (err, result) {
             if (err) throw err
             if(result){

                const passwordEnteredByUser = req.body.e_pwd;
                const hash = result.password;
                bcrypt.compare(passwordEnteredByUser, hash, function(err, isMatch) {
                 if (err) {
                     throw err
                } else if (!isMatch) {
                    pwd_message="Incorrect Old Password";
                    res.redirect('/account/change-p');
                 } else {
                    const pass = req.body.e_new;
                    const c_pass = req.body.e_cp;
                    if (pass === c_pass){

                        const saltRounds = 10;
                        bcrypt.genSalt(saltRounds, function (err, salt) {
                        if (err) {
                            throw err
                        } else {
                            bcrypt.hash(pass, salt, function(err, hash) {
                                if (err) {
                                    throw err
                                } 
                                else {
                                        User.updateOne({ email: user.email }, { password: hash }, function(
                                            err,
                                            result
                                        ) {
                                            if (err) {
                                            res.send(err);
                                            } else {
                                                console.log("Password changed Successfully !!");
                                            }
                                                res.redirect('/profile');
                                        });
                            
                                }
                            })
                
                            }
                        }) 
            
                   
            
                }
                else{
                    pwd_message = "New Password does not match with Confirm Password";
                    res.redirect('/account/change-p');
                }

                        }
                })

            }
            })
    )
})


})
var sub;
MongoClient.connect('mongodb+srv://rohit_qs:quri442@cluster0.xngju.mongodb.net/Showcase?retryWrites=true&w=majority', function (err, client) {
    if (err) throw err

    var db = client.db('Showcase')

    db.collection('accounts').find({type: "business"}).toArray(function (err, result) {
        if (err) throw err
        result.forEach((itm)=>{
            app.get('/profile='+itm._id,(req,res)=>{
                const user=req.session;
                if(user.email===itm.email &&user.type==="business"){
                    res.redirect('/profile');
                }
                else{
                db.collection('products').find({company_email:itm.email}).toArray(function (err, pdts) {
                    db.collection('subscribers').findOne( { profile_email:itm.email,subscribers: { $all: [ req.session.email ] } } ,(function (err, result) {
                        if(result){
                            sub=result;
                            res.render('profile-view',{user,sub,itm,wtp,my_products:pdts});
                        }
                        else{
                            sub=[];
                            res.render('profile-view',{user,sub,itm,wtp,my_products:pdts});
                        }
                       
                    }))
                
                    
                })
            }
                
            })
        })
    }
    )})
app.post('/subscribe',(req,res)=>{
    MongoClient.connect('mongodb+srv://rohit_qs:quri442@cluster0.xngju.mongodb.net/Showcase?retryWrites=true&w=majority', function (err, client) {
    if (err) throw err

    var db = client.db('Showcase')

    db.collection('subscribers').find({profile_email: req.body.prof_email}).toArray(function (err, result) {
        if(result.length>0){
            Subscribe.updateOne({ profile_email: req.body.prof_email }, { $push: { subscribers: req.body.sub_email } }, function(
                err,
                result
            ) {
                if (err) {
                res.send(err);
                } else {
                    console.log("Subscribed Successfully !!");
                }
                 res.redirect('back');
            });   
        }
        else{
            let newsubscriber = new Subscribe({
                profile_email:req.body.prof_email,
                subscribers:[req.body.sub_email]
            });
            newsubscriber.save();
            res.redirect('back');
        }
    })})
})
app.post('/unsubscribe',(req,res)=>{
    Subscribe.updateOne({ profile_email: req.body.prof_email }, { $pull: { subscribers: req.body.sub_email } }, function(
        err,
        result
    ) {
        if (err) {
        res.send(err);
        } else {
            console.log("Unsubscribed Successfully !!");
        }
         res.redirect('back');
    });  
})
// set port, listen for requests
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
    