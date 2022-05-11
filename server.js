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

app.get('/years/:year', (req,res,next) => {
    db.query(`SELECT * FROM months WHERE year = ${req.params.year};`, (err, rows) => {
        if(err){
            next(err);
        } else{
            res.status(200).json({months: rows});
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
            res.sendStatus(200);
        }
    })
});

app.get('/years/:year/month', (req,res,next) => {
    db.query(`SELECT * FROM weeks WHERE year = ${req.params.year} AND months_id = ${req.query.monthID};`, (err, rows) => {
        if(err){
            next(err);
        } else{
            res.status(200).json({weeks: rows});
        }
    })
});

// weeksRouter.post('/', (req,res,next) => {
//     const newWeek = req.query;
//     db.run(`INSERT INTO Weeks (week, yearFK, monthId)
//         VALUES ($week, $yearFK, $monthId);`, {
//             $week: newWeek.week,
//             $yearFK: newWeek.yearFK,
//             $monthId: newWeek.monthId
//         }, function(err) {
//             if(err) {
//                 next(err);
//             } else {
//                 db.get(`SELECT * FROM Weeks WHERE id = $id;`, {$id: this.lastID}, (err, row) => {
//                     if(err) {
//                         next(err);
//                     } else{
//                         res.status(201).json({week: row});
//                     }
//                 });
//             }
//         });
// });

app.post('/years/:year/month', (req,res,next) => {
    const newWeek = req.body.week;
    if(!req.params.year || !newWeek.date || !newWeek.monthID) {
        res.sendStatus(400);
    } else{
        db.query(`INSERT INTO weeks SET ?;`, {
            week: newWeek.date,
            year: req.params.year,
            months_id: newWeek.monthID
        }, (err,row) => {
            if(err){
                next(err);
            } else{
                res.sendStatus(201);
            }
        })
    }
});

// weeksRouter.delete('/', (req,res,next) => {
//     db.all(`SELECT * FROM TimeLogger WHERE weekId = $weekId;`, {$weekId: req.query.weekId}, (err, rows) => {
//         if(err) {
//             next(err);
//         } else if(rows.length){
//             res.sendStatus(400);
//         } else {
//             db.all(`SELECT * FROM Checkbox WHERE weekId = $weekId;`, {$weekId: req.query.weekId}, (err, rows) => {
//                 if(rows.length){
//                     res.sendStatus(400);
//                 } else{
//                     db.all(`SELECT * FROM Subjective WHERE weekId = $weekId;`, {$weekId: req.query.weekId}, (err, rows) => {
//                         if(rows.length){
//                             res.sendStatus(400);
//                         } else{
//                             db.run(`DELETE FROM Weeks WHERE id = $id;`, {$id: req.query.weekId}, (err) => {
//                                     res.sendStatus(200);
//                             });
//                         }
//                     });
//                 }
//             });
//         }
//     });
// });
// for some reason, even though rows returns an empty array when appropriate, else if statement runs the sendStatus(400). But issue resolved when adding .length to rows.          

app.delete('/years/:year/month', (req,res,next) => {
    db.query(`DELETE FROM weeks WHERE id = ${req.body.weekID};`, (err) => {
        if(err){
            next(err);
        } else{
            res.sendStatus(200);
        }
    })
});

//TIMELOGGER
app.get('/years/:year/month/table', (req,res,next) => {
    db.query(`SELECT * FROM timeLogger WHERE weeks_id = ${req.query.weekID};`, (err,rows) => {
        if(err){
            next(err);
        } else{
            res.status(200).json({tables: rows});
        }
    })
});

