var express = require('express');
var db = require('../db/read-db');
var Authenticate = require('../domain/authenticate');
// require the bcrypt module
//var bcrypt = require('bcrypt');

const router = express.Router();

//handles url http://localhost:6001/authenticates
router.post("/", (req, res, next) => {
    let email = req.body.email;
    let password = req.body.password;
    db.query(Authenticate.getUserDetails(email), (err, data) => {
        if(!err) {
            if(data && data.length > 0) {
                let hash = (data[0].password);
                hash = hash.replace('$2y$', '$2b$');
                console.log("before compare: "+hash);
                console.log(password);
                // bcrypt.compare(password, hash, function(err, ress) {
                //     console.log(ress);
                //     if (!ress) {
                //         res.status(200).json({
                //             message:"Email and password does not match.",
                //         });
                //     } else {
                //         res.status(200).json({
                //             message:"Login Successful.",
                //             user: data
                //         });
                //     }
                // });
            } else {
                res.status(200).json({
                    message:"Email Not found."
                });
            }
        }
    })
});

module.exports = router ;
