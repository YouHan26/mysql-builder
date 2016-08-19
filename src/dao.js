/**
 * Created by YouHan on 2016/8/18.
 */
var _ = require('lodash');
var builder = require('./orm');
var utils = require('./utils');

/**
 * single table CUDR
 * @returns {dao}
 */
function _getBuilder(options) {
  return new builder(options);
}


var dao = function (options) {
  var that = this;

  var builder = _getBuilder(options);

  this.add = function (obj, tableName) {
    if (utils.isObject(obj) && tableName) {
      return builder.insert(tableName, obj).end();
    }
  };

  /**
   * remove by id
   * @param obj
   * @param tableName
   */
  this.remove = function (obj, tableName) {
    if (utils.isObject(obj) && tableName) {
      return builder.delete(tableName).where({
        id: obj.id
      }).end();
    }
  };

  /**
   * update by id
   * @param obj
   * @param tableName
   */
  this.update = function (obj, tableName) {
    if (utils.isObject(obj) && tableName) {
      return builder.update(tableName, obj).where({
        id: obj.id
      }).end();
    }
    //TODO why
    // return new Promise(function (resolver, rejector) {
    //     this.get(obj, tableName).then(function (data) {
    //         if (utils.isArray(data) && data.length >= 1) {
    //             console.log(data + '________________old data');
    //             var newObj = _.assignIn(data[0], obj);
    //             console.log(newObj, '--------------------new data');
    //             builder.update(tableName, newObj).where({
    //                 id: obj.id
    //             }).end().then(function (res) {
    //                 resolver(res);
    //             }).then(function (error) {
    //                 rejector(error);
    //             });
    //         } else {
    //             rejector('no selected data');
    //         }
    //     }).then(function (error) {
    //         rejector(error);
    //     });
    // });
  };

  this.get = function (obj, tableName) {
    if (utils.isObject(obj) && tableName) {
      return builder.select(tableName)
        .where({
          id: obj.id
        }).end();
    }
  };


  return that;
};


module.exports = dao;