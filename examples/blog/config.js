/*
 * fusion.io
 *
 * Created by Pascal Mathis at 15.09.13
 * License: GPLv3 (Please see LICENSE for more information)
 */

// Because of fusion.io's intelligent dependency resolution, the order doesn't matter at all!
var exports = module.exports = [
    'net.snapserv.fusion-blog/model',
    'net.snapserv.fusion-blog/db',
    'net.snapserv.fusion-blog/blog',

    {
        pluginName: 'net.snapserv.fusion-http/http',
        port: 8080
    }
];