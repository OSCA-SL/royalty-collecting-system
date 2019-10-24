var mysql = require('mysql');

class Event {

    constructor(title, date, location, descp, type, price, created_at, updated_at, deleted_at, is_invoice) {
        this.title = title;
        this.date = date;
        this.location = location;
        this.descp = descp;
        this.type = type;
        this.price = price;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.deleted_at = deleted_at;
        this.is_invoice = is_invoice;

    }

    insertEvent() {
        console.log(this.title);
        let sql = `INSERT INTO events(title, date, location, description, type, price, created_at, is_invoice) \
                   VALUES('${this.title}','${this.date}','${this.location}','${this.descp}','${this.type}','${this.price}','${this.created_at}', ${this.is_invoice})`;
        return sql;
    }

    updateEvent(id) {
        let sql = `UPDATE events SET\
                  title = '${this.title}', date = '${this.date}', location = '${this.location}', description = '${this.descp}', type = '${this.type}', price = '${this.price}', updated_at = '${this.updated_at}', is_invoice = '${this.is_invoice}'\
                  WHERE id = '${id}'`;
        return sql;
    }

    static deleteEvent(id) {
        let sql = `DELETE FROM events WHERE id = ${id}`;
        return sql;
    }

    static getAllEvents() {
        let sql = `SELECT * FROM events`;
        return sql;
    }

    static getEvent(id) {
        let sql = `SELECT * FROM events WHERE id = ${id}`;
        return sql;
    }

    static getNonInvoiceEvents() {
        let sql = `SELECT * FROM events WHERE is_invoice = ${0}`;
        return sql;
    }

    insertEventSong(songList) {
        let sql = `INSERT INTO events_songs(event_id, song_id) VALUES `;
        for (let i = 0; i < songList.length; i++) {
            if (i !== songList.length - 1) {
                sql += `(${songList[i]}),`;
            } else {
                sql += `(${songList[i]})`;
            }
        }
        return sql;
    }

    static getEventSong(id) {
        let sql = `SELECT * FROM events_songs WHERE event_id = ${id}`;
        return sql;
    }

    static getEventPrice(id) {
        let sql = `SELECT price FROM events WHERE id = ${id}`;
        return sql;
    }
}

module.exports = Event;
