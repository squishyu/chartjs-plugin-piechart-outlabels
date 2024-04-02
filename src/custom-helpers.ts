'use strict';

import {CanvasFontSpec, Chart, FontSpec} from 'chart.js';
import {valueOrDefault, isNullOrUndef, toLineHeight} from 'chart.js/helpers';

function toFontString(font: FontSpec) {
  if (!font || isNullOrUndef(font.size) || isNullOrUndef(font.family)) {
    return null;
  }

  return (font.style ? font.style + ' ' : '')
    + (font.weight ? font.weight + ' ' : '')
    + font.size + 'px '
    + font.family;
}

function textSize(ctx: CanvasRenderingContext2D, lines: string[], font: CanvasFontSpec) {
  var items = [].concat(lines);
  var ilen = items.length;
  var width = 0;
  var i;

  ctx.save();
  ctx.font = font.string;

  for (i = 0; i < ilen; ++i) {
    width = Math.max(ctx.measureText(items[i]).width, width);
  }

  ctx.restore();

  return {
    height: ilen * (typeof font.lineHeight === "number" ? font.lineHeight : 1), // TODO
    width: width
  };
}

function adaptTextSizeToHeight(height: number, minimum: number, maximum: number) {
  var size = (height / 100) * 2.5;
  if (minimum && size < minimum) {
    return minimum;
  }
  if (maximum && size > maximum) {
    return maximum;
  }
  return size;
}

function parseFont(value, height) {
  var size = valueOrDefault(value.size, Chart.defaults.font.size);

  if (value.resizable) {
    size = adaptTextSizeToHeight(height, value.minSize, value.maxSize);
  }

  var font = {
    family: valueOrDefault(value.family, Chart.defaults.font.family),
    lineHeight: toLineHeight(value.lineHeight, size),
    size: size,
    style: valueOrDefault(value.style, Chart.defaults.font.style),
    weight: valueOrDefault(value.weight, null),
    string: ''
  };

  font.string = toFontString(font);
  return font;
}

export {
  textSize,
  parseFont,
};
