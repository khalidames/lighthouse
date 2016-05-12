/**
 * @license
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const Aggregate = require('../aggregate');

/** @type {string} */
const CriticalNetworkChains =
    require('../../audits/performance/critical-network-chains').name;

class PerformanceMetrics extends Aggregate {

  /**
   * @override
   * @return {string}
   */
  static get name() {
    return 'Performance Metrics';
  }

  /**
   * @override
   * @return {string}
   */
  static get description() {
    return '';
  }

  /**
   * @override
   * @return {!AggregationType}
   */
  static get type() {
    return Aggregate.TYPES.PERFORMANCE_METRICS;
  }

  /**
   * @override
   * @return {!AggregationCriteria}
   */
  static get criteria() {
    const criteria = {};
    criteria[CriticalNetworkChains] = {
      value: 0,
      weight: 1
    };

    return criteria;
  }
}

module.exports = PerformanceMetrics;
