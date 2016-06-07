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

/**
 * Typing externs file for collected output of the artifact gatherers stage.
 * @externs
 */

/**
 * @struct
 * @record
 */
function AggregationCriterion() {}

/** @type {(boolean|number|undefined)} */
AggregationCriterion.prototype.value;

/** @type {number} */
AggregationCriterion.prototype.weight;

/** @type {boolean|undefined} */
AggregationCriterion.prototype.comingSoon;

/** @type {string|undefined} */
AggregationCriterion.prototype.category;

/** @type {string|undefined} */
AggregationCriterion.prototype.description;

/**
 * @typedef {!Object<!AggregationCriterion>}
 */
var AggregationCriteria;

/**
 * @struct
 * @record
 */
function AggregationItem() {}

/** @type {!Array<AggregationCriterion>} */
AggregationItem.prototype.criteria;

/** @type {string} */
AggregationItem.prototype.name;

/** @type {string} */
AggregationItem.prototype.description;

/**
 * @struct
 * @record
 */
function Aggregation() {}

/** @type {string} */
Aggregation.prototype.name;

/** @type {string} */
Aggregation.prototype.description;

/** @type {boolean} */
Aggregation.prototype.scored;

/** @type {boolean} */
Aggregation.prototype.categorizable;

/** @type {!Array<!AggregationItem>} */
Aggregation.prototype.items;

/**
 * @struct
 * @record
 */
function AggregationResultItem() {}

/** @type {number} */
AggregationResultItem.prototype.overall;

/** @type {string} */
AggregationResultItem.prototype.name;

/** @type {string} */
AggregationResultItem.prototype.description;

/** @type {!Array<!AuditResult>} */
AggregationItem.prototype.subItems;

/**
 * @struct
 * @record
 */
function AggregationResult() {}

/** @type {string} */
Aggregation.prototype.name;

/** @type {string} */
Aggregation.prototype.description;

/** @type {boolean} */
Aggregation.prototype.scored;

/** @type {boolean} */
Aggregation.prototype.categorizable;

/** @type {!Array<!AggregationResultItem>} */
Aggregation.prototype.score;