// tableRouter.post('/', (req,res,next) => {
//     const newTable = req.body.table;
//     if(!newTable.skillName || !newTable.weekId) {
//         res.sendStatus(400);
//     } else {
//         db.run(`INSERT INTO TimeLogger (skillName, weekId, monthId, yearFK,
//             learningMondayHours, learningMondayMinutes, learningTuesdayHours, learningTuesdayMinutes, learningWednesdayHours, 
//                     }, function(err) {
//                         if(err) {
//                             next(err);
//                         } else {
//                             db.get(`SELECT * FROM TimeLogger WHERE id = $id;`, {$id: this.lastID}, (err,row) => {
//                                 res.status(201).json({table: row})
//                             });
//                         }
//                     });
//     }
// });
app.post('/years/:year/month/table', (req,res,next) => {
    const newTable = req.body.table;
    if(!newTable.skillName || !newTable.weekID) {
        res.sendStatus(400);
    } else {
        db.query(`INSERT INTO timeLogger SET ?;`, {
            skillName: newTable.skillName,                                  //skillname
            weeks_id: newTable.weekID,                                        //WeekID
            months_id: newTable.monthID,                                      //MonthId
            year: newTable.year,                                        // year foreign key
            learningMondayHours: null,            //this starts learning row of table
            learningMondayMinutes: null, 
            learningTuesdayHours: null, 
            learningTuesdayMinutes: null,
            learningWednesdayHours: null, 
            learningWednesdayMinutes: null, 
            learningThursdayHours: null, 
            learningThursdayMinutes: null, 
            learningFridayHours: null, 
            learningFridayMinutes: null, 
            learningSaturdayHours: null, 
            learningSaturdayMinutes: null,
            learningSundayHours: null,  
            learningSundayMinutes: null, 
            learningGoalHours: null, 
            learningGoalMinutes: null,
            practicingMondayHours: null,       //this starts practicing row of table
            practicingMondayMinutes: null,
            practicingTuesdayHours: null,
            practicingTuesdayMinutes: null,
            practicingWednesdayHours: null,
            practicingWednesdayMinutes: null,
            practicingThursdayHours: null,
            practicingThursdayMinutes: null,
            practicingFridayHours: null,
            practicingFridayMinutes: null,
            practicingSaturdayHours: null,
            practicingSaturdayMinutes: null,
            practicingSundayHours: null,
            practicingSundayMinutes: null,
            practicingGoalHours: null,
            practicingGoalMinutes: null,          
            performingMondayHours: null,          //this starts performing row of table
            performingMondayMinutes: null,
            performingTuesdayHours: null,
            performingTuesdayMinutes: null,
            performingWednesdayHours: null,
            performingWednesdayMinutes: null,
            performingThursdayHours: null,
            performingThursdayMinutes: null,
            performingFridayHours: null,
            performingFridayMinutes: null,
            performingSaturdayHours: null,
            performingSaturdayMinutes: null,
            performingSundayHours: null,
            performingSundayMinutes: null,
            performingGoalHours: null,
            performingGoalMinutes: null,
            totalGoalHours: null, 
            totalGoalMinutes: null
        }, (err, row) => {
            if(err){
                next(err);
            } else{
                res.sendStatus(201);
            }
        })
    }
});
// tableRouter.put('/', (req,res,next) => {
//     const updatedTable = req.body.table;
//     if(!updatedTable.total.goal.hours || !updatedTable.skillName) {
//         res.sendStatus(400);
//     } else {
//         db.run(`UPDATE TimeLogger SET
//             skillName = $skillName,
//             learningMondayHours =$learningMondayHours, learningMondayMinutes =$learningMondayMinutes, learningTuesdayHours =$learningTuesdayHours, 
//             learningTuesdayMinutes =$learningTuesdayMinutes, learningWednesdayHours =$learningWednesdayHours, learningWednesdayMinutes =$learningWednesdayMinutes, 
//             learningThursdayHours =$learningThursdayHours, learningThursdayMinutes =$learningThursdayMinutes, learningFridayHours =$learningFridayHours, 
//             learningFridayMinutes =$learningFridayMinutes, learningSaturdayHours =$learningSaturdayHours, learningSaturdayMinutes =$learningSaturdayMinutes, 
//             learningSundayHours =$learningSundayHours, learningSundayMinutes =$learningSundayMinutes, learningActualHours =$learningActualHours, learningActualMinutes = $learningActualMinutes,
//             learningGoalHours =$learningGoalHours, learningGoalMinutes =$learningGoalMinutes,
//             practicingMondayHours =$practicingMondayHours, practicingMondayMinutes =$practicingMondayMinutes, practicingTuesdayHours =$practicingTuesdayHours, 
//             practicingTuesdayMinutes =$practicingTuesdayMinutes, practicingWednesdayHours =$practicingWednesdayHours, practicingWednesdayMinutes =$practicingWednesdayMinutes, 
//             practicingThursdayHours =$practicingThursdayHours, practicingThursdayMinutes =$practicingThursdayMinutes, practicingFridayHours =$practicingFridayHours, 
//             practicingFridayMinutes =$practicingFridayMinutes, practicingSaturdayHours =$practicingSaturdayHours, practicingSaturdayMinutes =$practicingSaturdayMinutes, 
//             practicingSundayHours =$practicingSundayHours, practicingSundayMinutes =$practicingSundayMinutes, practicingActualHours =$practicingActualHours, practicingActualMinutes =$practicingActualMinutes, 
//             practicingGoalHours =$practicingGoalHours, practicingGoalMinutes =$practicingGoalMinutes,  
//             performingMondayHours =$performingMondayHours, performingMondayMinutes =$performingMondayMinutes, performingTuesdayHours =$performingTuesdayHours, 
//             performingTuesdayMinutes =$performingTuesdayMinutes, performingWednesdayHours =$performingWednesdayHours, performingWednesdayMinutes =$performingWednesdayMinutes, 
//             performingThursdayHours =$performingThursdayHours, performingThursdayMinutes =$performingThursdayMinutes, performingFridayHours =$performingFridayHours, 
//             performingFridayMinutes =$performingFridayMinutes, performingSaturdayHours =$performingSaturdayHours, performingSaturdayMinutes =$performingSaturdayMinutes, 
//             performingSundayHours =$performingSundayHours, performingSundayMinutes =$performingSundayMinutes, performingActualHours =$performingActualHours, performingActualMinutes =$performingActualMinutes,
//             performingGoalHours =$performingGoalHours, performingGoalMinutes =$performingGoalMinutes,
//             totalActualHours =$totalActualHours, totalActualMinutes =$totalActualMinutes, totalGoalHours =$totalGoalHours, totalGoalMinutes =$totalGoalMinutes
//             WHERE id = $id;`, {
//                 $skillName: updatedTable.skillName,                                  //skillname
//                 $learningMondayHours: updatedTable.learning.monday.hours,            //this starts learning row of table
//                 $performingGoalHours: updatedTable.performing.goal.hours,
//                 $performingGoalMinutes: updatedTable.performing.goal.minutes,
//                 $totalActualHours: updatedTable.total.actual.hours,
//                 $totalActualMinutes: updatedTable.total.actual.minutes,
//                 $totalGoalHours: updatedTable.total.goal.hours, 
//                 $totalGoalMinutes: updatedTable.total.goal.minutes,
//                 $id: updatedTable.id
//             }, (err) => {
//                 if(err) {
//                     next(err);
//                 } else {                            ***This part is different. Maybe add a get request to return post requests?***
//                     db.get(`SELECT * FROM TimeLogger WHERE id = $id;`, {$id: updatedTable.id}, (err, row) => {
//                         res.status(200).json({table: row});
//                     });
//                 }
//             });
//     }
// });
app.put('/years/:year/month/table', (req,res,next) => {
    const updatedTable = req.body.table;
    if(!updatedTable.total.goal.hours || !updatedTable.skillName) {
        res.sendStatus(400);
    } else{
        db.query(`UPDATE timeLogger SET ? WHERE id = ${updatedTable.id};`, {
            id: updatedTable.id,
            skillName: updatedTable.skillName,                                  //skillname
            learningMondayHours: updatedTable.learning.monday.hours,            //this starts learning row of table
            learningMondayMinutes: updatedTable.learning.monday.minutes, 
            learningTuesdayHours: updatedTable.learning.tuesday.hours, 
            learningTuesdayMinutes: updatedTable.learning.tuesday.minutes,
            learningWednesdayHours: updatedTable.learning.wednesday.hours, 
            learningWednesdayMinutes: updatedTable.learning.wednesday.minutes, 
            learningThursdayHours: updatedTable.learning.thursday.hours, 
            learningThursdayMinutes: updatedTable.learning.thursday.minutes, 
            learningFridayHours: updatedTable.learning.friday.hours, 
            learningFridayMinutes: updatedTable.learning.friday.minutes, 
            learningSaturdayHours: updatedTable.learning.saturday.hours, 
            learningSaturdayMinutes: updatedTable.learning.saturday.minutes,
            learningSundayHours: updatedTable.learning.sunday.hours,  
            learningSundayMinutes: updatedTable.learning.sunday.minutes, 
            learningActualHours: updatedTable.learning.actual.hours,
            learningActualMinutes: updatedTable.learning.actual.minutes,
            learningGoalHours: updatedTable.learning.goal.hours, 
            learningGoalMinutes: updatedTable.learning.goal.minutes,
            practicingMondayHours: updatedTable.practicing.monday.hours,       //this starts practicing row of table
            practicingMondayMinutes: updatedTable.practicing.monday.minutes,
            practicingTuesdayHours: updatedTable.practicing.tuesday.hours,
            practicingTuesdayMinutes: updatedTable.practicing.tuesday.minutes,
            practicingWednesdayHours: updatedTable.practicing.wednesday.hours,
            practicingWednesdayMinutes: updatedTable.practicing.wednesday.minutes,
            practicingThursdayHours: updatedTable.practicing.thursday.hours,
            practicingThursdayMinutes: updatedTable.practicing.thursday.minutes,
            practicingFridayHours: updatedTable.practicing.friday.hours,
            practicingFridayMinutes: updatedTable.practicing.friday.minutes,
            practicingSaturdayHours: updatedTable.practicing.saturday.hours,
            practicingSaturdayMinutes: updatedTable.practicing.saturday.minutes,
            practicingSundayHours: updatedTable.practicing.sunday.hours,
            practicingSundayMinutes: updatedTable.practicing.sunday.minutes,
            practicingActualHours: updatedTable.practicing.actual.hours,
            practicingActualMinutes: updatedTable.practicing.actual.minutes,
            practicingGoalHours: updatedTable.practicing.goal.hours,
            practicingGoalMinutes: updatedTable.practicing.goal.minutes,          
            performingMondayHours: updatedTable.performing.monday.hours,          //this starts performing row of table
            performingMondayMinutes: updatedTable.performing.monday.minutes,
            performingTuesdayHours: updatedTable.performing.tuesday.hours,
            performingTuesdayMinutes: updatedTable.performing.tuesday.minutes,
            performingWednesdayHours: updatedTable.performing.wednesday.hours,
            performingWednesdayMinutes: updatedTable.performing.wednesday.minutes,
            performingThursdayHours: updatedTable.performing.thursday.hours,
            performingThursdayMinutes: updatedTable.performing.thursday.minutes,
            performingFridayHours: updatedTable.performing.friday.hours,
            performingFridayMinutes: updatedTable.performing.friday.minutes,
            performingSaturdayHours: updatedTable.performing.saturday.hours,
            performingSaturdayMinutes: updatedTable.performing.saturday.minutes,
            performingSundayHours: updatedTable.performing.sunday.hours,
            performingSundayMinutes: updatedTable.performing.sunday.minutes,
            performingActualHours: updatedTable.performing.actual.hours,
            performingActualMinutes: updatedTable.performing.actual.minutes,
            performingGoalHours: updatedTable.performing.goal.hours,
            performingGoalMinutes: updatedTable.performing.goal.minutes,
            totalActualHours: updatedTable.total.actual.hours,
            totalActualMinutes: updatedTable.total.actual.minutes,
            totalGoalHours: updatedTable.total.goal.hours, 
            totalGoalMinutes: updatedTable.total.goal.minutes
        }, (err) => {
            if(err){
                next(err);
            } else{
                res.sendStatus(200);
            }
        })
    }
});

