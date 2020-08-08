const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const Candidate = require("../model/candidateModel");

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("JWT");
opts.secretOrKey = process.env.SECRET;

passport.use(
  new JwtStrategy(opts, function (jwt_payload, done) {
    Candidate.findOne({ _id: jwt_payload._id }, function (err, user) {
      if (err) {
        return done(err, false);
      } else if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  })
);
