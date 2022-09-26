const express = require("express");
const routes = express.Router();
const pool = require("../databases");

routes.get('/', function (req, res) {
    res.send('Hola bichotas');
})

module.exports = routes;