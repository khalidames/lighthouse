/**
Copyright (c) 2015 The Chromium Authors. All rights reserved.
Use of this source code is governed by a BSD-style license that can be
found in the LICENSE file.
**/

require("../../base/guid.js");
require("../../base/range_utils.js");
require("../../core/auditor.js");
require("./android_app.js");
require("./android_surface_flinger.js");

'use strict';

/**
 * @fileoverview Class for managing android-specific model meta data,
 * such as rendering apps, frames rendered, and SurfaceFlinger.
 */
global.tr.exportTo('tr.model.helpers', function() {
  var AndroidApp = tr.model.helpers.AndroidApp;
  var AndroidSurfaceFlinger = tr.model.helpers.AndroidSurfaceFlinger;

  var IMPORTANT_SURFACE_FLINGER_SLICES = {
    'doComposition' : true,
    'updateTexImage' : true,
    'postFramebuffer' : true
  };
  var IMPORTANT_UI_THREAD_SLICES = {
    'Choreographer#doFrame' : true,
    'performTraversals' : true,
    'deliverInputEvent' : true
  };
  var IMPORTANT_RENDER_THREAD_SLICES = {
    'doFrame' : true
  };

  function iterateImportantThreadSlices(thread, important, callback) {
    if (!thread)
      return;

    thread.sliceGroup.slices.forEach(function(slice) {
      if (slice.title in important)
        callback(slice);
    });
  }

  /**
   * Model for Android-specific data.
   * @constructor
   */
  function AndroidModelHelper(model) {
    this.model = model;
    this.apps = [];
    this.surfaceFlinger = undefined;

    var processes = model.getAllProcesses();
    for (var i = 0; i < processes.length && !this.surfaceFlinger; i++) {
      this.surfaceFlinger =
          AndroidSurfaceFlinger.createForProcessIfPossible(processes[i]);
    }

    model.getAllProcesses().forEach(function(process) {
      var app = AndroidApp.createForProcessIfPossible(
          process, this.surfaceFlinger);
      if (app)
        this.apps.push(app);
    }, this);
  };

  AndroidModelHelper.guid = tr.b.GUID.allocateSimple();

  AndroidModelHelper.supportsModel = function(model) {
    return true;
  };

  AndroidModelHelper.prototype = {
    iterateImportantSlices: function(callback) {
      if (this.surfaceFlinger) {
        iterateImportantThreadSlices(
            this.surfaceFlinger.thread,
            IMPORTANT_SURFACE_FLINGER_SLICES,
            callback);
      }

      this.apps.forEach(function(app) {
        iterateImportantThreadSlices(
            app.uiThread,
            IMPORTANT_UI_THREAD_SLICES,
            callback);
        iterateImportantThreadSlices(
            app.renderThread,
            IMPORTANT_RENDER_THREAD_SLICES,
            callback);
      });
    }
  };

  return {
    AndroidModelHelper: AndroidModelHelper
  };
});
