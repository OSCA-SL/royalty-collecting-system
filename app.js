var express = require('express');
var bodyparser = require('body-parser');
var cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

var authenticates = require('./api/authenticates');
var events = require('./api/events');
var songs = require('./api/songs');
var invoices = require('./api/invoices');


// import orders from "./api/orders";

app.use("/authenticates",authenticates);
app.use("/events", events);
app.use("/songs", songs);
app.use("/invoices", invoices);

app.get('/', (request, response) => {
    response.send({
        message: 'Connected to Royalty Collecting System Service'}
    );
});

//if we are here then the specified request is not found
app.use((req,res,next)=> {
    const err = new Error("Not Found");
    err.status = 404;
    next(err);
});

//all other requests are not implemented.
app.use((err,req, res, next) => {
    res.status(err.status || 501);
    res.json({
        error: {
            code: err.status || 501,
            message: err.message
        }
    });
});

module.exports = app;
