/*
 * fusion.io
 *
 * Created by Pascal Mathis at 15.09.13
 * License: GPLv3 (Please see LICENSE for more information)
 */

var FusionIO = require('../../lib');

var app = new FusionIO();
app.setRootPath(__dirname);
app.loadConfig('config.js');
app.createApp();