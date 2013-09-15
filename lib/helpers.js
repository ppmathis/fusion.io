/*
 * fusion.io
 *
 * Created by Pascal Mathis at 15.09.13
 * License: GPLv3 (Please see LICENSE for more information)
 */

(function() {
    var FusionError = require('./error');

    var FusionHelpers = (function() {
        /**
         * Shouldn't do anything, because it is a utility class with static methods
         * @constructor
         */
        function FusionHelpers() {}

        /**
         * Merges one or more source objects with a given destination object.
         * This is for example useful for merging multiple configurations together.
         * It will -not- copy prototypes.
         *
         * @param {Object} dstObj Destination object
         * @param {...Object} srcObj One or more source objects
         * @returns {Object} Destination object with merged properties
         */
        FusionHelpers.mergeObjects = function mergeObjects(dstObj, srcObj) {
            var args = Array.prototype.slice.call(arguments);
            args.unshift();     // Remove dstObj from arguments stack

            for(var arrayKey in args) {
                srcObj = args[arrayKey];
                for(var propertyKey in srcObj) dstObj[propertyKey] = srcObj[propertyKey];
            }

            return dstObj;
        };


        /**
         * Creates a wrapper for a function to modify the
         * function scope. Can be useful for callbacks inside
         * classes.
         *
         * @param {Object} scope Scope in which the function gets called
         * @param {Function} fn Function to call
         * @returns {Function} Wrapper function
         */
        FusionHelpers.scopeFunction = function(scope, fn) {
            return (function() {
                fn.apply(scope, arguments);
            });
        };

        /**
         * Resolves a service name to a full-qualified name based on the plugin scope.
         * For example, the following transformation would be done if 'pluginScope'
         * equals to 'net.snapserv.fusion-blog':
         *
         *      db => net.snapserv.fusion-blog/db
         *
         * @param {String} pluginScope Plugin scope
         * @param {String} serviceName Service name
         * @returns {String} Full-qualified service name
         */
        FusionHelpers.resolveService = function resolveService(pluginScope, serviceName) {
            if(serviceName.match(/\//g) && serviceName.match(/\//g).length === 1) {
                return serviceName;
            } else if(serviceName.indexOf('/') === -1) {
                return pluginScope + '/' + serviceName;
            } else {
                throw new FusionError('Invalid service name: ' + serviceName + '. Service name can not have more scopes than one.');
            }
        };

        return FusionHelpers;
    })();

    // Exports the module
    var exports = module.exports = FusionHelpers;
}).call(this);