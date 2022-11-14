const express = require("express");
const routes = express.Router();
const pool = require("../databases");

/* routes.get('/countries', function (req, res) {
    res.send('Obtener paises');
}) */

routes.get('/countries', async function (req, res) {
    const countries =  await pool.query('Select * from countries2');
    res.send(countries);
})

routes.get('/cities', async function (req, res) {
    const codeCountry = req.query.country;
    const cities =  await pool.query('Select * from cities where country  = ?', codeCountry);
    res.send(cities);
})

module.exports = routes;