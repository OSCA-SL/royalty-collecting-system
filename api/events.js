var express = require('express');
var db = require('../db/test-db');
var Event = require('../domain/event');
var Song = require('../domain/song');
const DATE_FORMATER = require( 'dateformat' );

const router = express.Router();

//handles url http://localhost:6001/events/add
router.post("/add", (req, res, next) => {

    //read event information from request
    let eventBody = req.body.event;
    let title = eventBody.title;
    let date = DATE_FORMATER( eventBody.date, "yyyy-mm-dd HH:MM:ss" );
    let location = eventBody.location;
    let descp = eventBody.descp;
    let type = eventBody.type;
    let price = eventBody.price;
    let created_at = DATE_FORMATER( new Date(), "yyyy-mm-dd HH:MM:ss" );
    let song_list = req.body.song_list;
    let is_invoice = 0;
    let event = new Event(title, date, location, descp, type, price, created_at, null, null, is_invoice);
    console.log(event);
    db.query(event.insertEvent(), (err, data)=> {

        if (!err) {
            let songList = [];
            song_list.forEach(function(node){
                let event_song = [];
                event_song.push(data.insertId);
                event_song.push(node["id"]);
                songList.push(event_song);
            });
            console.log(songList);
            db.query(event.insertEventSong(songList), (err2, data2)=> {
                if (!err2) {
                    res.status(200).json({
                        message: "Event added.",
                        id: data.insertId
                    });
                } else {
                    res.status(500).json({
                        message:"Error.",
                        body: req.body,
                        error: err2
                    });
                }
            });

        } else {
            res.status(500).json({
                message:"Error.",
                body: req.body,
                error: err
            });
        }

    });
});

//handles url http://localhost:6001/events
router.get("/", (req, res, next) => {

    db.query(Event.getAllEvents(), (err, data)=> {
        if(!err) {
            res.status(200).json({
                message:"Events listed.",
                data:data
            });
        }
    });
});

//handles url http://localhost:6001/events/update/:id
router.post("/update/:id", (req, res, next) => {

    //read event information from request
    let id = req.params.id;
    let title = req.body.title;
    let date = DATE_FORMATER( req.body.date, "yyyy-mm-dd HH:MM:ss" );
    let location = req.body.location;
    let descp = req.body.descp;
    let type = req.body.type;
    let price = req.body.price;
    let updated_at = DATE_FORMATER( new Date(), "yyyy-mm-dd HH:MM:ss" );
    let is_invoice = 0;
    let event = new Event(title, date, location, descp, type, price, updated_at, is_invoice);

    db.query(event.updateEvent(id), (err, data)=> {

        if (!err) {
            res.status(200).json({
                message:"Event updated."
            });
        } else {
            res.status(500).json({
                message:"Error event not found.",
                body: req.body,
                error: err
            });
        }

    });
});

//handles url http://localhost:6001/events/delete
router.post("/delete", (req, res, next) => {

    let id = req.body.id;

    db.query(Event.deleteEvent(id), (err, data)=> {
        if(!err) {
            if(data && data.affectedRows > 0) {
                res.status(200).json({
                    message:`Event deleted with id = ${id}.`,
                    affectedRows: data.affectedRows
                });
            } else {
                res.status(200).json({
                    message:"Event Not found."
                });
            }
        }
    });
});

//handles url http://localhost:6001/events/getEvent/:id
router.get("/getEvent/:id", (req, res, next) => {

    let id = req.params.id;

    db.query(Event.getEvent(id), (err, data)=> {
        if(!err) {
            if(data) {
                res.status(200).json({
                    data: data
                });
            } else {
                res.status(200).json({
                    message:"Event Not found."
                });
            }
        }
    });
});

//handles url http://localhost:6001/events/getEvent/:id
router.get("/getEventSongs/:id", (req, res, next) => {

    let id = req.params.id;

    db.query(Event.getEventSong(id), (err, data)=> {
        if(!err) {
            if(data) {
                let songIdList = [];
                data.forEach(function(node){
                    songIdList.push(node["song_id"]);
                });

                db.query(Song.getSongsByIds(songIdList), (error, songList)=> {
                    if (!error) {
                        res.status(200).json({
                            data: songList
                        });
                        // console.log(songList);
                    } else {
                        res.status(500).json({
                            error: error
                        });
                    }

                });
            } else {
                res.status(200).json({
                    message:"Event Not found."
                });
            }
        }
    });
});

//handles url http://localhost:6001/events/nonInvoice
router.get("/nonInvoice", (req, res, next) => {

    db.query(Event.getNonInvoiceEvents(), (err, data)=> {
        if(!err) {
            if(data) {
                res.status(200).json({
                    data: data
                });
            } else {
                res.status(200).json({
                    message:"No Evenst Found"
                });
            }
        } else {
            res.status(500).json({
                error: err
            });
        }
    });
});


module.exports = router ;
