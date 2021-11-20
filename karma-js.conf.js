/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const browserProvidersConf = require('./browser-providers.conf');
const {generateSeed} = require('./tools/jasmine-seed-generator');
const {hostname} = require('os');

// Karma configuration
// Generated on Thu Sep 25 2014 11:52:02 GMT-0700 (PDT)
module.exports = function(config) {
  const conf = {
    frameworks: ['jasmine'],

    client: {
      jasmine: {
        random: true,
        seed: generateSeed('karma-js.conf'),
      },
      captureConsole: process.env.CI ? false : true,
    },

    files: [

      // Serve AngularJS for `ngUpgrade` testing.
      {pattern: 'node_modules/angular-1.5/angular?(.min).js', included: false, watched: false},
      {pattern: 'node_modules/angular-mocks-1.5/angular-mocks.js', included: false, watched: false},
      {pattern: 'node_modules/angular-1.6/angular?(.min).js', included: false, watched: false},
      {pattern: 'node_modules/angular-mocks-1.6/angular-mocks.js', included: false, watched: false},
      {pattern: 'node_modules/angular-1.7/angular?(.min).js', included: false, watched: false},
      {pattern: 'node_modules/angular-mocks-1.7/angular-mocks.js', included: false, watched: false},
      {pattern: 'node_modules/angular-1.8/angular?(.min).js', included: false, watched: false},
      {pattern: 'node_modules/angular-mocks-1.8/angular-mocks.js', included: false, watched: false},

      'node_modules/core-js-bundle/index.js',
      'node_modules/jasmine-ajax/lib/mock-ajax.js',

      // Dependencies built by Bazel. See `config.yml` for steps running before
      // the legacy Saucelabs tests run.
      'dist/bin/packages/zone.js/npm_package/bundles/zone.umd.js',
      'dist/bin/packages/zone.js/npm_package/bundles/zone-testing.umd.js',
      'dist/bin/packages/zone.js/npm_package/bundles/task-tracking.umd.js',

      // Including systemjs because it defines `__eval`, which produces correct stack traces.
      'test-events.js',
      'third_party/shims_for_internal_tests.js',

      'node_modules/reflect-metadata/Reflect.js',
      'dist/legacy-test-bundle.spec.js',
      {pattern: 'packages/platform-browser/test/static_assets/**', included: false, watched: false},
      {
        pattern: 'packages/platform-browser/test/browser/static_assets/**',
        included: false,
        watched: false,
      },
    ],

    customLaunchers: browserProvidersConf.customLaunchers,

    plugins: [
      'karma-jasmine',
      'karma-sauce-launcher',
      'karma-chrome-launcher',
      'karma-sourcemap-loader',
    ],

    preprocessors: {
      '**/*.js': ['sourcemap'],
    },

    // Bazel inter-op: Allow tests to request resources from either
    //   /base/node_modules/path/to/thing
    // or
    //   /base/angular/node_modules/path/to/thing
    // This can be removed when all karma tests are run under Bazel, then we
    // don't need this entire config file.
    proxies: {
      '/base/angular/': '/base/',
      '/base/npm/': '/base/',
    },

    sauceLabs: {
      testName: 'Angular2',
      retryLimit: 3,
      startConnect: false,
      recordVideo: false,
      recordScreenshots: false,
      idleTimeout: 600,
      commandTimeout: 600,
      maxDuration: 5400,
    },

    // Try "websocket" for a faster transmission first. Fallback to "polling" if necessary.
    transports: ['websocket', 'polling'],

    port: 9876,
    captureTimeout: 180000,
    browserDisconnectTimeout: 180000,
    browserDisconnectTolerance: 3,
    browserNoActivityTimeout: 300000,
  };

  // Workaround for: https://github.com/bazelbuild/rules_nodejs/issues/1431. The idea is
  // that we do no not allow `@bazel/karma` to add the `progress` reporter.
  Object.defineProperty(conf, 'reporters', {
    enumerable: true,
    get: () => ['dots'],
    set: () => {},
  });

  if (process.env['SAUCE_TUNNEL_IDENTIFIER']) {
    console.log(`SAUCE_TUNNEL_IDENTIFIER: ${process.env.SAUCE_TUNNEL_IDENTIFIER}`);

    const tunnelIdentifier = process.env['SAUCE_TUNNEL_IDENTIFIER'];

    // Setup the Saucelabs plugin so that it can launch browsers using the proper tunnel.
    conf.sauceLabs.build = tunnelIdentifier;
    conf.sauceLabs.tunnelIdentifier = tunnelIdentifier;
  }

  // For SauceLabs jobs, we set up a domain which resolves to the machine which launched
  // the tunnel. We do this because devices are sometimes not able to properly resolve
  // `localhost` or `127.0.0.1` through the SauceLabs tunnel. Using a domain that does not
  // resolve to anything on SauceLabs VMs ensures that such requests are always resolved through
  // the tunnel, and resolve to the actual tunnel host machine (commonly the CircleCI VMs).
  // More context can be found in: https://github.com/angular/angular/pull/35171.
  if (process.env.SAUCE_LOCALHOST_ALIAS_DOMAIN) {
    conf.hostname = process.env.SAUCE_LOCALHOST_ALIAS_DOMAIN;
  } else {
    conf.hostname = hostname();
  }

  if (process.env.KARMA_WEB_TEST_MODE) {
    // KARMA_WEB_TEST_MODE is used to setup karma to run in SauceLabs.
    console.log(`KARMA_WEB_TEST_MODE: ${process.env.KARMA_WEB_TEST_MODE}`);

    switch (process.env.KARMA_WEB_TEST_MODE) {
      case 'SL_REQUIRED':
        conf.browsers = browserProvidersConf.sauceAliases.CI_REQUIRED;
        break;
      case 'SL_OPTIONAL':
        conf.browsers = browserProvidersConf.sauceAliases.CI_OPTIONAL;
        break;
      default:
        throw new Error(
            `Unrecognized process.env.KARMA_WEB_TEST_MODE: ${process.env.KARMA_WEB_TEST_MODE}`);
    }
  } else {
    // Run the test locally
    conf.browsers = [process.env['DISPLAY'] ? 'Chrome' : 'ChromeHeadless'];
  }

  config.set(conf);
};
