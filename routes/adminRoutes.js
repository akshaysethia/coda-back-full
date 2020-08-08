var express = require("express");
var Candidate = require("../model/candidateModel");
var bcrypt = require("bcryptjs");
var router = express.Router();

router.post("/addCandidate", (req, res, next) => {
  if (req.body.admin) {
    bcrypt
      .compare(req.body.admin, process.env.ADMIN_CODE)
      .then((isMatch) => {
        if (isMatch) {
          var cand = new Candidate(req.body);
          Candidate.findOne({ email: req.body.email })
            .then((oldCand) => {
              if (oldCand) {
                res.json({
                  success: false,
                  message: "Candidate Already Exists !",
                  candidate: oldCand,
                });
              } else {
                bcrypt
                  .genSalt(15)
                  .then((salt) => {
                    if (salt) {
                      bcrypt
                        .hash(req.body.password, salt)
                        .then((hash) => {
                          if (hash) {
                            cand.password = hash;
                            Candidate.create(cand)
                              .then((newCand) => {
                                if (newCand) {
                                  res.json({
                                    success: true,
                                    message: "Candidate Created !",
                                    candidate: newCand,
                                  });
                                } else {
                                  res.json({
                                    success: false,
                                    message: "Candidate could not be added !",
                                    candidate: null,
                                  });
                                }
                              })
                              .catch((err) => next(err));
                          } else {
                            res.json({
                              success: false,
                              message: "Hash could not be generated !",
                              candidate: null,
                            });
                          }
                        })
                        .catch((err) => next(err));
                    } else {
                      res.json({
                        success: false,
                        message: "Salt could not be generated !",
                        candidate: null,
                      });
                    }
                  })
                  .catch((err) => next(err));
              }
            })
            .catch((err) => next(err));
        } else {
          res.json({ success: false, message: "Wrong Code !" });
        }
      })
      .catch((err) => next(err));
  } else {
    res.json({ success: false, message: "Admin Code Not Provided !" });
  }
});

router.put("/editCandidate/:id", (req, res, next) => {
  if (req.body.admin) {
    bcrypt
      .compare(req.body.admin, process.env.ADMIN_CODE)
      .then((isMatch) => {
        if (isMatch) {
          if (req.body) {
            Candidate.findByIdAndUpdate(req.params.id, {
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
                  res.json({
                    success: false,
                    message: "Candidate not updated !",
                  });
                }
              })
              .catch((err) => next(err));
          } else {
            res.json({
              success: false,
              message: "No Info Entered to update !",
            });
          }
        } else {
          res.json({ success: false, message: "Admin Code Invalid !" });
        }
      })
      .catch((err) => next(err));
  } else {
    res.json({ success: false, message: "Admin Code Not Provided !" });
  }
});

router.post("/deleteCandidate/:id", (req, res, next) => {
  if (req.body.admin) {
    bcrypt
      .compare(req.body.admin, process.env.ADMIN_CODE)
      .then((isMatch) => {
        if (isMatch) {
          Candidate.findByIdAndDelete(req.params.id)
            .then((delCand) => {
              if (delCand) {
                res.json({ success: true, message: "Candidate Deleted !" });
              } else {
                res.json({
                  success: false,
                  message: "Candidate could not be deleted !",
                });
              }
            })
            .catch((err) => next(err));
        } else {
          res.json({ success: false, message: "Invalid Admin Code !" });
        }
      })
      .catch((err) => next(err));
  } else {
    res.json({ success: false, message: "Admin Code Not Provided !" });
  }
});

module.exports = router;
