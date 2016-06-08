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

const Auditor = require('./auditor');
const Scheduler = require('./scheduler');
const Aggregator = require('./aggregator');
const fs = require('fs');
const path = require('path');

// TODO: make this a more robust check for the config.
function isValidConfig(config) {
  return (typeof config.passes !== 'undefined' &&
      typeof config.audits !== 'undefined' &&
      typeof config.aggregations);
}

module.exports = function(driver, opts) {
  // Default mobile emulation and page loading to true.
  // The extension will switch these off initially.
  if (typeof opts.flags.mobile === 'undefined') {
    opts.flags.mobile = true;
  }

  if (typeof opts.flags.loadPage === 'undefined') {
    opts.flags.loadPage = true;
  }

  const config = opts.config;
  if (!isValidConfig(config)) {
    throw new Error('Config is invalid. Did you define passes, audits, and aggregations?');
  }

  const passes = config.passes.map(pass => {
    pass.gatherers = pass.gatherers.map(gatherer => {
      try {
        const GathererClass = require(`./gatherers/${gatherer}`);
        return new GathererClass();
      } catch (requireError) {
        throw new Error(`Unable to locate gatherer: ${gatherer}`);
      }
    });

    return pass;
  });

  const whitelist = opts.flags.auditWhitelist;
  const audits = config.audits
    // Remove any audits not in the whitelist.
    .filter(a => {
      // If there is no whitelist, assume all.
      if (!whitelist) {
        return true;
      }

      return whitelist.has(a.toLowerCase());
    })

    // Remap the audits to its actual class.
    .map(audit => {
      try {
        return require(`./audits/${audit}`);
      } catch (requireError) {
        throw new Error(`Unable to locate audit: ${audit}`);
      }
    });

  // The runs of Lighthouse should be tested in integration / smoke tests, so testing for coverage
  // here, at least from a unit test POV, is relatively low merit.
  /* istanbul ignore next */
  return Scheduler
      .run(passes, Object.assign({}, opts, {driver}))
      .then(artifacts => Auditor.audit(artifacts, audits))
      .then(results => Aggregator.aggregate(config.aggregations, results))
      .then(aggregations => {
        return {
          url: opts.url,
          aggregations
        };
      });
};

/**
 * Returns list of audit names for external querying.
 * @return {!Array<string>}
 */
module.exports.getAuditList = function() {
  return fs
      .readdirSync(path.join(__dirname, './audits'))
      .filter(f => /\.js$/.test(f));
};
