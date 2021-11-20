import {TestBed} from '@angular/core/testing';
import {BrowserDynamicTestingModule, platformBrowserDynamicTesting,} from '@angular/platform-browser-dynamic/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

/*
 * Common setup / initialization for all unit tests in Angular Material and CDK.
 */

TestBed.initTestEnvironment(
    [BrowserDynamicTestingModule, NoopAnimationsModule], platformBrowserDynamicTesting());

(window as any).module = {};
(window as any).isNode = false;
(window as any).isBrowser = true;
(window as any).global = window;
