var express = require('express');
var router = express.Router();

/* GET home page. */
exports.input = function(req, res, next) {
    res.render('input', {title: 'Happy Minds'});
}