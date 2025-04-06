 const User=require("../models/user")
 
 module.exports.renderSignUp=(req, res) => {
    res.render("users/signup.ejs")
}
 
 module.exports.signup=async(req, res)=>{
     try {
         let { username, email, password } = req.body;
         const newUser = new User({ email, username });
         const registeredUser = await User.register(newUser, password);
         req.login(registeredUser,(err) => {
             if (err) {
                 return next(err);
             }
 
             req.flash("success", "Welcome to WanderLust");
             res.redirect("/listings");
         });
     }
     catch (e) {
         req.flash("error", e.message);
         res.redirect("/signup");
     }
 };

 module.exports.login= async (req, res) => {
    req.flash("success", "Welcome back to WanderLust You are logged in.");
    redirectUrl=res.locals.redirectUrl||"/listings";
    res.redirect(redirectUrl);
};


module.exports.logout= (req, res) => {
    req.logout((err) => {
        if (err) {
            next(err);
        }
        req.flash("success", "You are logged out now .");
        res.redirect("/listings");
    });
};

module.exports.renderLoginForm=(req, res) => {
    res.render("users/login.ejs")
}