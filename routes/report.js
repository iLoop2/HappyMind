var express = require('express');
var report = express.Router();

exports.getReport = function(req, res ) {

    var callback = function(err, result) {
        res.setHeader('Content-disposition', 'attachment; filename=res.json');
        res.writeHead(200, {
            'Content-Type' : 'x-application/json'
        });
        console.log('json:', result);
        res.render('report', { title: 'Happy Minds', data: result });
    };

    getFromDb(callback);


};

function getFromDb(callback) {
    var pg = require('pg');
    var client = new pg.Client({
        user: "jrdluvijcaopxs",
        password: "CRCFxUZD8A772JWnlL5ffXfGW_",
        database: "dd0sqqb05mp2jv",
        port: 5432,
        host: "ec2-23-23-80-55.compute-1.amazonaws.com",
        ssl: true
    });
    client.connect();
    var json = '';
    var query = 'SELECT * FROM votes';
    client.query(query, function (err, results, fields) {
        if (err)
            return callback(err, null);

        console.log('The query-result is: ', results);

        // wrap result-set as json
        json = JSON.stringify(results.rows);

        /***************
         * Correction 2: Nest the callback correctly!
         ***************/
        client.end();
        //console.log('JSON-result:', json);
        callback(null, json);
    });
};
