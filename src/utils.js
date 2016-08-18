/**
 * Created by YouHan on 2016/8/16.
 */

var utils = {
    trim: function (str) {
        return String.prototype.trim.call(str);
    },
    isArray: function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }
};

module.exports = utils;