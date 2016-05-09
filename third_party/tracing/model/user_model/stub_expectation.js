/**
Copyright (c) 2015 The Chromium Authors. All rights reserved.
Use of this source code is governed by a BSD-style license that can be
found in the LICENSE file.
**/

require("../../core/test_utils.js");
require("./user_expectation.js");

'use strict';

/**
 * @fileoverview Stub version of UserExpectation for testing.
 */
global.tr.exportTo('tr.model.um', function() {
  function StubExpectation(args) {
    this.stageTitle_ = args.stageTitle || 'Idle';
    this.initiatorTitle_ = args.initiatorTitle || '';

    this.title_ = args.title;
    if (!this.title_) {
      var defaultTitle = [];
      if (this.initiatorTitle_)
        defaultTitle.push(this.initiatorTitle_);
      if (this.stageTitle_)
        defaultTitle.push(this.stageTitle_);
      this.title_ = defaultTitle.join(' ') || 'title';
    }

    this.normalizedUserComfort_ = args.normalizedUserComfort || 0;
    this.normalizedEfficiency_ = args.normalizedEfficiency || 0;

    var sd = tr.c.TestUtils.getStartAndDurationFromDict(args);

    tr.model.um.UserExpectation.call(
        this, args.parentModel, this.initiatorTitle, sd.start, sd.duration);

    // Must be set after base class call.
    this.colorId_ = args.colorId || 0;

    if (args.associatedEvents) {
      args.associatedEvents.forEach(function(event) {
        this.associatedEvents.push(event);
      }, this);
    }
  }

  StubExpectation.prototype = {
    __proto__: tr.model.um.UserExpectation.prototype,

    get colorId() {
      return this.colorId_;
    },

    get title() {
      return this.title_;
    },

    get stageTitle() {
      return this.stageTitle_;
    },

    get initiatorTitle() {
      return this.initiatorTitle_;
    }
  };

  return {
    StubExpectation: StubExpectation
  };
});