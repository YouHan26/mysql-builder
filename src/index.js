/**
 * Created by YouHan on 2016/8/16.
 */
var mysql = require('mysql');
var utils = require('./utils');

//TODO escape and format
var _options;
var _pool;

var selectClause;
var limitClause;
var orderByClause;
var groupByClause;
var whereClause; // key : value

var builder = function (setting) {
    var that = this;

    this._init();

    if (typeof setting == 'string') {
        _options = require(setting);
    } else if (typeof setting == 'object') {
        _options = setting;
    }

    _getPool();

    this.select = function (selectSet) {
        if (typeof selectSet == 'string') {
            var items = selectSet.split(',');
            for (var i = 0, ii = items.length; i < ii; i++) {
                selectClause.push(utils.trim(items[i]));
            }
        } else if (utils.isArray(selectSet)) {
            for (var i = 0, ii = selectSet.length; i < ii; i++) {
                selectClause.push(utils.trim(selectSet[i]));
            }
        }
        return that;
    };

    this.insert = function () {
        //TODO
        return that;
    };

    this.update = function () {
        //TODO
        return that;
    };
    this.get = function () {
        //TODO
    };

    this.where = function (set) {
        if (typeof set === 'string') {
            whereClause[set] = null;
        } else if (typeof set === 'object') {
            for (var i in set) {
                if (set.hasOwnProperty(i)) {
                    //TODO maybe duplicate
                    whereClause[i] = mysql.escape(set[i]);
                }
            }
        }

        return that;
    };

    this.delete = function (tableName, cb) {
        if (typeof tableName === 'string') {
            var sql = 'DELETE FROM ' + mysql.escape(tableName)
                + _getWhereClause()
                + _getLimitClause();
            _query(sql, cb);
            _resetStatus();
        }
        return that;
    };

    this.limit = function (limit) {
        if (typeof  limit === 'number') {
            limitClause = limit;
        }
        return that;
    };

    this.groupBy = function (set) {
        groupByClause = comma_separated_arguments(set);
        return that;
    };


    this.orderBy = function () {
        orderByClause = comma_separated_arguments(set);
        return that;
    };


    this._end = function (cb) {
        _resetPool(cb);
        _resetStatus();
        //TODO return that
    };

    return that;
};

function _getLimitClause() {
    return limitClause !== -1 ? ' LIMIT ' + limitClause : '';
}

function _getWhereClause() {
    var result = '';
    if (whereClause) {
        for (var i in whereClause) {
            if (whereClause.hasOwnProperty(i)) {
                var key = i,
                    value = whereClause[i];
                //TODO maybe will be trap: 0 or false
                if (value && utils.isArray(value)) {
                    result += mysql.escape(key) + ' in ("' + value.join('", "') + '")';
                } else if (value) {
                    result += mysql.escape(key) + '=' + value;
                } else {
                    //TODO maybe will trap also
                    result += key;
                }
                result += 'AND';
            }
            //remove last separator
            result = result.substr(0, result.length - 3);
        }
    }
    return result;
    // return _buildDataString(whereClause, ' AND ', 'WHERE');
}


function comma_separated_arguments(set) {
    var clause = '';
    if (utils.isArray(set)) {
        clause = set.join(', ');
    } else if (typeof set === 'string') {
        clause = set;
    }
    return clause;
}


function _getPool() {
    if (_options) {
        _pool = mysql.createPool(_options);
    }
}

function _resetStatus() {
    // _pool = null;
    // _options = null;
    selectClause = null;
    limitClause = null;
    orderByClause = null;
    groupByClause = null;
}

function _resetPool(cb) {
    _pool.end(cb);
}

function _query(sql, cb) {
    _pool.getConnections()
}


function _buildDataString(dataSet, separator, clause) {
    //TODO
    // if (!clause) {
    //     clause = 'WHERE';
    // }
    // var queryString = '', y = 1;
    // if (!separator) {
    //     separator = ', ';
    // }
    // var useSeparator = true;
    //
    // var datasetSize = getObjectSize(dataSet);
    //
    // for (var key in dataSet) {
    //     useSeparator = true;
    //
    //     if (dataSet.hasOwnProperty(key)) {
    //         if (clause == 'WHERE' && rawWhereString[key] == true) {
    //             queryString += key;
    //         }
    //         else if (dataSet[key] === null) {
    //             queryString += escapeFieldName(key) + (clause == 'WHERE' ? " is NULL" : "=NULL");
    //         }
    //         else if (typeof dataSet[key] !== 'object') {
    //             queryString += escapeFieldName(key) + "=" + connection.escape(dataSet[key]);
    //         }
    //         else if (typeof dataSet[key] === 'object' && Object.prototype.toString.call(dataSet[key]) === '[object Array]' && dataSet[key].length > 0) {
    //             queryString += escapeFieldName(key) + ' in ("' + dataSet[key].join('", "') + '")';
    //         }
    //         else {
    //             useSeparator = false;
    //             datasetSize = datasetSize - 1;
    //         }
    //
    //         if (y < datasetSize && useSeparator) {
    //             queryString += separator;
    //             y++;
    //         }
    //     }
    // }
    // if (getObjectSize(dataSet) > 0) {
    //     queryString = ' ' + clause + ' ' + queryString;
    // }
    // return queryString;
}

exports.Builder = builder;


//https://github.com/martintajur/node-mysql-activerecord