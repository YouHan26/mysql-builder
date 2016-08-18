/**
 * Created by YouHan on 2016/8/16.
 */
var mysql = require('mysql');
var utils = require('./utils');

var _options;
var _pool;

var selectClause = []; //dateSet
var limitClause;
var orderByClause;
var groupByClause;
var whereClause = {};    // key : value
var insertClause;   // dateSet
var updateClause;   // {key : value}
var clause;
var table;          //TODO trap 多线程？
var valid = true;
var validReason = '';
var separator = ' ';

var builder = function (setting) {
    var that = this;

    // this._init();

    if (typeof setting == 'string') {
        _options = require(setting);
    } else if (typeof setting == 'object') {
        _options = setting;
    }

    if (_options) {
        _pool = mysql.createPool(_options);
    }

    /**
     * @example
     * .insert('table', {key : value, key :value})
     * @returns {builder}
     */
    this.insert = function (tableName, dataSet) {
        clause = 'insert';
        if (typeof  tableName === 'string' && typeof dataSet === 'object') {
            table = tableName;
            if (utils.isArray(dataSet)) {
                insertClause = dataSet;
            } else {
                insertClause = [dataSet];
            }
        } else {
            valid = false;
            validReason = 'insert table or data set invalid';
        }
        return that;
    };

    /**
     * @example
     * .delete('table')
     * @param tableName
     * @param cb
     * @returns {builder}
     */
    this.delete = function (tableName, cb) {
        clause = 'delete';
        if (typeof tableName === 'string') {
            table = tableName;
        }
        return that;
    };

    /**
     * @example
     *  .select(table, 'id, name as tt')
     *  .select(table, ['id', 'value'])
     * @param selectSet
     * @returns {builder}
     */
    this.select = function (tableName, selectSet) {
        clause = 'select';
        table = tableName;
        if (typeof selectSet == 'string') {
            selectClause.push(selectSet);
        } else if (utils.isArray(selectSet)) {
            for (var i = 0, ii = selectSet.length; i < ii; i++) {
                selectClause.push(_escapeId(selectSet[i]));
            }
        }
        return that;
    };

    /**
     * @example
     * .update('table', {key : value})
     * @returns {builder}
     */
    this.update = function (tableName, dataSet) {
        clause = 'update';
        if (typeof tableName === 'string' && typeof dataSet === 'object') {
            table = tableName;
            updateClause = dataSet;
        }
        return that;
    };

    /**
     * @example
     * .where('filed is null')
     * .where({
     *      key : value
     * }, {
     *      key : [value]
     * })
     * @param set
     * @returns {builder}
     */
    this.where = function (set) {
        if (typeof set === 'string') {
            whereClause[set] = null;
        } else if (typeof set === 'object') {
            for (var i in set) {
                if (set.hasOwnProperty(i)) {
                    whereClause[i] = set[i];
                }
            }
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


    this.orderBy = function (set) {
        orderByClause = comma_separated_arguments(set);
        return that;
    };

    this.end = function () {
        var sql = _generSql();
        _resetStatus();
        return _runQuery(sql);
    };

    return that;
};

var generator = {
    _generinsert: function () {
        // (name, age) VALUES('姚明',25),('麦蒂',25)
        var result = '';
        if (insertClause && insertClause.length > 0) {
            var obj = insertClause[0];
            result += ' (';
            for (var key in  obj) {
                if (obj.hasOwnProperty(key)) {
                    result += _escapeId(key) + ',';
                }
            }
            result = result.substr(0, result.length - 1);
            result += ' ) values ';
            for (var i = 0, ii = insertClause.length; i < ii; i++) {
                var item = insertClause[i];
                result += ' (';
                for (var key in  obj) {
                    if (obj.hasOwnProperty(key)) {
                        result += _escape(item[key]) + ' , ';
                    }
                }
                result = result.substr(0, result.length - 2);
                if (i < ii - 1) {
                    result += ' ), ';
                } else {
                    result += ' ) ';
                }
            }
        }
        return result;
    },
    _generdelete: function () {
        return '';
    },
    _generselect: function () {
        //need gener 'from table'
        var result = '';
        if (selectClause) {
            if (selectClause.length == 0) {
                result += ' * ';
            } else if (selectClause.length >= 0) {
                result += selectClause.join(',');
            }
            result += ' FROM' + _escapeId(table);
        }
        return result;
    },
    _generupdate: function () {
        var result = '';
        if (typeof updateClause === 'object') {
            for (var key in updateClause) {
                if (updateClause.hasOwnProperty(key)) {
                    var value = updateClause[key];
                    if (utils.isArray(value)) {
                        for (var i = 0, ii = value.length; i < ii; i++) {
                            //TODO array
                        }
                    } else {
                        result += _escapeId(key) + '=' + _escape(updateClause[key]) + ',';
                    }
                }
            }
            result = result.substr(0, result.lastIndexOf(","))
        }
        return result;
    }
};

function _generSql() {
    var result = '';
    if (table && clause) {
        result += _getPrefix(clause, table);
        result += generator['_gener' + clause]();
        result += _getWhereClause();
        result += _getLimitClause();
        result += _getGroupByClause();
        result += _getOrderByClause();
        return result;
    }
}

function _getGroupByClause() {
    return groupByClause !== undefined ? ' GROUP BY ' + groupByClause : ''
}

function _getOrderByClause() {
    return orderByClause !== undefined ? ' ORDER BY ' + orderByClause : ''
}

function _getPrefix(clause, table) {
    if (clause === 'delete') {
        return 'DELETE FROM ' + _escapeId(table);
    } else if (clause === 'insert') {
        return 'INSERT INTO ' + _escapeId(table);
    } else if (clause === 'select') {
        return 'SELECT'
    } else if (clause == 'update') {
        return 'UPDATE ' + _escapeId(table) + ' SET ';
    }
}

function _getLimitClause() {
    return limitClause !== undefined ? ' LIMIT ' + limitClause : '';
}

function _getWhereClause() {
    var result = '';
    if (!utils.isEmptyObj(whereClause)) {
        result += ' Where ';
        for (var i in whereClause) {
            if (whereClause.hasOwnProperty(i)) {
                var key = i,
                    value = whereClause[i];
                if (value && utils.isArray(value)) {
                    result += separator + _escapeId(key) + ' in ( ';
                    for (var i = 0, ii = value.length; i < ii; i++) {
                        result += _escape(value[i]) + ',';
                    }
                    result = result.substr(0, result.lastIndexOf(','));
                    result += separator + ' ) ';
                } else if (value) {
                    result += separator + _escapeId(key) + '=' + _escape(value) + separator;
                } else {
                    result += key;
                }
                result += ' AND ';
            }
            result = result.substr(0, result.length - 4);
        }
    }
    return result;
}

function comma_separated_arguments(set) {
    var clause = '';
    if (utils.isArray(set)) {
        for (var i = 0, ii = set.length; i < ii; i++) {
            // set[i] = _escapeId(set[i]);
            //TODO escape column name for raw sql
            set[i] = set[i];
        }
        clause = set.join(' , ');
    } else if (typeof set === 'string') {
        clause = set;
    }
    return clause;
}

function _escapeId(value) {
    return mysql.escapeId(value);
}

function _escape(value) {
    return mysql.escape(value);
}

function _resetStatus() {
    selectClause = []; //dateSet
    limitClause = undefined;
    orderByClause = undefined;
    groupByClause = undefined;
    whereClause = {};
    insertClause = undefined;
    updateClause = undefined;
    clause = undefined;
    table = undefined;
    valid = true;
    validReason = '';
}

function _runQuery(sql) {
    return new Promise(function (resolver, rejector) {
        if (sql) {
            _pool.getConnection(function (err, conn) {
                if (err) {
                    console.error(err);
                    rejector('err happen when get conn');
                    throw err;
                }
                console.log('------------', sql, '--------------');
                conn.query(sql, function (err, rows) {
                    if (err) {
                        console.error(err);
                        rejector(error);
                        throw err;
                    }
                    resolver(rows);
                    conn.release();
                });
            });
        } else {
            var msg = 'no valid sql';
            console.error(msg);
            rejector(msg);
        }
    });
}

function _resetPool(cb) {
    _pool.end(cb);
}

module.exports = builder;