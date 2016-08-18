/**
 * Created by YouHan on 2016/8/18.
 */
var Dao = require('./../src/dao');
var path = require('path');


var dao = new Dao(path.resolve(__dirname + '/db.js'));

/**
 * add
 */
dao.add({
    name: 1,
    value: 2
}, 'test').then(function (res) {
    console.log(res);
});

/**
 * update
 */
dao.update({
    name: 2,
    value: 1,
    id: 13
}, 'test').then(function (res) {
    console.log(res);
});

/**
 * select
 */
dao.get({id: 13}, 'test').then(function (res) {
    console.log(res);
});

/**
 * delete
 */
dao.remove({
    id: 13
}, 'test');