// tableRouter.delete('/', (req,res,next) => {
//     db.run(`DELETE FROM TimeLogger WHERE id = $id;`, {$id: req.query.id}, (err) => {
//         if(err) {
//             next(err);
//         } else {
//             res.sendStatus(200)
//         }
//     });
// });
app.delete('/years/:year/month/table', (req,res,next) => {
    db.query(`DELETE FROM timeLogger WHERE id = ${req.query.id};`, (err) => {
        if(err) {
            next(err);
        } else {
            res.sendStatus(200);
        }
    })
});

//CHECKBOXES
app.get('/years/:year/month/checkbox', (req,res,next) => {
    db.query(`SELECT * FROM checkbox WHERE weeks_id = ${req.query.weekID};`, (err,rows) => {
        if(err){
            next(err);
        } else{
            res.status(200).json({checkboxes: rows});
        }
    })
});
// checkboxRouter.post('/', (req,res,next) => {
//     const newCheckbox = req.body.checkbox
//     if(!newCheckbox.skillName) {
//         res.sendStatus(400);
//     } else {
//         db.run(`INSERT INTO Checkbox (skillName, monthId, yearFK, monday, tuesday, wednesday, thursday, friday, saturday, sunday, weekId)
//         VALUES ($skillName, $monthId, $yearFK, $monday, $tuesday, $wednesday, $thursday, $friday, $saturday, $sunday, $weekId);`, {
//             $skillName: newCheckbox.skillName,
//             $monthId: newCheckbox.monthId,
//             $yearFK: newCheckbox.yearFK,
//             $monday: newCheckbox.monday,
//             $tuesday: newCheckbox.tuesday,
//             $wednesday: newCheckbox.wednesday,
//             $thursday: newCheckbox.thursday,
//             $friday: newCheckbox.friday,
//             $saturday: newCheckbox.saturday,
//             $sunday: newCheckbox.sunday,
//             $weekId: newCheckbox.weekId
//         }, function(err) {
//             if(err) {
//                 next(err);
//             } else {
//                 db.get(`SELECT * FROM Checkbox WHERE id = $id;`, {$id: this.lastID}, (err, row) => {
//                     res.status(201).json({checkbox: row});
//                 });
//             }
//         });
//     }
// }); 

