var express = require('express');
// var db = require('../db/test-db');
var readDb = require('../db/read-db');
var Song = require('../domain/song');
const DATE_FORMATER = require( 'dateformat' );

const router = express.Router();

//handles url http://localhost:6001/songs
router.get("/", (req, res, next) => {

    readDb.query(Song.getAllSongs(), (err, data)=> {
        if(!err) {
            res.status(200).json({
                message:"Songs listed.",
                data:data
            });
        } else {
            res.status(500).json({
                message:"Error.",
                data:err
            });
        }
    });
});

module.exports = router ;
