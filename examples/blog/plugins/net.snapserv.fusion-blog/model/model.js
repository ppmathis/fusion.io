/*
 * fusion.io
 *
 * Created by Pascal Mathis at 15.09.13
 * License: GPLv3 (Please see LICENSE for more information)
 */

(function() {
    function FusionPlugin(options, imports, exports) {
        exports(null, {
            model: {
                /** Post model **/
                post: {
                    /**
                     * Returns a list of all available posts
                     *
                     * @param {Function} callback Callback function with signature: function(posts)
                     */
                    getPosts: function(callback) {
                        imports.db.get('posts', function(posts) {
                            callback(posts);
                        });
                    },

                    getPost: function(post, callback) {
                        imports.db.get('posts', function(posts) {
                            callback(posts[post]);
                        });
                    }
                }
            }
        });
    }

    // Exports the plugin
    var exports = module.exports = FusionPlugin;
}).call(this);