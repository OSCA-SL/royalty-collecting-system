var express = require('express');
var db = require('../db/test-db');
var util_db = require('../db/db-util');
const DATE_FORMATER = require( 'dateformat' );
var Invoice = require('../domain/invoice');
var Event = require('../domain/event');
var mysql = require('mysql');

const router = express.Router();

//handles url http://localhost:6001/invoices/add
router.post("/add", async (req, res, next) => {

    let event_id = req.body.id;
    let error = false;
    let songList = [];
    if (event_id != null) {

        songList = await getEventSongs(event_id);
        console.log(songList);

        let artistPrice = await getEventArtistPrice(event_id);
        console.log(artistPrice);

        if (songList != null && songList.length > 0) {
            let songIdList = [];
            songList.forEach(function (node) {
                songIdList.push(node["song_id"]);
            });

            let final_commision = 0;
            let final_total = 0;
            let invoiceId = await getInvoiceId(event_id);

            for (let i = 0; i < songIdList.length; i++) {
                let songId = songIdList[i];
                let invoiceSongId = await getInvoiceSongId(invoiceId, songId);
                let song_commission = 0;
                let song_total = 0;
                let lyricistIds = await getArtistId(songId, 2);
                let composerIds = await getArtistId(songId, 3);

                if (lyricistIds != null && lyricistIds.length > 0) {
                    let commission = 0;
                    let total = 0;
                    let royalty = 0;
                    if (lyricistIds.length === 1) {
                        total += artistPrice;
                        commission += artistPrice * 0.1;
                        royalty = total - commission;
                        console.log(lyricistIds[0]['artist_id']);
                        await addInvoiceSongArtist(invoiceSongId, lyricistIds[0]['artist_id'], royalty, commission, total);
                        // add song invoice and finals
                    } else {
                        let count = lyricistIds.length;
                        let tempArtistPriceExtra = artistPrice % count;
                        final_commision += tempArtistPriceExtra;
                        let tempArtistPrice = (artistPrice - tempArtistPriceExtra) / count;

                        let temp_total = tempArtistPrice;
                        let temp_commission = tempArtistPrice * 0.1;
                        let royalty = total - commission;
                        for (let j = 0; j < lyricistIds.length; j++) {
                            let lyricist = lyricistIds[j];
                            await addInvoiceSongArtist(invoiceSongId, lyricist['artist_id'], royalty, commission, total);
                            commission += temp_commission;
                            total += temp_total;
                        }
                    }
                    song_commission += commission;
                    song_total += total;

                }
                if (composerIds != null && composerIds.length > 0) {
                    let commission = 0;
                    let total = 0;
                    if (composerIds.length === 1) {
                        total += artistPrice;
                        commission += artistPrice * 0.1;
                        let royalty = total - commission;
                        await addInvoiceSongArtist(invoiceSongId, composerIds[0]['artist_id'], royalty, commission, total);

                    } else {
                        let count = composerIds.length;
                        let tempArtistPriceExtra = artistPrice % count;
                        final_commision += tempArtistPriceExtra;
                        let tempArtistPrice = (artistPrice - tempArtistPriceExtra) / count;

                        let temp_total = tempArtistPrice;
                        let temp_commission = tempArtistPrice * 0.1;
                        let royalty = total - commission;
                        for (let k = 0; k < composerIds.length; k++) {
                            let composer = composerIds[k];
                            await addInvoiceSongArtist(invoiceSongId, composer['artist_id'], royalty, commission, total);
                            commission += temp_commission;
                            total += temp_total;
                        }
                    }
                    song_commission += commission;
                    song_total += total;

                }
                await updateInvoiceSong(invoiceSongId, song_commission, song_total);
                final_commision += song_commission;
                final_total += song_total;
            }
            await updateInvoice(invoiceId, final_commision, final_total);

        } else {
            error = true;
        }
    } else {
        error = true;
    }

    if (error) {
        res.status(500).json({
            message: "Error.",
        });
    } else {
        res.status(200).json({
            message: "invoice inserted."
        });
    }

});

router.post("/add/test", (req, res, next) => {
    let event_id = req.body.id;
    db.query(Event.getEventSong(event_id),(err, data)=> {
        if (!err) {
            console.log(data);

        } else {
            throw err;
        }
    });

});


async function getEventSongs(id) {
    let data = await util_db.query(Event.getEventSong(id));
    let result = JSON.parse(JSON.stringify(data));
    return result;

}

async function getInvoiceId(id) {
    let data = await util_db.query(Invoice.insertNullInvoice(id));
    console.log('invoice_Id : ',data.insertId);
    return data.insertId;
}

async function getInvoiceSongId(invoice_id, song_id) {
    let data = await util_db.query(Invoice.insertNullInvoiceSong(invoice_id, song_id));
    console.log('invoice_Song_Id : ',data.insertId);
    return data.insertId;
}

async function getArtistId(song_id, type) {
    let data = await util_db.query(Invoice.getArtists(song_id, type));
    data = JSON.parse(JSON.stringify(data));
    console.log('Artists : ',data);
    return data;
}

async function getEventArtistPrice(id) {
    let data = await util_db.query(Event.getEventPrice(id));
    return data[0].price;
}

async function updateInvoice(invoice_id, commission, total) {
    let data = await util_db.query(Invoice.updateInvoice(invoice_id, commission, total));
    return data;
}

async function updateInvoiceSong(invoice_song_id, commission, total) {
    let data = await util_db.query(Invoice.updateInvoiceSong(invoice_song_id, commission, total));
    return data;
}

async function addInvoiceSongArtist(invoice_song_id, artist_id, royalty, commission, total) {
    let data = await util_db.query(Invoice.insertInvoiceSongArtist(invoice_song_id, artist_id, royalty, commission, total));
    return data;
}



module.exports = router ;
