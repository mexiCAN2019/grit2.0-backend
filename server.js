const express = require('express');
const app = express();
const errorHandler = require('errorhandler');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const mysql = require('mysql2');

const db = mysql.createConnection ({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: 'root',
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
});

app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cors());


app.get(`/years`, (req, res, next) => {
    db.query(`SELECT * FROM years ORDER BY year DESC;`, (err, rows) => {
        if(err) {
            next(err);
        } else {
            res.status(200).json({years: rows});
        }
    });
});

app.post('/years', (req,res,next) => { /* Can i add more than one year at a time? For right now, this will only be for adding one at a time */
    const newYear = req.body.year;
    if(!newYear){
        res.sendStatus(400);
    } else{
        db.query(`INSERT INTO years SET ?;`, {
            year: newYear
        }, (err, row) => {
            if(err){
                throw err;
            } else{
                console.log(row);
                res.status(201).json({year: newYear});
            }
        })
    }
});

// app.delete('/years', (req,res,next) => {
//     db.query(`SELECT * FROM months WHERE yearID = $yearFK;`, {$yearFK: req.query.year}, (err,rows) => {
//         if(err){
//             next(err);
//         } else if(rows.length){
//             res.sendStatus(400);
//         } else{
//             db.query(`DELETE FROM years WHERE year = $year;`, {$year: req.query.year}, (err) => {
//                 if(err) {
//                     next(err);
//                 } else {
//                     res.sendStatus(204);
//                 }
//             });
//         }
//     });
// });

app.delete('/years', (req,res,next) => {
    db.query(`DELETE FROM years WHERE year = ${req.query.year};`, (err) => {
        if(err) {
            next(err);
        } else{
            res.sendStatus(200);
        }
    })
});

// app.get(`/years/:year`, (req, res, next) => {
//     db.query(`SELECT * FROM months WHERE yearFK = $year;`, {$year: req.params.year}, (err, rows) => {
//         if(err) {
//             next(err);
//         } else {
//             res.status(200).json({months: rows});
//         }
//     });
// });

app.get('/years/:year', (req,res,next) => {
    db.query(`SELECT * FROM months WHERE year = ${req.params.year};`, (err, rows) => {
        if(err){
            next(err);
        } else{
            res.status(201).json({months: rows});
        }
    });
});

// app.post('/years/:year', (req,res,next) => { 
//     const newMonth = req.query.month
//     db.query(`INSERT INTO months (month, yearFK) VALUES ($month, $yearFK);`, {
//         $month: newMonth,
//         $yearFK: req.params.year
//     }, function(err) {
//         if(err) {
//             next(err);
//         } else {
//             db.get(`SELECT * FROM months WHERE id = $id;`, {$id: this.lastID}, (err, row) => {
//                 if(err) {
//                     next(err);
//                 } else {
//                     res.status(201).json({month: row});
//                 }
//             });
//         }
//     });
// });

app.post('/years/:year', (req,res,next) => {
    db.query(`INSERT INTO months SET ?;`, {
        month: req.body.month,
        year: req.params.year
    }, (err, row) => {
        if(err) {
            next(err);
        } else{
            res.sendStatus(201);
        }
    })
})

// app.delete('/years/:year', (req,res,next) => {
//     db.query(`SELECT * FROM weeks WHERE monthId = $monthId;`, {$monthId: req.query.monthId}, (err, rows) => {
//         if(err) {
//             next(err);
//         } else if(rows.length){
//             res.sendStatus(400);
//         } else {
//             db.query(`DELETE FROM months WHERE id = $id;`, {$id: req.query.monthId}, (err) => {
//                 if(err) {
//                     next(err);
//                 } else {
//                     res.sendStatus(204);
//                 }
//             });
//         }
//     });
// });

app.delete(`/years/:year`, (req,res,next) => {
    console.log(req.body.monthID)
    db.query(`DELETE FROM months WHERE id = ${req.body.monthID};`, (err) => {
        if(err){
            next(err);
        } else{
            res.sendStatus(204);
        }
    })
})


app.use(errorHandler());

app.listen(PORT, () => {
    console.log(`Server listening on PORT ${PORT}`)
});