app.post('/years/:year/month/checkbox', (req,res,next) => {// ***try to implement adding a get query after posting to return row***
    const newCheckbox = req.body.checkbox;
    if(!newCheckbox.skillName) {
        res.sendStatus(400);
    } else{
        db.query(`INSERT INTO checkbox SET ?;`, {
            skillName: newCheckbox.skillName,
            weeks_id: newCheckbox.weekID,
            months_id: newCheckbox.monthID,
            year: newCheckbox.year,
            monday: newCheckbox.monday,
            tuesday: newCheckbox.tuesday,
            wednesday: newCheckbox.wednesday,
            thursday: newCheckbox.thursday,
            friday: newCheckbox.friday,
            saturday: newCheckbox.saturday,
            sunday: newCheckbox.sunday
        }, (err, row) => {
            if(err){
                next(err);
            } else{
                res.sendStatus(201)
            }
        })
    }
});
// checkboxRouter.put('/', (req,res,next) => {
//     const updatedCheckbox = req.body.checkbox;
//     console.log(updatedCheckbox);
//     if(!updatedCheckbox.skillName) {
//         res.sendStatus(400);
//     }  else {
//         db.run(`UPDATE Checkbox SET 
//             skillName = $skillName,
//             monday = $monday,
//             tuesday = $tuesday,
//             wednesday = $wednesday,
//             thursday = $thursday,
//             friday = $friday, 
//             saturday = $saturday,
//             sunday = $sunday
//             WHERE id = $id;`, {
//                 $skillName: updatedCheckbox.skillName,
//                 $monday: updatedCheckbox.monday,
//                 $tuesday: updatedCheckbox.tuesday,
//                 $wednesday: updatedCheckbox.wednesday,
//                 $thursday: updatedCheckbox.thursday,
//                 $friday: updatedCheckbox.friday,
//                 $saturday: updatedCheckbox.saturday,
//                 $sunday: updatedCheckbox.sunday,
//                 $id: updatedCheckbox.id
//             }, (err) => {
//                 if(err) {
//                     next(err);
//                 } else{
//                     db.get(`SELECT * FROM Checkbox WHERE id = $id;`, {$id: updatedCheckbox.id}, (err, row) => {
//                         res.status(200).json({checkbox: row});
//                     });
//                 }
//             });
//     }
// });
app.put('/year/:year/month/checkbox', (req,res,next) => {
    const updatedCheckbox = req.body.checkbox;
    if(!updatedCheckbox.skillName){
        res.sendStatus(400);
    } else{
        db.query(`UPDATE checkbox SET ? WHERE id = ${updatedCheckbox.id};`, {
            id: updatedCheckbox.id,
            skillName: updatedCheckbox.skillName,
            monday: updatedCheckbox.monday,
            tuesday: updatedCheckbox.tuesday,
            wednesday: updatedCheckbox.wednesday,
            thursday: updatedCheckbox.thursday,
            friday: updatedCheckbox.friday,
            saturday: updatedCheckbox.saturday,
            sunday: updatedCheckbox.sunday
        }, (err) => {
            if(err){
                next(err);
            } else{
                db.query(`SELECT * FROM checkbox WHERE id = ${updatedCheckbox.id};`, (err, row) => {
                    res.status(200).json({checkbox: row});
                })
            }
        })
    }
});
// checkboxRouter.delete('/', (req,res,next) => {
//     db.run(`DELETE FROM Checkbox WHERE id = $id;`, {$id: req.query.id}, (err) => {
//         if(err) {
//             next(err);
//         }else {
//             res.sendStatus(200);
//         }
//     });
// });
app.delete('/years/:year/month/checkbox', (req,res,next) => {
    db.query(`DELETE FROM checkbox WHERE id = ${req.query.id};`, (err) => {
        if(err) {
            next(err);
        } else{
            res.sendStatus(200);
        }
    })
});

