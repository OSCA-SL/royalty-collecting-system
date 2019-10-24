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
    let json_data = {};



    if (event_id != null) {
        let event_details = {}

        let event_info = await getEventInfo(event_id);
        event_details['title'] = event_info[0]['title'];
        event_details['location'] = event_info[0]['location'];
        event_details['date'] = DATE_FORMATER(event_info[0]['date'],"yyyy-mm-dd");

        songList = await getEventSongs(event_id);
        console.log(songList);

        let artistPrice = await getEventArtistPrice(event_id);

        if (songList != null && songList.length > 0) {

            let final_commision = 0;
            let final_total = 0;
            let date = DATE_FORMATER( new Date(), "yyyy-mm-dd HH:MM:ss" );
            let invoiceId = await getInvoiceId(event_id,date);
            json_data['id'] = invoiceId;
            json_data['date'] = DATE_FORMATER(date, "yyyy-mm-dd" );
            json_data['event'] = event_details;

            let song_data = []

            for (let i = 0; i < songList.length; i++) {
                let song_data_block = {}
                let songId = songList[i]['song_id'];
                let songTitle = songList[i]['title'];
                song_data_block['id'] = songId;
                song_data_block['title'] = songTitle;
                let invoiceSongId = await getInvoiceSongId(invoiceId, songId);
                let song_commission = 0;
                let song_total = 0;
                let lyricistIds = await getArtistId(songId, 2);
                let composerIds = await getArtistId(songId, 3);
                song_data_block['lyricist'] = lyricistIds;
                song_data_block['composer'] = composerIds;


                if (lyricistIds != null && lyricistIds.length > 0) {
                    let commission = 0;
                    let total = 0;
                    let royalty = 0;
                    if (lyricistIds.length === 1) {
                        total += artistPrice;
                        commission += artistPrice * 0.1;
                        royalty = total - commission;

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
                song_data_block['total'] = song_total;
                song_data.push(song_data_block)
                await updateInvoiceSong(invoiceSongId, song_commission, song_total);
                final_commision += song_commission;
                final_total += song_total;
            }
            json_data['songs'] = song_data;
            json_data['total'] = final_total;
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
            message: "invoice inserted.",
            data: json_data
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

async function getEventInfo(id) {
    let data = await util_db.query(Event.getEventInfo(id));
    let result = JSON.parse(JSON.stringify(data));
    return result;
}

async function getInvoiceId(id,date) {
    let data = await util_db.query(Invoice.insertNullInvoice(id,date));
    return data.insertId;
}

async function getInvoiceSongId(invoice_id, song_id) {
    let data = await util_db.query(Invoice.insertNullInvoiceSong(invoice_id, song_id));
    return data.insertId;
}

async function getArtistId(song_id, type) {
    let data = await util_db.query(Invoice.getArtists(song_id, type));
    data = JSON.parse(JSON.stringify(data));
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
