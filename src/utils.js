/**
 * Created by YouHan on 2016/8/16.
 */

var utils = {
    trim: function (str) {
        return String.prototype.trim.call(str);
    },
    isArray: function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    },
    isEmptyObj: function (obj) {
        if (typeof  obj !== 'object') {
            return false;
        }
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                return false;
            }
        }
        return true;
    },
    isObject : function(obj){
        return typeof obj === 'object';
    }
};

module.exports = utils;