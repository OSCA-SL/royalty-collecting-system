var mysql = require('mysql');
class Authenticate {

    static getUserDetails(email) {
        let sql = `SELECT * FROM users WHERE email = `+ mysql.escape(email);
        return sql;
    }
}

module.exports = Authenticate;
