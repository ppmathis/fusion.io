/*
 * fusion.io
 *
 * Created by Pascal Mathis at 15.09.13
 * License: GPLv3 (Please see LICENSE for more information)
 */

(function() {
    function FusionPlugin(options, imports, exports) {
        var _memoryStorage = {
            posts: [
                { title: 'fusion.io rocks', text: 'Every application is just a bunch of plugins. That\'s fascinating, isn\'t it?!' },
                { title: 'Facts about fusion.io', text: 'Everything is a plugin and they can rely on each other by importing or exporting services.' },
                { title: 'Advantages from fusion.io', text: 'Easily swap modules to achieve similiar functions, easily test independent modules and much more!'},
                { title: 'Pro tips', text: 'You can create a plugin which allows to easily interact between plugins with an EventEmitter.' }
            ]
        };

        exports(null, {
            database: {
                /**
                 * Gets the specified key from the in-memory database
                 *
                 * @param {String} key Key to fetch from database
                 * @param {Function} callback Callback function with signature: function(value)
                 */
                get: function get(key, callback) {
                    callback(_memoryStorage[key]);
                },

                /**
                 * Puts the specified key into the in-memory database.
                 * Existing keys will be overwritten.
                 *
                 * @param {String} key Key to modify in database
                 * @param {*} value Value to put into database
                 * @param {Function} callback Callback function with signature: function()
                 */
                put: function put(key, value, callback) {
                    _memoryStorage[key] = value;
                    callback();
                },

                /**
                 * Deletes the specified key in the in-memory database.
                 *
                 * @param {String} key Key to delete in database
                 * @param {Function} callback Callback function with signature: function()
                 */
                del: function del(key, callback) {
                    delete _memoryStorage[key];
                    callback();
                },

                /**
                 * Returns all keys in the in-memory database
                 * to the given callback function.
                 *
                 * @param {Function} callback Callback function with signature: function(keys)
                 */
                keys: function keys(callback) {
                    callback(Object.keys(_memoryStorage));
                }
            }
        });
    }

    // Exports the plugin
    var exports = module.exports = FusionPlugin;
}).call(this);