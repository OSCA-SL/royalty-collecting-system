var mysql = require('mysql');
const DATE_FORMATER = require( 'dateformat' );

class Invoice {

    static insertNullInvoice(event_id, date) {

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
        let sql = `SELECT song_artists.artist_id,users.first_name,users.last_name FROM song_artists,artists,users WHERE song_artists.song_id = ${song_id} AND song_artists.type = ${type} AND song_artists.artist_id=artists.id AND artists.user_id=users.id`;
        return sql;
    }

    static updateInvoice(invoice_id, commission, total) {
        let sql = `UPDATE invoices SET\
                  commission = ${commission}, total = ${total} \
                  WHERE id = ${invoice_id}`;
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


