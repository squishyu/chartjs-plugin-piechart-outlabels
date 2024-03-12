/*!
 * @energiency/chartjs-plugin-piechart-outlabels v1.3.2
 * http://www.chartjs.org
 * (c) 2017-2024 @energiency/chartjs-plugin-piechart-outlabels contributors
 * Released under the MIT license
 */
(function (factory) {
typeof define === 'function' && define.amd ? define(factory) :
factory();
})((function () { 'use strict';

var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (undefined && undefined.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chart_js_1 = require("chart.js");
var custom_defaults_1 = __importDefault(require("./custom-defaults"));
var state_1 = require("./state");
var classes_1 = __importDefault(require("./classes"));
chart_js_1.defaults.plugins.outlabels = custom_defaults_1.default;
var PLUGIN_KEY = custom_defaults_1.default.PLUGIN_KEY;
function configure(dataset, options) {
    var override = dataset.outlabels;
    var config = {};
    if (override === false) {
        return null;
    }
    if (override === true) {
        override = {};
    }
    return Object.assign({}, config, options, override);
}
/**
 * Returns the bounding box of the given label elements.
 *
 * @param {*} elements List of chart elements
 * @returns Bounding box
 */
function getBoundingBox(elements) {
    var rect = {
        left: Infinity,
        right: -Infinity,
        top: Infinity,
        bottom: -Infinity,
    };
    for (var i = 0, l = elements.length; i < l; i++) {
        var outlabel = elements[i][PLUGIN_KEY];
        if (!outlabel || !outlabel.labelRect) {
            continue;
        }
        var labelRect = outlabel.labelRect;
        var x = labelRect.x, y = labelRect.y, width = labelRect.width, height = labelRect.height;
        rect.left = Math.min(rect.left, x);
        rect.right = Math.max(rect.right, x + width);
        rect.top = Math.min(rect.top, y);
        rect.bottom = Math.max(rect.bottom, y + height);
    }
    return __assign(__assign({}, rect), { width: rect.right - rect.left, height: rect.bottom - rect.top });
}
/**
 * Returns the zoom percentage required to fit the given bounding box within the given bounding box.
 *
 * @param {*} boundingBoxToResize
 * @param {*} boundingBoxToFitWithin
 * @returns Zoom percentage
 */
function getResizeZoomPercentage(boundingBoxToResize, boundingBoxToFitWithin) {
    var width = boundingBoxToFitWithin.width, height = boundingBoxToFitWithin.height;
    var deltas = [
        ((boundingBoxToFitWithin.left - boundingBoxToResize.left) / width) * 2,
        ((boundingBoxToFitWithin.top - boundingBoxToResize.top) / height) * 2,
        ((boundingBoxToResize.right - boundingBoxToFitWithin.right) / width) * 2,
        ((boundingBoxToResize.bottom - boundingBoxToFitWithin.bottom) / height) * 2,
    ];
    var maxDelta = Math.max.apply(Math, __spreadArray([0], deltas, false));
    return 1 - maxDelta;
}
/**
 * Updates the labels of the given elements.
 * @param {*} elements
 */
function updateLabels(elements) {
    for (var i = 0, l = elements.length; i < l; i++) {
        var element = elements[i];
        var outlabel = element[PLUGIN_KEY];
        if (!outlabel) {
            continue;
        }
        outlabel.update(element, elements, i);
    }
}
function fitChartArea(chart) {
    var ctrl = chart._metasets[0].controller;
    var meta = ctrl.getMeta();
    var elements = meta.data || [];
    var boundingBox = getBoundingBox(elements);
    var zoom = getResizeZoomPercentage(boundingBox, chart.chartArea);
    if (zoom && zoom !== 1) {
        ctrl.outerRadius = ctrl.outerRadius * zoom;
        ctrl.innerRadius *= zoom;
        ctrl.updateElements(meta.data, 0, meta.data.length, "none");
        return true;
    }
    return false;
}
exports.default = {
    id: "outlabels",
    resize: function (chart) {
        (0, state_1.getState)(chart).sizeChanged = true;
    },
    afterUpdate: function (chart) {
        var ctrl = chart._metasets[0].controller;
        var meta = ctrl.getMeta();
        var elements = meta.data || [];
        var fit = false;
        // Limit the number of steps to prevent infinite loops
        // It seems that using the number of elements will ensure that the chart
        // fits by positioning all labels in successive resizes
        var maxSteps = elements.length;
        // Avoid to draw labels while fitting the chart area
        (0, state_1.getState)(chart).fitting = true;
        while (!fit && maxSteps-- > 0) {
            updateLabels(elements);
            fit = !fitChartArea(chart);
        }
        (0, state_1.getState)(chart).fitting = false;
    },
    afterDatasetUpdate: function (chart, args, options) {
        var labels = chart.config.data.labels;
        var dataset = chart.data.datasets[args.index];
        var config = configure(dataset, options);
        var display = config && config.display;
        var elements = args.meta.data || [];
        var ctx = chart.ctx;
        var el, label, percent, newLabel, context, i;
        ctx.save();
        for (i = 0; i < elements.length; ++i) {
            el = elements[i];
            label = el[PLUGIN_KEY];
            percent = dataset.data[i] / args.meta.total;
            newLabel = null;
            if (display && el && !el.hidden) {
                try {
                    context = {
                        chart: chart,
                        dataIndex: i,
                        dataset: dataset,
                        labels: labels,
                        datasetIndex: args.index,
                        percent: percent,
                    };
                    newLabel = new classes_1.default.OutLabel(chart, i, ctx, config, context);
                }
                catch (e) {
                    newLabel = null;
                }
            }
            if (label &&
                newLabel &&
                !(0, state_1.getState)(chart).sizeChanged &&
                label.label === newLabel.label &&
                label.encodedText === newLabel.encodedText) {
                newLabel.offset = label.offset;
            }
            el[PLUGIN_KEY] = newLabel;
        }
        ctx.restore();
        (0, state_1.getState)(chart).sizeChanged = false;
    },
    afterDatasetDraw: function (chart, args) {
        var elements = args.meta.data || [];
        var ctx = chart.ctx;
        if ((0, state_1.getState)(chart).fitting) {
            return;
        }
        elements.forEach(function (el, index) {
            var outlabelPlugin = el[PLUGIN_KEY];
            if (!outlabelPlugin) {
                return;
            }
            outlabelPlugin.update(el, elements, index);
            outlabelPlugin.draw(ctx);
        });
    },
    afterDestroy: function (chart) {
        (0, state_1.removeState)(chart);
    },
};

}));
