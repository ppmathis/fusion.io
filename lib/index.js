/*
 * fusion.io
 *
 * Created by Pascal Mathis at 15.09.13
 * License: GPLv3 (Please see LICENSE for more information)
 */

//noinspection ThisExpressionReferencesGlobalObjectJS
(function() {
    var fs = require('fs');
    var path = require('path');
    var FusionApp = require('./app');
    var FusionError = require('./error');

    var FusionIO = (function() {
        /**
         * @constructor
         */
        function FusionIO() {
            this._rootPath = null;
            this._config = {};
        }

        /**
         * Sets the root path of the application, which must be a valid folder.
         * Usually this function should be called with '__dirname' in the application
         * root. This functions uses synchronous I/O to check the given root path,
         * because it is only used during initialization.
         *
         * @param {String} rootPath Valid path to the root folder
         * @throws {FusionError} Root path must be a valid path to a folder
         */
        FusionIO.prototype.setRootPath = function setRootPath(rootPath) {
            // Check if given root path exists
            if(!fs.existsSync(rootPath)) {
                throw new FusionError('Root path \'' + rootPath + '\' does not exist.');
            }

            // Check if given root path is a folder
            if(!fs.statSync(rootPath).isDirectory()) {
                throw new FusionError('Root path \'' + rootPath + '\' is not a folder.');
            }

            this._rootPath = rootPath;
        };

        /**
         * Loads the configuration file for the application. This function can
         * be called more than just once, but the configuration will always
         * be OVERWRITTEN.
         *
         * @param {String} configPath Absolute or relative path to root which points to the configuration file
         * @throws {FusionError} The configuration file needs to exist and should be readable
         */
        FusionIO.prototype.loadConfig = function loadConfig(configPath) {
            // Check if configuration file exists
            var absolutePath = path.resolve(this._rootPath, configPath);
            if(!fs.existsSync(absolutePath)) {
                throw new FusionError('Config file \'' + absolutePath + '\' does not exist.');
            }

            // Try to include configuration file via require()
            this._config = require(absolutePath);
            // TODO: Maybe add later a function which merges multiple arrays together
            // FusionHelpers.mergeObjects(this._config, config);
        };

        /**
         * Creates the application. This will load all plugins, fire them in
         * the correct order and return an event emitter that represents
         * the application. It can emit future events if for example another
         * plugin will be registered.
         *
         * @param {Function} [callback] Callback function with signature: function({Error} err, {Object} app)
         * @returns {Object} Application object
         */
        FusionIO.prototype.createApp = function createApp(callback) {
            // Start fusion
            try {
                var app = new FusionApp(this._rootPath, this._config);
            } catch(err) {
                if(!callback) throw err;
                return callback(err, null);
            }

            // Only register event listeners when a callback was specified
            if(callback) {
                app.on('error', onError);
                app.on('ready', onReady);
            }
            return app;

            // Bunch of event listeners
            function onError(err) { done(err); }
            function onReady() { done(null); }

            function done(err) {
                if(err) app.destroy();
                app.removeListener('error', onError);
                app.removeListener('ready', onReady);
                callback(err, app);
            }
        };

        return FusionIO;
    })();

    // Exports the module
    //noinspection JSUnusedLocalSymbols
    var exports = module.exports = FusionIO;
}).call(this);