// src/index.ts
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
export {
  getScriptString,
  initFigmaScale,
  vh,
  vw
};
