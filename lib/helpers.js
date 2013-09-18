/*
 * fusion.io
 *
 * Created by Pascal Mathis at 15.09.13
 * License: GPLv3 (Please see LICENSE for more information)
 */

//noinspection ThisExpressionReferencesGlobalObjectJS
(function() {
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
                if(args.hasOwnProperty(arrayKey)) {
                    srcObj = args[arrayKey];
                    for(var propertyKey in srcObj) {
                        if(srcObj.hasOwnProperty(propertyKey))
                            dstObj[propertyKey] = srcObj[propertyKey];
                    }
                }
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

        return FusionHelpers;
    })();

    // Exports the module
    //noinspection JSUnusedLocalSymbols
    var exports = module.exports = FusionHelpers;
}).call(this);