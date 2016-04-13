/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

/* global WebInspector, TimelineModelTreeView */

console.log('Booting dtm');

// establish our sandboxed globals
if (typeof global.window === 'undefined') {
  global.window = global.self = global;
}

// global.WebInspector = global.WebInspector || {};
global.Runtime = global.Runtime || {};
// global.TimelineModelTreeView = global.TimelineModelTreeView || {};
global.TreeElement = global.TreeElement || {};
global.WorkerRuntime = global.WorkerRuntime || {};
// global.Protocol = global.Protocol || {};
global.insertionIndexForObjectInListSortedByFunction =
    function(object, list, comparator, insertionIndexAfter) {
      if (insertionIndexAfter) {
        return list.upperBound(object, comparator);
      }

      return list.lowerBound(object, comparator);
    };

// polyfills
require('devtools-timeline-model/lib/api-stubs.js');

// chrome devtools frontend
// require('chrome-devtools-frontend/front_end/common/Object.js');
require('chrome-devtools-frontend/front_end/common/SegmentedRange.js');
// require('chrome-devtools-frontend/front_end/platform/utilities.js');
// require('chrome-devtools-frontend/front_end/sdk/Target.js');
require('chrome-devtools-frontend/front_end/bindings/TempFile.js');
require('chrome-devtools-frontend/front_end/sdk/TracingModel.js');
require('chrome-devtools-frontend/front_end/timeline/TimelineJSProfile.js');
require('chrome-devtools-frontend/front_end/timeline/TimelineUIUtils.js');
require('chrome-devtools-frontend/front_end/sdk/CPUProfileDataModel.js');
require('chrome-devtools-frontend/front_end/timeline/LayerTreeModel.js');
require('chrome-devtools-frontend/front_end/timeline/TimelineModel.js');
require('chrome-devtools-frontend/front_end/timeline/TimelineTreeView.js');
require('chrome-devtools-frontend/front_end/ui_lazy/SortableDataGrid.js');
require('chrome-devtools-frontend/front_end/timeline/TimelineProfileTree.js');
require('chrome-devtools-frontend/front_end/components_lazy/FilmStripModel.js');
require('chrome-devtools-frontend/front_end/timeline/TimelineIRModel.js');
require('chrome-devtools-frontend/front_end/timeline/TimelineFrameModel.js');

// minor configurations
require('devtools-timeline-model/lib/devtools-monkeypatches.js');
// polyfill the bottom-up and topdown tree sorting
require('devtools-timeline-model/lib/timeline-model-treeview.js');

class SandboxedModel {

  constructor(events) {
    this.WI = WebInspector;
    this.init(events);
  }

  init(events) {
    // (devtools) tracing model
    this._tracingModel =
        new WebInspector.TracingModel(new WebInspector.TempFileBackingStorage('tracing'));
    // timeline model
    this._timelineModel =
        new WebInspector.TimelineModel(WebInspector.TimelineUIUtils.visibleEventsFilter());

    // populate with events
    this._tracingModel.reset();
    this._tracingModel.addEvents(typeof events === 'string' ? JSON.parse(events) : events);
    this._tracingModel.tracingComplete();
    this._timelineModel.setEvents(this._tracingModel);

    this._aggregator = new WebInspector.TimelineAggregator(event => {
      return WebInspector.TimelineUIUtils.eventStyle(event).category.name;
    });

    return this;
  }

  timelineModel() {
    return this._timelineModel;
  }

  tracingModel() {
    return this._tracingModel;
  }

  topDown() {
    var filters = [];
    filters.push(WebInspector.TimelineUIUtils.visibleEventsFilter());
    filters.push(new WebInspector.ExcludeTopLevelFilter());
    var nonessentialEvents = [
      WebInspector.TimelineModel.RecordType.EventDispatch,
      WebInspector.TimelineModel.RecordType.FunctionCall,
      WebInspector.TimelineModel.RecordType.TimerFire
    ];
    filters.push(new WebInspector.ExclusiveNameFilter(nonessentialEvents));

    return WebInspector.TimelineProfileTree.buildTopDown(this._timelineModel.mainThreadEvents(),
        filters, /* startTime */ 0, /* endTime */ Infinity,
        WebInspector.TimelineAggregator.eventId);
  }

  bottomUp() {
    var topDown = this.topDown();
    var noGrouping = WebInspector.TimelineAggregator.GroupBy.None;
    var noGroupAggregator = this._aggregator.groupFunction(noGrouping);
    return WebInspector.TimelineProfileTree.buildBottomUp(topDown, noGroupAggregator);
  }

  // @ returns a grouped and sorted tree
  bottomUpGroupBy(grouping) {
    var topDown = this.topDown();

    // One of: None Category Subdomain Domain URL
    var groupSetting = WebInspector.TimelineAggregator.GroupBy[grouping];
    var groupingAggregator = this._aggregator.groupFunction(groupSetting);
    var bottomUpGrouped =
        WebInspector.TimelineProfileTree.buildBottomUp(topDown, groupingAggregator);

    // sort the grouped tree, in-place
    new TimelineModelTreeView(bottomUpGrouped).sortingChanged('self', 'desc');
    return bottomUpGrouped;
  }

  frameModel() {
    var frameModel = new WebInspector.TracingTimelineFrameModel();
    frameModel.addTraceEvents({ /* target */ },
      this._timelineModel.inspectedTargetEvents(), this._timelineModel.sessionId() || '');
    return frameModel;
  }

  filmStripModel() {
    return new WebInspector.FilmStripModel(this._tracingModel);
  }

  interactionModel() {
    var irModel = new WebInspector.TimelineIRModel();
    irModel.populate(this._timelineModel);
    return irModel;
  }

}

module.exports = SandboxedModel;