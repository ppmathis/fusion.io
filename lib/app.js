/*
 * fusion.io
 *
 * Created by Pascal Mathis at 15.09.13
 * License: GPLv3 (Please see LICENSE for more information)
 */

//noinspection ThisExpressionReferencesGlobalObjectJS
(function() {
    var path = require('path');
    var fs = require('fs');
    var util = require('util');
    var events = require('events');
    var FusionError = require('./error');
    var FusionHelpers = require('./helpers');
    var existsSync = fs.existsSync || path.existsSync;

    var FusionApp = (function() {
        /**
         * Creates a new fusion.io based application.
         * This constructor should only be called by the fusion.io
         * core.
         *
         * @param {String} rootPath Root path to the application
         * @param {Object} configuration Configuration object
         * @constructor
         */
        function FusionApp(rootPath, configuration) {
            this._rootPath = rootPath;
            this._config = configuration;

            this._services = {};
            // TODO Add destructors - this._destructors = [];
            this._resolvePluginConfig();
            this._checkPluginConfig();
            this._pluginQueue = this._resolvePluginDependencies();

            // createApp() should have some time to subscribe to the 'ready' event
            process.nextTick(FusionHelpers.scopeFunction(this, this._startFusion));
        }

        // Inherit FusionApp from events.EventEmitter
        FusionApp.prototype = Object.create(events.EventEmitter.prototype, { constructor: { value: FusionApp }});

        /**
         * Resolves all configured plugins, by loading their
         * metadata and initializing their factories.
         *
         * @throws {FusionError} There needs to be at least one plugin configured
         */
        FusionApp.prototype._resolvePluginConfig = function resolvePluginConfig() {
            var self = this;

            // Every fusionio app needs to have at least one plugin loaded, otherwise
            // it wouldn't do anything. So check if there's at least one plugin configured.
            if(!this._config || this._config.length < 1) {
                throw new FusionError('Slow down! It\'s great that you are so enthusiastic about using fusion.io, but ' +
                    'you need to specify some plugins in the configuration file before - ' +
                    'otherwise it won\'t do anything at all!')
            }

            // Loop through all configured plugins and resolve their dependencies
            this._config.forEach(function(pluginConfig, key) {
                // Instead of specifying an empty configuration, you can also just specify the plugin name
                if(typeof pluginConfig === 'string') {
                    pluginConfig = self._config[key] = { pluginName: pluginConfig }
                }

                // We need to load the plugin to use it, if it wasn't loaded before.
                if(pluginConfig.hasOwnProperty('pluginName') && !pluginConfig.hasOwnProperty('pluginFactory')) {
                    var metadata = self._resolvePlugin(self._rootPath, pluginConfig.pluginName);
                    Object.keys(metadata).forEach(function(key) {
                        if(!pluginConfig.hasOwnProperty(key)) pluginConfig[key] = metadata[key];
                    });
                    pluginConfig.pluginFactory = require(pluginConfig.pluginPath);
                }
            });
        };

        /**
         * Resolves a plugin based on its plugin name, relative a folder called 'plugins'
         * at the basePath. It will try to load the plugin metadata and returns it.
         *
         * @param {String} basePath Root path to the main application folder
         * @param {String} pluginName Name of the plugin (scope + name)
         * @throws {FusionError} Plugin name needs to be valid (exactly one scope)
         * @throws {FusionError} Each package needs to provide metadata (package.json)
         * @returns {Object} Plugin meta data
         */
        FusionApp.prototype._resolvePlugin = function resolvePlugin(basePath, pluginName) {
            // Lookup plugin folder
            basePath = path.join(basePath, 'plugins');  // Search in the 'plugins' folder, relative to the base path
            var pluginPath = path.resolve(basePath, pluginName);  // Search for scope in 'plugins' folder

            // Check if plugin folder exists
            if(!existsSync(pluginPath) || !fs.statSync(pluginPath).isDirectory()) {
                throw new FusionError('Plugin path not found: ' + pluginPath);
            }

            // Try to load package.json if it exists
            var pluginMetadataPath = path.join(pluginPath, 'package.json');
            try {
                // Extract useful metadata from package.json
                var pluginMetadata = {};
                var pluginRawMetadata = require(pluginMetadataPath)['fusionio'] || {};
                pluginMetadata.pluginPath = pluginPath;
                pluginMetadata.pluginImports = [];
                pluginMetadata.pluginExports = [];

                // Resolve service names to full-qualified service names
                (pluginRawMetadata.imports || []).forEach(function(serviceName) {
                    pluginMetadata.pluginImports.push(serviceName);
                });
                (pluginRawMetadata.exports || []).forEach(function(serviceName) {
                    pluginMetadata.pluginExports.push(serviceName);
                });
            } catch(err) {
                console.error(err.toString());
                throw new FusionError('Could not load metadata of plugin: ' + pluginName);
            }

            return pluginMetadata || {};
        };

        /**
         * Checks the 'configuration', or to be more specific, it fusion.io
         * successfully resolved all configured plugins. Each plugin should have
         * a set of required keys, and if one of them is missing, it will throw
         * an error.
         *
         * @throws {FusionError} Plugin needs to have a 'factory' function
         * @throws {FusionError} Plugin needs to have a 'exports' array
         * @throws {FusionError} Plugin needs to have a 'imports' array
         */
        FusionApp.prototype._checkPluginConfig = function checkPluginConfig() {
            // Check if every plugin has its required fields
            this._config.forEach(function(plugin) {
                if(!plugin.hasOwnProperty('pluginFactory')) {
                    throw new FusionError('Plugin is missing the pluginFactory function: ' + JSON.stringify(plugin));
                }
                if(!plugin.hasOwnProperty('pluginExports')) {
                    throw new FusionError('Plugin is missing the pluginExports array: ' + JSON.stringify(plugin));
                }
                if(!plugin.hasOwnProperty('pluginImports')) {
                    throw new FusionError('Plugin is missing the pluginImports array: ' + JSON.stringify(plugin));
                }
            });
        };

        /**
         * Returns a sorted list in which order the plugins should be loaded, to fulfill
         * all required dependencies.
         * TODO: Maybe add auto-loading to the dependency resolver
         *
         * @returns {Array} Sorted array of plugins
         */
        FusionApp.prototype._resolvePluginDependencies = function resolvePluginDependencies() {
            var self = this;
            var unsortedPlugins = [];
            var sortedPlugins = [];
            var resolvedServices = {};
            var changed = true;

            // Populate array of unsorted plugins
            this._config.forEach(function(pluginConfig, key) {
                unsortedPlugins.push({
                    pluginName: pluginConfig.pluginName,
                    pluginScope: pluginConfig.pluginScope,
                    imports: pluginConfig.pluginImports.concat(),   // Provides a copy of 'pluginImports',
                    exports: pluginConfig.pluginExports.concat(),   // Provides a copy of 'pluginExports',
                    key: key    // Position in configuration array
                });
            });

            // Resolve all dependencies until there are no plugins left or a 'round'
            // ended without any results (which means that they are still unresolved dependencies,
            // but they can't be resolved any further...)
            while(unsortedPlugins.length && changed) {
                changed = false;

                unsortedPlugins.concat().forEach(function(plugin) {
                    var imports = plugin.imports.concat();  // Provides a copy of 'imports'

                    // Check if all imports are already resolved
                    var resolvedAll = true;
                    for(var i = 0; i < imports.length; i++) {
                        if(!resolvedServices[imports[i]]) {
                            resolvedAll = false;
                        } else {
                            plugin.imports.splice(plugin.imports.indexOf(imports[i]), 1);
                        }
                    }

                    // If not all plugin dependencies could be resolved, check next plugin
                    if(!resolvedAll)
                        return;

                    // Remove plugin from unsorted plugins and add to sorted plugins
                    // Also mark all exported services as 'resolved'
                    unsortedPlugins.splice(unsortedPlugins.indexOf(plugin), 1);
                    plugin.exports.forEach(function(serviceName) {
                        resolvedServices[serviceName] = true;
                    });
                    sortedPlugins.push(self._config[plugin.key]);
                    changed = true;
                });
            }

            // Check if there are still some unresolved plugin dependencies
            if(unsortedPlugins.length) {
                var unresolvedServices = {};

                // Go through all unsorted plugins, grab their dependencies
                // and mark them as unresolved. Then go again through all
                // unsorted plugins and mark their exports as resolved.
                unsortedPlugins.forEach(function(plugin) {
                    plugin.imports.forEach(function(serviceName) {
                        if(unresolvedServices[serviceName] == false)
                            return;
                        if(!unresolvedServices[serviceName])
                            unresolvedServices[serviceName] = [];
                        unresolvedServices[serviceName].push(plugin.pluginName);
                    });
                    plugin.exports.forEach(function(serviceName) {
                        unresolvedServices[serviceName] = false;
                    });
                });

                // Remove 'unresolved services' which could have been resolved by
                // other unresolved plugins.
                Object.keys(unresolvedServices).forEach(function(serviceName) {
                    if(unresolvedServices[serviceName] == false)
                        delete unresolvedServices[serviceName];
                });

                // Grab only unresolved plugin names and not their whole config
                var unsortedPluginNames = [];
                unsortedPlugins.forEach(function(plugin) {
                    unsortedPluginNames.push(plugin.pluginName);
                });

                // Print unresolved dependencies
                console.error('Could not resolve dependencies of these plugins:', unsortedPluginNames);
                console.error('Resolved services: ', Object.keys(resolvedServices));
                console.error('Missing services: ', unresolvedServices);
                throw new FusionError('Could not resolve all dependencies.');
            }

            return sortedPlugins;
        };

        /**
         * Starts the chain-reaction by loading all the plugins in their
         * correct order. After this function has completed, the application
         * should be up and running.
         */
        FusionApp.prototype._startFusion = function startFusion() {
            var self = this;

            // Fetch the next plugin from the queue and emit the 'ready' event if there are no plugins left
            var plugin = this._pluginQueue.shift();
            if(!plugin) {
                self.emit('ready', this);
                return;
            }

            // Populate the 'imports' list of the plugin with service instances
            var imports = {};
            if(plugin.pluginImports) {
                plugin.pluginImports.forEach(function(serviceName) {
                    imports[serviceName] = self._services[serviceName];
                });
            }

            // Try to execute the 'pluginFactory' function
            try {
                plugin.pluginFactory(plugin, imports, registerExports);
            } catch(err) {
                this.emit('error', err);
            }

            /**
             * Registers the exports for a plugin. This function gets called by the plugin
             * factory. Remember, if any plugin does -not- call registerExports(), the whole
             * process will hang because it works asynchronous.
             *
             * @param err Did any error occur while initializing the plugin?
             * @param exports All the exports the plugin provides
             */
            function registerExports(err, exports) {
                // If an error occured, shutdown the 'fusion reactor' and exit the application
                if(err) {
                    self.emit('error', err);
                    return;
                }

                // Check if each plugin provides all services specified in its metadata
                plugin.pluginExports.forEach(function(serviceName) {
                    if(!exports.hasOwnProperty(serviceName)) {
                        var err = new FusionError('Plugin failed to provide ' + serviceName + ' service. ' + JSON.stringify(plugin));
                        self.emit('error', err);
                        return;
                    }
                    self._services[serviceName] = exports[serviceName];

                    // TODO Support other types than only function, like objects & arrays
                    self.emit('plugin', plugin);
                    self._startFusion();
                });
            }
        };

        return FusionApp;
    })();

    // Exports the module
    //noinspection JSUnusedLocalSymbols
    var exports = module.exports = FusionApp;
}).call(this);