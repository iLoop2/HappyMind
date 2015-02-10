var express = require('express');
var router = express.Router();

/* GET home page. */
exports.wsreport = function(req, res) {
    res.render('wsreport', { title: 'Happy Minds' });
};
