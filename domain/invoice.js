var mysql = require('mysql');
const DATE_FORMATER = require( 'dateformat' );

class Invoice {

    static insertNullInvoice(event_id) {
        let date = DATE_FORMATER( new Date(), "yyyy-mm-dd HH:MM:ss" );
        let sql = `INSERT INTO invoices(event_id, date, commission, total, status) VALUES \ 
        ('${event_id}', '${date}', ${0}, ${0}, ${1})`;
        return sql;
    }

    static insertNullInvoiceSong(invoice_id, songId) {
        let sql = `INSERT INTO invoices_songs(invoice_id, song_id, commission, total) VALUES \ 
        ('${invoice_id}', '${songId}', ${0}, ${0})`;
        return sql;
    }

    static getArtists(song_id, type) {
        let sql = `SELECT artist_id FROM song_artists WHERE song_id = ${song_id} AND type = ${type}`;
        return sql;
    }

    static updateInvoice(invoice_id, commission, total) {
        let sql = `UPDATE invoices SET\
                  commission = ${commission}, total = ${total} \
                  WHERE id = ${invoice_id}`;
        console.log(sql);
        return sql;
    }

    static updateInvoiceSong(invoice_song_id, commission, total) {
        let sql = `UPDATE invoices_songs SET\
                  commission = ${commission}, total = ${total} \
                  WHERE id = ${invoice_song_id}`;
        return sql;
    }

    static insertInvoiceSongArtist(invoice_song_id, artist_id, royalty, commission, total) {
        let sql = `INSERT INTO invoices_songs_artists(invoices_songs_id, artist_id, royalty, commission, total) VALUES \ 
        ('${invoice_song_id}', '${artist_id}', ${royalty}, ${commission}, ${total})`;
        return sql;
    }
}

module.exports = Invoice;


