import {Chart} from "chart.js";

const chartStates = new WeakMap();

export function getState(chart: Chart) {
  let state = chartStates.get(chart);
  if (!state) {
    state = {
      sizeChanged: false,
      fitting: false,
    };
    chartStates.set(chart, state);
  }
  return state;
}

export function removeState(chart: Chart) {
  chartStates.delete(chart);
}
