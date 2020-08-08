var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var passport = require("passport");
var getMAC = require("getmac").default;
var User = require("../model/userModel");
var Candidate = require("../model/candidateModel");
var router = express.Router();
require("dotenv").config();

router.get("/allCandidates", (req, res, next) => {
  Candidate.find({})
    .then((candidates) => {
      if (candidates) {
        res.json({
          success: true,
          message: "Fetched Candidates !",
          candidates: candidates,
        });
      } else {
        res.json({
          success: false,
          message: "Deatils could not be Fetched !",
          candidates: null,
        });
      }
    })
    .catch((err) => next(err));
});

router.get("/candidate/:id", (req, res, next) => {
  Candidate.findById(req.params.id)
    .then((candidate) => {
      if (candidate) {
        res.json({
          success: true,
          message: "Candidate Acquired !",
          candidate: candidate,
        });
      } else {
        res.json({
          success: false,
          message: "Candidate could not be found !",
          candidate: null,
        });
      }
    })
    .catch((err) => next(err));
});

router.post("/loginCandidate", (req, res, next) => {
  var { email, password } = req.body;
  Candidate.findOne({ email: email })
    .then((cand) => {
      if (cand) {
        bcrypt
          .compare(password, cand.password)
          .then((isMatch) => {
            if (isMatch) {
              var tokenCand = { _id: cand._id, name: cand.name };
              const token = jwt.sign(tokenCand, process.env.SECRET, {
                expiresIn: "1d",
              });
              res.json({
                success: true,
                message: "Login Successful !",
                token: "JWT " + token,
                name: cand.name,
                id: cand._id,
              });
            } else {
              res.json({
                success: false,
                message: "Incorrect Password !",
                token: null,
                name: null,
                id: null,
              });
            }
          })
          .catch((err) => next(err));
      } else {
        res.json({
          success: false,
          message: "No candidate with Such email !",
          token: null,
          name: null,
          id: null,
        });
      }
    })
    .catch((err) => next(err));
});

router.get("/checkToken", (req, res) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) {
      console.log("An Error Occured !", err);
    } else if (!user) {
      res.json({
        success: false,
        message: "Invalid JWT",
        name: null,
        id: null,
      });
    } else {
      res.json({
        success: true,
        message: "Valid JWT !",
        name: user.name,
        id: user._id,
      });
    }
  })(req, res);
});

router.put(
  "/editCandidate",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    Candidate.findByIdAndUpdate(req.user._id, {
      $set: {
        name: req.body.name,
        email: req.body.email,
        challenges: req.body.challenges,
        expertiselvl: req.body.expertiselvl,
        expertin: req.body.expertin,
      },
    })
      .exec()
      .then((upUser) => {
        if (upUser) {
          res.json({ success: true, message: "Candidate Updated !" });
        } else {
          res.json({ success: false, message: "Candidate not updated !" });
        }
      })
      .catch((err) => next(err));
  }
);

router.post("/vote/:id", (req, res, next) => {
  var mac = getMAC();
  var cookie = req.cookies;
  if (cookie[process.env.Cookie_Name] === undefined) {
    User.findOne({ $or: [{ macAddress: mac }, { email: req.body.email }] })
      .then((user) => {
        if (user) {
          res.json({
            success: false,
            message: "You have Already Voted Once !",
          });
        } else {
          var user = new User(req.body);
          user.macAddress = mac;
          user.voted = req.params.id;

          Candidate.findById(req.params.id)
            .then((candidate) => {
              if (candidate) {
                User.create(user)
                  .then((upUser) => {
                    if (upUser) {
                      candidate.votes = candidate.votes + 1;

                      candidate
                        .save()
                        .then((upCand) => {
                          if (upCand) {
                            res.cookie(process.env.Cookie_Name, true);
                            console.log("Cookie Created !");
                            res.json({
                              success: true,
                              message: "Vote Accepted !",
                            });
                          } else {
                            User.findByIdAndDelete(upUser._id)
                              .then((delUser) => {
                                if (delUser) {
                                  res.json({
                                    success: false,
                                    message:
                                      "Could not make a vote, try again !",
                                  });
                                } else {
                                  res.json({
                                    success: false,
                                    message: "Server Broken !",
                                  });
                                }
                              })
                              .catch((err) => next(err));
                          }
                        })
                        .catch((err) => {
                          if (upUser._id) {
                            User.findByIdAndDelete(upUser._id)
                              .then((delUser) => {
                                if (delUser) {
                                  res.json({
                                    success: false,
                                    message:
                                      "Could not make a vote, try again !",
                                  });
                                } else {
                                  res.json({
                                    success: false,
                                    message: "Server Broken !",
                                  });
                                }
                              })
                              .catch((err) => next(err));
                          }
                          next(err);
                        });
                    } else {
                      res.json({
                        success: false,
                        message: "Ahh , something went Wrong !",
                      });
                    }
                  })
                  .catch((err) => next(err));
              } else {
                res.json({ success: false, message: "No Such Candidate !" });
              }
            })
            .catch((err) => next(err));
        }
      })
      .catch((err) => next(err));
  } else {
    res.json({ success: false, message: "You have Already Voted Once !" });
  }
});

module.exports = router;
