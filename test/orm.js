/**
 * Created by YouHan on 2016/8/18.
 */
var Builder = require('./../src/orm');
var path = require('path');


var builder = new Builder(path.resolve(__dirname + '/pool.js'));

/**
 * insert table
 */
builder.insert('test', [{
  name: 'new name',
  value: 123,
  'create_time': new Date()
}, {
  name: 'new name 2',
  value: 3213
}]).end().then(function (res) {
  console.log(res);
}).then(function (error) {
  console.error(error);
});


/**
 * update test
 */

builder.update('test', {
  name: 'single nam1e'
}).where({
  id: 1
}).end().then(function (res) {
  console.log(res);
}).then(function (error) {
  console.error(error);
});


builder.update('test', {
  name: 'multi update'
}).where({
  id: [5, 2, 3]
}).end().then(function (res) {
  console.log(res);
}).then(function (error) {
  console.error(error);
});


/**
 * delete function
 */
builder.delete('test')
  .where({
    id: [2, 3]
  }).end();

/**
 * select function
 */
builder.select('test')
  .where({
    id: [4, 5, 6]
  }).orderBy(['id desc', 'create_time'])
  .end().then(function (res) {
});

builder.select('test')
  .where().orderBy(['id desc', 'create_time'])
  .groupBy(['name', 'id'])
  .end().then(function (res) {
});

builder.select('test')
  .where().orderBy(['id desc', 'create_time'])
  .end().then(function (res) {
});




