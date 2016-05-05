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

const Gather = require('./gather');

class HTTPRedirect extends Gather {

  static _error(errorString) {
    return {
      redirectsHTTP: {
        value: undefined,
        debugString: errorString
      }
    };
  }

  constructor() {
    super();
    this._resolved = false;
    this._artifactsResolved = undefined;
    this._onSecurityStateChanged = undefined;
    this._noSecurityChangesTimeout = undefined;
  }

  afterSecondReloadPageLoad(options) {
    const driver = options.driver;

    return new Promise((resolve, reject) => {
      // Set up a timeout for ten seconds in case we don't get any
      // security events at all. If that happens, bail.
      this._noSecurityChangesTimeout = setTimeout(_ => {
        this._resolved = true;
        this.artifact = {
          redirectsHTTP: {
            value: false,
            debugString: 'Timed out waiting for HTTP redirection.'
          }
        };

        resolve();
      }, 10000);

      driver.getSecurityState()
        .then(state => {
          // We've received a security event, so this needs
          // to be canceled, otherwise we resolve the promise with an error.
          if (this._noSecurityChangesTimeout !== undefined) {
            clearTimeout(this._noSecurityChangesTimeout);
          }

          this.artifact = {
            redirectsHTTP: {
              value: state.schemeIsCryptographic
            }
          };

          resolve();
        });
    });
  }
}

module.exports = HTTPRedirect;
