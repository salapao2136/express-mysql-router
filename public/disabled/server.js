var express = require('express');
var bodyParser = require('body-parser');
var respond = require('../helper/respond');
var q = require('q');
var jsonParser = bodyParser.json()
var router = express.Router()
var mysql = require('mysql');
var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'run2gether'
});
router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
var cors = require('cors')
var corsOptions = {
        origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://192.168.2.125:8080/disabled', 'http://localhost:8080/disabled']
    }
    // ////////////////////////////////////////////////////
    // get type normal and id traget
router.get('/members/normal/:mem_id', cors(corsOptions), function(req, res) {
        pool.getConnection(function(err, conn) {
            conn.query('SELECT * from member where member.mem_type = "normal" and member.mem_id = ?', [req.params.mem_id], function(err, rows, fields) {
                if (err) throw err;
                // res.json(rows);
                respond(res, rows);
                conn.release();
            });
        });
    })
    // ////////////////////////////////////////////////////
    // get all type normal
router.get('/members/normal', cors(corsOptions), function(req, res) {
        pool.getConnection(function(err, conn) {
            conn.query('SELECT * from member where mem_type = "normal"', function(err, rows, fields) {
                if (err) throw err;
                res.json(rows);
                conn.release();
            });
        });
    })
    // ////////////////////////////////////////////////////
    // get all type disabled
router.get('/members/disabled', cors(corsOptions), function(req, res) {
        pool.getConnection(function(err, conn) {
            conn.query('SELECT * from member where mem_type = "disabled"', function(err, rows, fields) {
                if (err) throw err;
                res.json(rows);
                conn.release();
            });
        });
    })
    // ////////////////////////////////////////////////////
    // get all type disabled and id traget
router.get('/members/disabled/:mem_id', cors(corsOptions), function(req, res) {
        pool.getConnection(function(err, conn) {
            conn.query('SELECT * from member where mem_type = "disabled" and mem_id = ?', [req.params.mem_id], function(err, rows, fields) {
                if (err) throw err;
                res.json(rows);
                conn.release();
            });
        });
    })
    // ////////////////////////////////////////////////////
    // get member traget id
router.get('/members/:mem_id', cors(corsOptions), function(req, res) {
        console.log(req.params.id);
        pool.getConnection(function(err, conn) {
            conn.query('SELECT * from member where mem_id = ?', [req.params.mem_id], function(err, rows, fields) {
                if (err) throw err;
                res.json(rows);
                conn.release();
            });
        });
    })
    // ////////////////////////////////////////////////////
    // get all member
router.get('/members', cors(corsOptions), function(req, res) {
        pool.getConnection(function(err, conn) {
            conn.query('SELECT * from member', function(err, rows, fields) {
                if (err) throw err;
                res.json(rows);
                conn.release();
            });
        });
    })
    // ////////////////////////////////////////////////////
    // push data member and get id member and push detail_event
router.post('/members', cors(corsOptions), function(req, res) {
        pool.getConnection(function(err, conn) {
            conn.beginTransaction(function(transactionError) {
                q.promise(function(resolve, reject, notify) {
                    if (transactionError) {
                        reject(transactionError)
                    }
                    conn.query('insert into member values ("",?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [req.body.mem_id_num,
                            req.body.mem_name,
                            req.body.mem_surname,
                            req.body.mem_nickname,
                            req.body.mem_gender,
                            req.body.mem_age,
                            req.body.mem_email,
                            req.body.mem_tel,
                            req.body.mem_date,
                            req.body.mem_pic,
                            req.body.mem_discription,
                            req.body.mem_department,
                            req.body.mem_type,
                            req.body.mem_disabled_type
                        ],
                        function(err, rows, fields) {
                            // console.log(rows.insertId);
                            if (err) {
                                reject(err);
                            }
                            // console.log(rows);
                            resolve(rows.insertId)
                        });
                }).then(function(response_new) {
                    return q.promise(function(resolve, reject, notify) {
                        conn.query('INSERT INTO detail_event values ("",?,?,?,?,?,null,?)', [response_new, "active", "L", "200", req.body.event_id, "register"],
                            function(err, rows, fields) {
                                if (err) {
                                    reject(err);
                                }
                                resolve(rows);
                            });
                    })
                }).then(function() {
                    res.send('register success')
                    conn.commit(function(err) {
                        if (err) {
                            reject(err)
                        }
                    })
                    conn.release();
                }).catch(function(error) {
                    console.log(error)
                    conn.rollback(function(error) {
                        console.log(error)
                    });
                    conn.release();
                })
            })
        });
    })
    // ////////////////////////////////////////////////////
    // delete member by id
