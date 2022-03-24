require("dotenv").config();
const passport = require("passport");
const connection = require("../model/connection.js");
const FacebookStrategy = require("passport-facebook").Strategy;
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const { ExtractJwt } = require("passport-jwt");

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(err, user);
});

passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.ACCESS_TOKEN_SECRET,
        },
        (payload, done) => {
            try {
                connection.query(`select * from user where id like '${payload.userId}'`, (err, result) => {
                    if (err) {
                        done(err, false);
                    }
                    if (result.length > 0) {
                        result[0].iat = payload.iat;
                        done(null, result[0]);
                    } else {
                        done(null, false);
                    }
                });
            } catch (error) {
                done(error, false);
            }
        }
    )
);

passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_ID,
            clientSecret: process.env.FACEBOOK_SECRET,
            callbackURL: "http://localhost:4000/api/user/facebook/callback",
            profileFields: ["id", "displayName", "photos", "email"],
        },
        (accessToken, refreshToken, profile, done) => {
            console.log(profile);
            done(null, profile);
        }
    )
);

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET,
            callbackURL: "http://localhost:4000/api/user/google/callback",
        },
        (accessToken, refreshToken, profile, done) => {
            done(null, profile);
        }
    )
);