//TEXTBOXES
app.get('/years/:year/month/textboxes', (req,res,next) => {
    db.query(`SELECT * FROM textbox WHERE weeks_id = ${req.query.weekID};`, (err, rows) => {
        if(err){
            next(err);
        } else{
            res.status(200).json({textboxes: rows});
        }
    })
});
// subjectiveRouter.post('/', (req,res,next) => {
//     const newTextbox = req.body.textbox;
//     if(!newTextbox.skillName){
//         res.sendStatus(400);
//     } else {
//         db.run(`INSERT INTO Subjective (text, skillName, weekId)
//             VALUES ($text, $skillName, $weekId);`, {
//                 $text: newTextbox.text, 
//                 $skillName: newTextbox.skillName,
//                 $weekId: newTextbox.weekId
//             }, function(err){
//                 if(err) {
//                     next(err);
//                 } else{
//                     db.get(`SELECT * FROM Subjective WHERE id = $id;`, {$id: this.lastID}, (err, row) => {
//                         res.status(201).json({textbox: row});
//                     });
//                 }
//             });
//     }
// });
app.post('/years/:year/month/textbox', (req,res,next) => {
    const newTextbox = req.body.textbox;
    if(!newTextbox.skillName){
        res.sendStatus(400);
    } else{
        db.query(`INSERT INTO textbox SET ?;`, {
            skillName: newTextbox.skillName,
            weeks_id: newTextbox.weekID,
            months_id: newTextbox.monthID,
            year: newTextbox.year,
            text: newTextbox.text
        }, err => {
            if(err){
                next(err);
            } else{
                res.sendStatus(200);
            }
        })
    }
});
// subjectiveRouter.put('/', (req,res,next) => {
//     const updatedTextbox = req.body.textbox;
//     if(!updatedTextbox.skillName) {
//         res.sendStatus(400);
//     } else{
//         db.run(`UPDATE Subjective SET 
//             skillName = $skillName,
//             text = $text
//             WHERE id = $id;`, {
//                 $skillName: updatedTextbox.skillName,
//                 $text: updatedTextbox.text,
//                 $id: updatedTextbox.id
//             }, (err) => {
//                 if(err){
//                     next(err);
//                 } else{
//                     db.get(`SELECT * FROM Subjective WHERE id = $id;`, {$id: updatedTextbox.id}, (err, row) => {
//                         res.status(200).json({textbox: row});
//                     });
//                 }
//             });
//     }
// });
app.put('/years/:year/month/textbox', (req,res,next) => {
    const updatedTextbox = req.body.textbox;
    if(!updatedTextbox.skillName){
        res.sendStatus(400);
    } else{
        db.query(`UPDATE textbox SET ? WHERE id = ${updatedTextbox.id};`, {
            skillName: updatedTextbox.skillName,
            text: updatedTextbox.text,
        }, err => {
            if(err){
                next(err);
            } else{
                res.sendStatus(200);
            }
        })
    }
});

