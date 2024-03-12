import { CanvasFontSpec } from 'chart.js';
declare function textSize(ctx: CanvasRenderingContext2D, lines: string[], font: CanvasFontSpec): {
    height: number;
    width: number;
};
declare function parseFont(value: any, height: any): {
    family: any;
    lineHeight: number;
    size: any;
    style: any;
    weight: any;
    string: string;
};
export { textSize, parseFont, };
