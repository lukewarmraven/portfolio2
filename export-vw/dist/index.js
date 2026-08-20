"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  getScriptString: () => getScriptString,
  initFigmaScale: () => initFigmaScale,
  vh: () => vh,
  vw: () => vw
});
module.exports = __toCommonJS(index_exports);
var DEFAULT_CANVAS_W = 1728;
var DEFAULT_CANVAS_H = 1117;
var DEFAULT_SCALE = 0.6;
var _scale = DEFAULT_SCALE;
var _canvasW = DEFAULT_CANVAS_W;
var _canvasH = DEFAULT_CANVAS_H;
function initFigmaScale(config) {
  const canvasW = config?.canvasW ?? DEFAULT_CANVAS_W;
  const canvasH = config?.canvasH ?? DEFAULT_CANVAS_H;
  const scale = config?.scale ?? DEFAULT_SCALE;
  const fallbackW = config?.fallbackW ?? parseFloat((1280 / canvasW).toFixed(4));
  const fallbackH = config?.fallbackH ?? parseFloat((800 / canvasH).toFixed(4));
  _scale = scale;
  _canvasW = canvasW;
  _canvasH = canvasH;
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }
  const root = document.documentElement;
  function update() {
    root.style.setProperty(
      "--figma-scale-w",
      (window.innerWidth / canvasW).toFixed(4)
    );
    root.style.setProperty(
      "--figma-scale-h",
      (window.innerHeight / canvasH).toFixed(4)
    );
  }
  root.style.setProperty("--figma-scale-w", fallbackW.toFixed(4));
  root.style.setProperty("--figma-scale-h", fallbackH.toFixed(4));
  update();
  window.addEventListener("resize", update);
}
function vw(px) {
  return `calc(${px}px * var(--figma-scale-w) * ${_scale})`;
}
function vh(px) {
  return `calc(${px}px * var(--figma-scale-h) * ${_scale})`;
}
function getScriptString(config) {
  const canvasW = config?.canvasW ?? DEFAULT_CANVAS_W;
  const canvasH = config?.canvasH ?? DEFAULT_CANVAS_H;
  const fallbackW = config?.fallbackW ?? parseFloat((1280 / canvasW).toFixed(4));
  const fallbackH = config?.fallbackH ?? parseFloat((800 / canvasH).toFixed(4));
  return `(function(){var r=document.documentElement;r.style.setProperty('--figma-scale-w','${fallbackW.toFixed(4)}');r.style.setProperty('--figma-scale-h','${fallbackH.toFixed(4)}');function u(){r.style.setProperty('--figma-scale-w',(window.innerWidth/${canvasW}).toFixed(4));r.style.setProperty('--figma-scale-h',(window.innerHeight/${canvasH}).toFixed(4));}u();window.addEventListener('resize',u);})();`;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getScriptString,
  initFigmaScale,
  vh,
  vw
});
