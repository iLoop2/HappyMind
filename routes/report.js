var express = require('express');
var report = express.Router();


exports.getReport = function(req, res){
    res.render('report', { title: 'Happy Minds', user:req.user  });
}

exports.getData = function(req, res ) {

    var callback = function(err, result) {
        res.setHeader('Content-disposition', 'attachment; filename=res.json');
        res.writeHead(200, {
            'Content-Type' : 'x-application/json'
        });
        console.log('json:', result);
        res.end(result);
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
    var query = 'SELECT COUNT(case value when 1 then 1 end) as v1,COUNT(case value when 2 then 2 end) as v2,COUNT(case value when 3 then 3 end) as v3, COUNT(case value when 4 then 4 end) as v4 FROM votes;';
    client.query(query, function (err, results, fields) {
        if (err)
            return callback(err, null);

        var t1 = {label:"Happy", value:results.rows[0].v1};
        var t2 = {label:"Indifferent", value:results.rows[0].v2};
        var t3 = {label:"Don't care", value:results.rows[0].v3};
        var t4 = {label:"Hate", value:results.rows[0].v4};
        var data = [t1,t2,t3,t4];
        json = JSON.stringify(data);
        client.end();
        callback(null, json);
    });
};