app.delete('/years/:year/month/textbox', (req,res,next) => {
    db.query(`DELETE FROM textbox WHERE id = ${req.query.id};`, err => {
        if(err) {
            next(err);
        } else{
            res.sendStatus(200);
        }
    })
});

//MONTH REVIEW
app.get('/years/:year/month/monthSummary/table/:monthID', (req,res,next) => {
    db.query(`SELECT skillName,
        SUM(learningActualHours) AS learningActualHours,  SUM(learningActualMinutes) AS learningActualMinutes, SUM(practicingActualHours) AS practicingActualHours, 
        SUM(practicingActualMinutes) AS practicingActualMinutes, SUM(performingActualHours) AS performingActualHours, SUM(performingActualMinutes) AS performingActualMinutes,
        SUM(totalActualHours) AS totalActualHours, SUM(totalActualMinutes) AS totalActualMinutes
        FROM timeLogger WHERE months_id = ${req.params.monthID}
        GROUP BY skillName;`, (err, rows) => {
            if(err){
                next(err);
            } else{
                res.status(200).json({tables: rows});
            }
        })
});

app.get('/years/:year/month/monthSummary/checkbox/:monthID', (req,res,next) => {
    db.query(`SELECT skillName,
    SUM(monday) AS mondayTotal, SUM(tuesday) AS tuesdayTotal, SUM(wednesday) AS wednesdayTotal, SUM(thursday) AS thursdayTotal, 
    SUM(friday) AS fridayTotal, SUM(saturday) AS saturdayTotal, SUM(sunday) AS sundayTotal 
    FROM checkbox WHERE months_id = ${req.params.monthID}
    GROUP BY skillName;`, (err, rows) => {
        if(err) {
            next(err);
        } else{
            res.status(200).json({checkboxes: rows});
        }
    })
});

app.get('/years/:year/month/monthSummary/textbox/:monthID', (req,res,next) => {
    db.query(`SELECT * FROM textbox WHERE months_id = ${req.params.monthID} AND skillName = "Month Review";`, (err, row) => {
        if(err){
            next(err);
        } else{
            res.status(200).json({textbox: row});
        }
    })
});

app.post('/years/:year/month/monthSummary/textbox', (req,res,next) => {
    const newTextbox = req.body.textbox;
    db.query(`INSERT INTO textbox SET ?;`, {
        skillName: "Month Review",
        months_id: newTextbox.monthID,
        year: newTextbox.year,
        text: newTextbox.text
    }, (err, row) => {
        if(err) {
            next(err);
        } else{
            res.sendStatus(201);
        }
    })
});

app.put('/years/:year/month/monthSummary/textbox', (req,res,next) => {
    db.query(`UPDATE textbox SET ? WHERE id = ${req.body.textbox.id};`, {
        text: req.body.textbox.text,
    }, err =>{
        if(err){
            next(err);
        } else{
            res.sendStatus(200);
        }
    })
});

app.use(errorHandler());

app.listen(PORT, () => {
    console.log(`Server listening on PORT ${PORT}`)
});