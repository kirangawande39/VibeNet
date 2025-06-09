const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
require("dotenv").config();
// ----------- Local Strategy -----------
passport.use(new LocalStrategy({ usernameField: "email" }, User.authenticate()));

// ----------- Google Strategy -----------
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          profilePic: profile.photos[0].value,
          // yahan username add karo:
          username: profile.emails[0].value.split('@')[0],
        });
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));


// ----------- Common serialize / deserialize -----------
passport.serializeUser((user, done) => {
  done(null, user.id); // store user._id in session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user); // attach user to req.user
  } catch (err) {
    done(err, null);
  }
});
