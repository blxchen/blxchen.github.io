(function () {
  "use strict";
  const science = window.NavigationScience;
  if (!science) return;
  const navy = "#061321", grid = "#37566a", ink = "#e9eff0", cyan = "#77b8c4", orange = "#c87935";
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const format = (value, digits = 0) => Number(value).toFixed(digits);
  function canvasContext(canvas) {
    const width = Math.max(200, Math.round(canvas.clientWidth)), height = Math.max(160, Math.round(canvas.clientHeight));
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== width * ratio || canvas.height !== height * ratio) { canvas.width = width * ratio; canvas.height = height * ratio; }
    const ctx = canvas.getContext("2d"); ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.fillStyle = navy; ctx.fillRect(0, 0, width, height);
    return { ctx, width, height };
  }
  function label(ctx, value, x, y, align = "left") {
    ctx.fillStyle = "#adcad0"; ctx.font = "11px ui-monospace, Consolas, monospace"; ctx.textAlign = align; ctx.fillText(value, x, y);
  }
  function spectrumColor(db) {
    const p = clamp((db + 65) / 65, 0, 1);
    const stops = [[8, 26, 42], [20, 78, 100], [67, 156, 172], [222, 211, 154], [247, 238, 208]];
    const scaled = p * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(scaled)), f = scaled - i;
    return `rgb(${stops[i].map((v, j) => Math.round(v + (stops[i + 1][j] - v) * f)).join(",")})`;
  }
  function drawSpectrogram(canvas, spectrum) {
    const { ctx, width, height } = canvasContext(canvas), left = 48, right = 16, top = 15, bottom = 32;
    const plotW = width - left - right, plotH = height - top - bottom, frames = spectrum.frames;
    const maxHz = 500, binMin = spectrum.frequenciesHz.findIndex((value) => value >= -maxHz), binMax = spectrum.frequenciesHz.findIndex((value) => value > maxHz);
    const count = binMax - binMin, frameWidth = plotW / frames.length, rowHeight = plotH / count;
    for (let i = 0; i < frames.length; i++) for (let k = binMin; k < binMax; k++) {
      ctx.fillStyle = spectrumColor(frames[i].powerDb[k]);
      ctx.fillRect(left + i * frameWidth, top + (binMax - k - 1) * rowHeight, Math.ceil(frameWidth + .3), Math.ceil(rowHeight + .3));
    }
    ctx.strokeStyle = grid; ctx.lineWidth = 1; ctx.strokeRect(left, top, plotW, plotH);
    [-500, -250, 0, 250, 500].forEach((hz) => label(ctx, `${hz}`, left - 7, top + (500 - hz) / 1000 * plotH + 4, "right"));
    [-8, -4, 0, 4, 8].forEach((sec) => label(ctx, `${sec}s`, left + (sec + 8) / 16 * plotW, height - 9, "center"));
    label(ctx, "Hz", 9, 13); if (width > 500) label(ctx, "relative to closest approach", width - 12, height - 9, "right");
    const gradient = ctx.createLinearGradient(0, 0, 90, 0);
    [0, .25, .5, .75, 1].forEach((p) => gradient.addColorStop(p, spectrumColor(-65 + p * 65)));
    ctx.fillStyle = gradient; ctx.fillRect(width - 94, 20, 75, 5);
    label(ctx, "−65", width - 94, 38); label(ctx, "0 dB", width - 18, 38, "right");
  }
  function drawDoppler(canvas, options, time) {
    const { ctx, width, height } = canvasContext(canvas), left = 52, top = 24, right = 15, bottom = 35, w = width - left - right, h = height - top - bottom;
    const points = Array.from({ length: 181 }, (_, i) => science.lineOfSight(-180 + i * 2, options));
    const maxKHz = Math.ceil(Math.max(...points.map((p) => Math.abs(p.dopplerHz))) / 50000) * 50;
    ctx.strokeStyle = grid; ctx.lineWidth = 1;
    [-1, -.5, 0, .5, 1].forEach((fraction) => {
      const y = top + (1 - fraction) * h / 2;
      ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(left + w, y); ctx.stroke();
      label(ctx, `${format(fraction * maxKHz)}k`, left - 7, y + 4, "right");
    });
    [-180, -90, 0, 90, 180].forEach((sec) => label(ctx, `${sec}s`, left + (sec + 180) / 360 * w, height - 10, "center"));
    ctx.strokeStyle = cyan; ctx.lineWidth = 2; ctx.beginPath();
    points.forEach((p, i) => { const x = left + i / (points.length - 1) * w, y = top + (1 - p.dopplerHz / (maxKHz * 1000)) * h / 2; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
    ctx.stroke();
    const current = science.lineOfSight(time, options), x = left + (time + 180) / 360 * w, y = top + (1 - current.dopplerHz / (maxKHz * 1000)) * h / 2;
    ctx.strokeStyle = orange; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, top + h); ctx.stroke();
    ctx.fillStyle = orange; ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
    label(ctx, "Doppler / kHz", left, 13); if (width > 500) label(ctx, "pass time", width - right, height - 10, "right");
    return current;
  }
  function drawSkyplot(canvas, options, time) {
    const { ctx, width, height } = canvasContext(canvas), cx = width / 2, cy = height / 2 + 4, radius = Math.min(width - 72, height - 55) / 2;
    ctx.strokeStyle = grid; ctx.lineWidth = 1;
    [0, 30, 60].forEach((elevation) => { ctx.beginPath(); ctx.arc(cx, cy, radius * science.skyRadius(elevation), 0, Math.PI * 2); ctx.stroke(); });
    ctx.beginPath(); ctx.moveTo(cx - radius, cy); ctx.lineTo(cx + radius, cy); ctx.moveTo(cx, cy - radius); ctx.lineTo(cx, cy + radius); ctx.stroke();
    label(ctx, "N", cx, cy - radius - 9, "center"); label(ctx, "E", cx + radius + 12, cy + 4, "center");
    label(ctx, "S", cx, cy + radius + 17, "center"); label(ctx, "W", cx - radius - 12, cy + 4, "center");
    label(ctx, "30°", cx + 8, cy - radius * science.skyRadius(30) + 4); label(ctx, "60°", cx + 8, cy - radius * science.skyRadius(60) + 4);
    // Five satellites share a documented circular orbit, with phase offsets.
    [-.22, -.11, 0, .11, .22].forEach((phase, index) => {
      const position = science.lineOfSight(time, options, phase);
      if (position.elevationDeg < 0) return;
      const az = position.azimuthDeg * Math.PI / 180, r = radius * science.skyRadius(position.elevationDeg);
      const x = cx + Math.sin(az) * r, y = cy - Math.cos(az) * r;
      ctx.fillStyle = index === 2 ? orange : cyan; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
      label(ctx, `S${index + 1}`, x + 7, y - 7);
    });
  }
  function mount(root) {
    if (!root || root.dataset.scienceReady) return;
    root.dataset.scienceReady = "true";
    const spectrogramCanvas = root.querySelector("[data-graph=spectrogram]"), dopplerCanvas = root.querySelector("[data-graph=doppler]"), skyplotCanvas = root.querySelector("[data-graph=skyplot]");
    const altitude = root.querySelector("[name=altitude]"), snr = root.querySelector("[name=snr]"), play = root.querySelector("[data-science-play]"), reset = root.querySelector("[data-science-reset]");
    const readout = root.querySelector("[data-science-readout]");
    let options = { ...science.defaults }, spectrum, time = -180, playing = !matchMedia("(prefers-reduced-motion: reduce)").matches, visible = false, lastFrame = 0, frameId = 0;
    function updateSpectrum() {
      options.altitudeKm = Number(altitude.value);
      spectrum = science.simulatedSpectrogram(options, Number(snr.value));
      root.querySelector("[data-altitude-value]").textContent = `${options.altitudeKm} km`;
      root.querySelector("[data-snr-value]").textContent = `${snr.value} dB`;
      drawSpectrogram(spectrogramCanvas, spectrum); draw();
    }
    function draw() {
      const current = drawDoppler(dopplerCanvas, options, time);
      drawSkyplot(skyplotCanvas, options, time);
      readout.textContent = `T ${time >= 0 ? "+" : ""}${format(time, 1)} s · Doppler ${format(current.dopplerHz / 1000, 1)} kHz · Elevation ${format(current.elevationDeg, 1)}°`;
    }
    function frame(timestamp) {
      frameId = 0;
      if (!playing || !visible || document.hidden) { lastFrame = 0; return; }
      if (lastFrame) { time += Math.min((timestamp - lastFrame) / 1000 * 7, 1); if (time > 180) time = -180; draw(); }
      lastFrame = timestamp;
      schedule();
    }
    function schedule() { if (playing && visible && !document.hidden && !frameId) frameId = requestAnimationFrame(frame); }
    altitude.addEventListener("input", updateSpectrum); snr.addEventListener("input", updateSpectrum);
    play.addEventListener("click", () => { playing = !playing; play.textContent = playing ? "Pause" : "Play"; play.setAttribute("aria-pressed", String(playing)); if (!playing) { cancelAnimationFrame(frameId); frameId = 0; lastFrame = 0; } else schedule(); });
    reset.addEventListener("click", () => { time = -180; draw(); });
    new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; if (visible) schedule(); else { cancelAnimationFrame(frameId); frameId = 0; lastFrame = 0; } }, { threshold: .02 }).observe(root);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) schedule(); else { cancelAnimationFrame(frameId); frameId = 0; lastFrame = 0; } });
    window.addEventListener("resize", () => { drawSpectrogram(spectrogramCanvas, spectrum); draw(); }, { passive: true });
    play.textContent = playing ? "Pause" : "Play"; play.setAttribute("aria-pressed", String(playing));
    updateSpectrum();
  }
  window.NavigationVisualization = { mount };
})();
