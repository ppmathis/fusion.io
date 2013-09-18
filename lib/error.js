/*
 * fusion.io
 *
 * Created by Pascal Mathis at 15.09.13
 * License: GPLv3 (Please see LICENSE for more information)
 */

//noinspection ThisExpressionReferencesGlobalObjectJS
(function() {
    var util = require('util');

    var FusionError = (function() {
        /**
         * This custom error is made only for use within fusion.io.
         * If an error occurs in fusion.io, it will always throw a
         * FusionError.
         *
         * @param {String} message Error description
         * @param {Object} constructor Constructor property to clean up the output
         * @extends Error
         * @constructor
         */
        function FusionError(message, constructor) {
            Error.captureStackTrace(this, constructor || this);
            this.message = message || 'Error';
        }

        // FusionError inherits from Error
        util.inherits(FusionError, Error);
        FusionError.prototype.name = 'FusionError';

        return FusionError;
    })();

    // Exports the module
    //noinspection JSUnusedLocalSymbols
    var exports = module.exports = FusionError;
}).call(this);