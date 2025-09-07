{ 
    
    if(process.env.NODE_ENV!="production")
    {
     require(`dotenv`).config();
    }
  
    const { data: sampleListings } = require("./init/data");

    const express = require("express");
    const app = express();
    const mongoose = require("mongoose");
    const Listing = require("./models/listing.js");
    const path = require("path");
    const methodOverride = require("method-override");
    const ejsMate = require("ejs-mate");
    const Review = require("./models/review.js");
    const wrapAsync = require("./utils/wrapAsync.js");
    const ExpressError = require("./utils/ExpressError.js");
    const { listingSchema, reviewSchema } = require("./Schema.js");
    const session=require("express-session");
    const MongoStore = require('connect-mongo');
    const flash=require("connect-flash");
    const passport=require("passport");
    const localStrategy=require("passport-local");
    const User=require("./models/user.js");
    
    const listingRouter=require("./routes/listings.js");
   
    const reviewRouter=require("./routes/review.js");
     
    const userRouter=require("./routes/user.js");

    const  dbUrl=process.env.ATLASDB_URL;

    main()
        .then(() => {
            console.log("Connected to Database.")
        })
        .catch(err => console.log(err));

    async function main() {
        await mongoose.connect(dbUrl);
    }

    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "views"));
    app.use(express.urlencoded({ extended: true }));
    app.use(methodOverride("_method"));
    app.engine('ejs', ejsMate);
    app.use(express.static(path.join(__dirname, "/public")));

    const store=MongoStore.create({
        mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET
    },
      touchAfter:24*3600,
    });

    store.on("error",()=>{
        console.log("Error in Mongo Session Store .",err);
    });

    const sessionOptions={
        store,
        secret:process.env.SECRET,
        resave:false,
        saveUninitialized:true,
        cookie:{
            expires:Date.now()+1000*60*60*24*3,
            maxAge:1000*60*60*24*3,
            httpOnly:true
        }
    };

    // app.get("/", (req, res) => {
    //     res.send("Hi i am root . ");
    // });

   

     app.use(session(sessionOptions));
     app.use(flash());
    

  
    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new localStrategy(User.authenticate()));

    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    app.use((req,res,next)=>
        {
           res.locals.success=req.flash("success");
           res.locals.error=req.flash("error");
           res.locals.currUser=req.user;
           next();
        });

    // app.get("/demouser",async(req,res)=>
    // {
    //       let fakeUser=new User({
    //         email:"student@gmail.com",
    //         username:"deltaStudent"
    //       });
    //      let registeredUser=await User.register(fakeUser,"hello");
    //      res.send(registeredUser);

    // });

    app.use("/listings",listingRouter);
    app.use("/listings/:id/reviews",reviewRouter);
    app.use("/",userRouter);
    
    
//  app.get("/testlisting", async (req, res) => {
//         let sampleListing = new Listing({
//             title: "My new Villa",
//             description: "By the park",
//             location: "California,Goa",
//             price: 1600,
//             country: "India"
//         });

//         await sampleListing.save();
//         console.log("Sample was saved");
//         res.send("Successfull testing");
//     });
      
     sampleListings.forEach(listing => {
  listing.owner = "67f289a500bf0b84e50cda59";
  listing.reviews = [];   // 👈 correct
  let newListing = new Listing(listing);
  newListing.save();
});

    //reviews
 
    app.all("*", (req, res, next) => {
        next(new ExpressError(404, "Page Not Found"));

    });
   
    app.use((err, req, res, next) => {
        let { statusCode = 500, message = "something went wrong" } = err;
        res.status(statusCode).render("error.ejs", { err });

    });
    
     app.listen(8080, () => {
        console.log("Server is listening on port 8080");
    });

}
