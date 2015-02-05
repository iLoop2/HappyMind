var express = require('express');
var report = express.Router();


exports.register = function(req, res ) {
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
    var team = req.body.teamid;
    var value = req.body.value;

    client.query('INSERT INTO votes (teamid, value, timestamp) VALUES ($1, $2, current_timestamp)',
        [team, value],
        function(err, result) {

            if(err) return response.send(err);

        });
    client.end();
    res.send('OK');
};
