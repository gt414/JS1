var mysql = require("mysql");
var moment = require('moment');

function open() {
    var connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "00000000",
        database: "library"
    });
    connection.connect(function (err) {
        if (err) {
            console.log('connecting error' + err);
            return;
        }
    });
    return connection
}

function insertBorrowStauts(userID, bookIDs, callback) {
    var sqlText = 'INSERT INTO library.borrow (member_id, book_id, date) VALUES '
    bookIDs.forEach(function (element) {
        sqlText += "(" + userID + "," + element + ",'" + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + "'),"
    });
    sqlText = sqlText.substring(0, sqlText.length - 1);
    var connection = open()
    connection.query(sqlText, function (error, results, fields) {
        console.log('connecting error' + error);
        callback(error == null);
    });
    connection.end();
}

function getBorrowList(userID, callback) {
    var connection = open()
    connection.query('Select library.borrow.id, name, publisher, author, publication_date, date from library.borrow, library.book where member_id = ? AND book_id = book.id', [userID], function (error, results, fields) {
        if (error) throw error;
        results = results.map(function (item, index, array) {
            return {
                "id": item.id,
                "name": item.name,
                "author": item.author,
                "publisher": item.publisher,
                "publication_date": moment(item.publication_date).format('YYYY-MM-DD'),
                "borrow_date": moment(item.date).format('YYYY-MM-DD')
            }
        });
        callback(results);
    });
    connection.end();
}

function returnBook(id, callback) {
    var connection = open()
    connection.query('DELETE FROM `library`.`borrow` WHERE id = ?;', [id], function (error, results, fields) {
        if (error) throw error;
        callback(results);
    });
    connection.end();
}

function getAllBooks(callback) {
    var connection = open()
    connection.query('SELECT * FROM library.book;', function (error, results, fields) {
        if (error) throw error;
        callback(results);
    });
    connection.end();
}

function login(userName, pwd, callback) {
    var connection = open()
    connection.query('SELECT * FROM member WHERE account = ? AND pwd = ?', [userName, pwd], function (error, results, fields) {
        if (results.length > 0) {
            callback(true, results[0].id)
        } else {
            callback(false, null)
        }
    });
    connection.end();
}

exports.returnBook = returnBook
exports.getBorrowList = getBorrowList
exports.insertBorrowStauts = insertBorrowStauts;
exports.getAllBooks = getAllBooks;
exports.login = login;