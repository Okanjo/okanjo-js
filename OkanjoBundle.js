"use strict";

// Auto include polyfills needed for old engines
// require("babel-polyfill");

import okanjo from './src/Okanjo';
import Ad from './src/Ad';
import Product from './src/Product';
import Placement from './src/Placement';
import metrics from './src/Metrics';
import EventEmitter from './src/EventEmitter';
import Widget from './src/Widget';

// Backwards compatible namespace
okanjo.Ad = Ad;
okanjo.Product = Product;
okanjo.Placement = Placement;
okanjo.metrics = metrics;
okanjo._EventEmitter = EventEmitter;
okanjo._Widget = Widget;

// Expose to window
window.okanjo = okanjo;

// Bundle templates too
import './build/templates/okanjo.core';
import './build/templates/okanjo.block2';
import './build/templates/adx.block2';
import './build/templates/articles.block2';
import './build/templates/products.block2';

// Snag a page view
import './src/AutoPageView';