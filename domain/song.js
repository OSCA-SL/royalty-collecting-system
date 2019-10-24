var mysql = require('mysql');

class Song {

    static getAllSongs() {
        let sql = `SELECT id, title FROM songs`;
        return sql;
    }

    static getSongsByIds(idList) {
        let sql = `SELECT id, title FROM songs WHERE id IN (`;
        for (let i = 0; i < idList.length; i++) {
            if (i !== idList.length - 1) {
                sql += `${idList[i]},`;
            } else {
                sql += `${idList[i]})`;
            }
        }
        return sql;
    }
}

module.exports = Song;