router.delete('/members/:id', cors(corsOptions), function(req, res) {
    pool.getConnection(function(err, conn) {
        conn.query('DELETE from member where mem_id = ? ', [req.params.id],
            function(err, rows, fields) {
                if (err) throw err;
                // if (rows.) {
                //
                // }
                res.send("deletes member id = " + req.params.id);
                conn.release();
            });
    });
});
// ////////////////////////////////////////////////////
// update member by id
router.put('/members/:mem_id', cors(corsOptions), function(req, res) {
    pool.getConnection(function(err, conn) {
        conn.query('UPDATE member set mem_id_num = ?' +
            ', mem_name = ?, mem_surname = ?, mem_nickname = ?,' +
            ' mem_gender = ?, mem_age = ?, mem_email = ?, mem_tel = ?,' +
            ' mem_date = ?, mem_pic = ?, mem_discription = ?,' +
            ' mem_department = ? ,mem_type = ?, mem_disabled_type = ? where mem_id = ?', [req.body.mem_id_num,
                req.body.mem_name,
                req.body.mem_surname,
                req.body.mem_nickname,
                req.body.mem_gender,
                req.body.mem_age,
                req.body.mem_email,
                req.body.mem_tel,
                req.body.mem_date,
                req.body.mem_pic,
                req.body.mem_discription,
                req.body.mem_department,
                req.body.mem_type,
                req.body.mem_disabled_type,
                req.params.mem_id
            ],
            function(err, rows, fields) {
                if (err) throw err;
                res.send("Update member id = " + req.params.id);
                conn.release();
            });
    });
});
// get all event
router.get('/event', cors(corsOptions), function(req, res) {
    pool.getConnection(function(err, conn) {
        conn.query('select * from event',
            function(err, rows, fields) {
                if (err) throw err;
                rows.forEach((item, index) => {
                     rows[index].event_distance  = item.event_distance.split(',')
                })
                res.send(rows)
                conn.release();
            });
    });
});
////////////////////////////////////////////////////////////
// get event traget id
router.get('/event/:id', cors(corsOptions), function(req, res) {
    pool.getConnection(function(err, conn) {
        conn.query('select * from event where event_id = ?', [req.params.id],
            function(err, rows, fields) {
                if (err) throw err;
                res.send(rows)
                conn.release();
            });
    });
});
////////////////////////////////////////////////////////////
// push data event
router.post('/event', cors(corsOptions), function(req, res) {
    pool.getConnection(function(err, conn) {
        conn.query('insert into event values(?,?,?,?,?,?,?,?,?,?)',
            [ "",
              req.body.event_name,
              req.body.event_date_start,
              req.body.event_date_open,
              req.body.event_date_close,
              req.body.event_location,
              req.body.event_distance,
              req.body.event_optional,
              req.body.event_price,
              req.body.event_size ],
            function(err, rows, fields) {
                if (err) throw err;
                res.send('insert event success')
                conn.release();
            });
    });
});
////////////////////////////////////////////////////////////
// ลบข้อมูลด้วย event_id ในตาราง Event
router.delete('/event/:event_id', cors(corsOptions), function(req, res) {
    pool.getConnection(function(err, conn) {
        conn.query('DELETE from event where event_id = ?', [req.params.event_id],
            function(err, rows, fields) {
                if (err) throw err;
                console.log(rows);
                if (rows.affectedRows !== 0) {
                    res.send('delete event event_id = ' + rows)
                } else {
                    res.send('Invalid id ')
                }

                conn.release();
            });
    });
});
////////////////////////////////////////////////////////////
// แก้ไขข้อมูล event
router.put('/event/:id', cors(corsOptions), function(req, res) {
    pool.getConnection(function(err, conn) {
        conn.query('update event set event_name = ? ,' +
            'event_date_start = ? , event_date_open = ?,' +
            'event_date_close = ?, event_location = ? , ' +
            'event_distance = ?,event_optional = ? , event_price = ? '+
            ', event_size = ? where event_id = ? ',
            [ req.body.event_name,
              req.body.event_date_start,
              req.body.event_date_open,
              req.body.event_date_close,
              req.body.event_location,
              req.body.event_distance,
              req.body.event_optional,
              req.body.event_price,
              req.body.event_size,
              req.params.id ],
            function(err, rows, fields) {
                if (err) throw err;
                res.send('updete event event_id = ' + req.params.id)
                conn.release();
            });
    });
});
////////////////////////////////////////////////////////////
router.get('/group/:id', cors(corsOptions), function(req, res) {
    pool.getConnection(function(err, conn) {
        conn.query('SELECT * FROM member as m1 JOIN user_in_group as m2 ON m1.mem_id = m2.mem_id where m2.group_id=?', [req.params.id],
            function(err, rows, fields) {
                if (err) throw err;
                res.send(rows)
                conn.release();
            });
    });
});
////////////////////////////////////////////////////////////
router.get('/group', cors(corsOptions), function(req, res) {
    q.promise(function(resolve, reject, notify) {
        pool.getConnection(function(err, conn) {
            conn.query('SELECT * FROM `group`',
                function(err, rows, fields) {
                    if (err) reject(err);
                    console.log(rows);
                    resolve(rows)
                    conn.release();
                });
        });
    }).then(function(response) {
        return q.promise(function(resolve, reject, notify) {
            resolve(response)
        })
    }).then(function(response) {
        return q.promise(function(resolve, reject, notify) {
            res.send(response);
        })
    })
});
////////////////////////////////////////////////////////////
// ดูคนทั้งหมดที่สมัครมา
router.get('/detail_event', cors(corsOptions), function(req, res) {
    pool.getConnection(function(err, conn) {
        conn.query('SELECT * FROM `detail_event`',
            function(err, rows, fields) {
                if (err) throw (err);
                res.send(rows)
                conn.release();
            });
    })
});
////////////////////////////////////////////////////////////
// ดูรายชื่อในแต่ละ Event ด้วย event_id
router.get('/detail_event/:event_id', cors(corsOptions), function(req, res) {
    pool.getConnection(function(err, conn) {
        conn.query('SELECT * FROM `detail_event` ,member where detail_event.mem_id = member.mem_id and detail_event.event_id = ?', [req.params.event_id],
            function(err, rows, fields) {
                if (err) throw (err);
                res.send(rows)
                conn.release();
            });
    })
});
////////////////////////////////////////////////////////////
// คู่ใน แต่ละ Event ส่งค่าevent_id
router.get('/group_event/:event_id', cors(corsOptions), function(req, res) {
    pool.getConnection(function(err, conn) {
        conn.query('SELECT * FROM `detail_event` as m1 JOIN member as m2 on m1.mem_id = m2.mem_id and m1.event_id = ? AND m1.group_id != \'NULL\'', [req.params.event_id],
            function(err, rows, fields) {
                if (err) throw (err);
                var group_id = rows.map((item) => item.group_id).filter((elem, index, self) => index === self.indexOf(elem)).sort()
                var detail_group = []
                group_id.forEach((item) => {
                    var user_list = rows.filter((user) => user.group_id === item)
                    detail_group.push({
                        group_id: item,
                        user_list: user_list
                    })
                })
                res.send(detail_group)
                conn.release();
            });
    })
});
////////////////////////////////////////////////////////////
// เช็คข้อมูลด้วยเบอร์โทรศัพท์ (mem_tel )
router.get('/check_member/:mem_tel', cors(corsOptions), function(req, res) {
    pool.getConnection(function(err, conn) {
        conn.query('SELECT * FROM member WHERE mem_tel = ?', [req.params.mem_tel],
            function(err, rows, fields) {
                if (err) throw (err);
                res.send(rows)
                conn.release();
            });
    })
});
module.exports = router
