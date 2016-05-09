/**
Copyright (c) 2015 The Chromium Authors. All rights reserved.
Use of this source code is governed by a BSD-style license that can be
found in the LICENSE file.
**/

require("./annotation_view.js");

'use strict';

global.tr.exportTo('tr.ui.annotations', function() {
  /**
   * A view of a comment box consisting of a textarea and a line to the
   * actual location.
   * @extends {AnnotationView}
   * @constructor
   */
  function CommentBoxAnnotationView(viewport, annotation) {
    this.viewport_ = viewport;
    this.annotation_ = annotation;
    this.textArea_ = undefined;

    this.styleWidth = 250;
    this.styleHeight = 50;
    this.fontSize = 10;
    this.rightOffset = 50;
    this.topOffset = 25;
  }

  CommentBoxAnnotationView.prototype = {
    __proto__: tr.ui.annotations.AnnotationView.prototype,

    removeTextArea: function() {
      this.textArea_.parentNode.removeChild(this.textArea_);
    },

    draw: function(ctx) {
      var coords = this.annotation_.location.toViewCoordinates(this.viewport_);
      if (coords.viewX < 0) {
        if (this.textArea_)
          this.textArea_.style.visibility = 'hidden';
        return;
      }

      // Set up textarea element.
      if (!this.textArea_) {
        this.textArea_ = document.createElement('textarea');
        this.textArea_.style.position = 'absolute';
        this.textArea_.readOnly = true;
        this.textArea_.value = this.annotation_.text;
        // Set the z-index so that this is shown on top of canvas.
        this.textArea_.style.zIndex = 1;
        ctx.canvas.parentNode.appendChild(this.textArea_);
      }

      this.textArea_.style.width = this.styleWidth + 'px';
      this.textArea_.style.height = this.styleHeight + 'px';
      this.textArea_.style.fontSize = this.fontSize + 'px';
      this.textArea_.style.visibility = 'visible';

      // Update positions to latest coordinate.
      this.textArea_.style.left =
          coords.viewX + ctx.canvas.getBoundingClientRect().left +
          this.rightOffset + 'px';
      this.textArea_.style.top =
          coords.viewY - ctx.canvas.getBoundingClientRect().top -
          this.topOffset + 'px';

      // Draw pointer line from offset to actual location.
      ctx.strokeStyle = 'rgb(0, 0, 0)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      tr.ui.b.drawLine(ctx, coords.viewX,
          coords.viewY - ctx.canvas.getBoundingClientRect().top,
          coords.viewX + this.rightOffset,
          coords.viewY - this.topOffset -
            ctx.canvas.getBoundingClientRect().top);
      ctx.stroke();
    }
  };

  return {
    CommentBoxAnnotationView: CommentBoxAnnotationView
  };
});
