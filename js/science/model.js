/* Deterministic educational models. ECI positions use a non-precessing circular orbit;
   the receiver rotates with Earth. No live ephemerides or measured RF are used. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.NavigationScience = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  const MU = 3.986004418e14, EARTH_RADIUS = 6378137, EARTH_RATE = 7.2921159e-5, C = 299792458;
  const defaults = { altitudeKm: 550, carrierGHz: 11.45, inclinationDeg: 53, latitudeDeg: 0, longitudeDeg: 0 };
  const dot = (a, b) => a.reduce((sum, value, index) => sum + value * b[index], 0);
  const norm = (v) => Math.sqrt(dot(v, v));
  const subtract = (a, b) => a.map((value, index) => value - b[index]);
  const rotateZ = (v, angle) => [Math.cos(angle) * v[0] - Math.sin(angle) * v[1], Math.sin(angle) * v[0] + Math.cos(angle) * v[1], v[2]];
  const crossOmega = (v) => [-EARTH_RATE * v[1], EARTH_RATE * v[0], 0];

  function orbit(time, options = {}, phase = 0, raan = 0) {
    const p = { ...defaults, ...options }, radius = EARTH_RADIUS + p.altitudeKm * 1000;
    const meanMotion = Math.sqrt(MU / radius ** 3), angle = meanMotion * time + phase;
    const inc = p.inclinationDeg * Math.PI / 180;
    const inPlane = [radius * Math.cos(angle), radius * Math.sin(angle) * Math.cos(inc), radius * Math.sin(angle) * Math.sin(inc)];
    const velocity = [-radius * meanMotion * Math.sin(angle), radius * meanMotion * Math.cos(angle) * Math.cos(inc), radius * meanMotion * Math.cos(angle) * Math.sin(inc)];
    return { position: rotateZ(inPlane, raan), velocity: rotateZ(velocity, raan), radius, speed: radius * meanMotion, meanMotion };
  }
  function receiverEcef(options = {}) {
    const p = { ...defaults, ...options }, lat = p.latitudeDeg * Math.PI / 180, lon = p.longitudeDeg * Math.PI / 180;
    return [EARTH_RADIUS * Math.cos(lat) * Math.cos(lon), EARTH_RADIUS * Math.cos(lat) * Math.sin(lon), EARTH_RADIUS * Math.sin(lat)];
  }
  function eciToEcef(position, velocity, time) {
    const p = rotateZ(position, -EARTH_RATE * time);
    return { position: p, velocity: rotateZ(velocity, -EARTH_RATE * time).map((v, i) => v - crossOmega(p)[i]) };
  }
  function lineOfSight(time, options = {}, phase = 0, raan = 0) {
    const sat = orbit(time, options, phase, raan), recEcef = receiverEcef(options);
    const recEci = rotateZ(recEcef, EARTH_RATE * time), recVelocity = crossOmega(recEci);
    const delta = subtract(sat.position, recEci), range = norm(delta);
    const rangeRate = dot(delta, subtract(sat.velocity, recVelocity)) / range;
    const satEcef = eciToEcef(sat.position, sat.velocity, time);
    const angles = azElFromEcef(satEcef.position, recEcef, options);
    return { ...angles, range, rangeRate, dopplerHz: -(options.carrierGHz || defaults.carrierGHz) * 1e9 * rangeRate / C, satEcef: satEcef.position, recEcef, sat };
  }
  function azElFromEnu(east, north, up) {
    const horizontal = Math.hypot(east, north), azimuthDeg = (Math.atan2(east, north) * 180 / Math.PI + 360) % 360;
    return { azimuthDeg, elevationDeg: Math.atan2(up, horizontal) * 180 / Math.PI };
  }
  function azElFromEcef(satellite, receiver, options = {}) {
    const p = { ...defaults, ...options }, lat = p.latitudeDeg * Math.PI / 180, lon = p.longitudeDeg * Math.PI / 180;
    const d = subtract(satellite, receiver);
    const east = -Math.sin(lon) * d[0] + Math.cos(lon) * d[1];
    const north = -Math.sin(lat) * Math.cos(lon) * d[0] - Math.sin(lat) * Math.sin(lon) * d[1] + Math.cos(lat) * d[2];
    const up = Math.cos(lat) * Math.cos(lon) * d[0] + Math.cos(lat) * Math.sin(lon) * d[1] + Math.sin(lat) * d[2];
    return azElFromEnu(east, north, up);
  }
  const skyRadius = (elevationDeg) => 1 - elevationDeg / 90;

  function fft(real, imag) {
    const n = real.length;
    if (n & (n - 1)) throw new Error("FFT length must be a power of two");
    for (let i = 1, j = 0; i < n; i++) {
      let bit = n >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
      if (i < j) { [real[i], real[j]] = [real[j], real[i]]; [imag[i], imag[j]] = [imag[j], imag[i]]; }
    }
    for (let size = 2; size <= n; size <<= 1) {
      const angle = -2 * Math.PI / size;
      for (let start = 0; start < n; start += size) for (let k = 0; k < size / 2; k++) {
        const wr = Math.cos(angle * k), wi = Math.sin(angle * k), j = start + k + size / 2, i = start + k;
        const tr = wr * real[j] - wi * imag[j], ti = wr * imag[j] + wi * real[j];
        real[j] = real[i] - tr; imag[j] = imag[i] - ti;
        real[i] += tr; imag[i] += ti;
      }
    }
  }
  function stft(real, imag, sampleRate, size = 256, hop = 128) {
    if (real.length !== imag.length) throw new Error("Complex signal arrays must have equal length");
    const window = Float64Array.from({ length: size }, (_, i) => .5 - .5 * Math.cos(2 * Math.PI * i / (size - 1)));
    const gain = window.reduce((sum, value) => sum + value, 0);
    const frames = [];
    for (let start = 0; start + size <= real.length; start += hop) {
      const re = Float64Array.from(window, (w, i) => real[start + i] * w), im = Float64Array.from(window, (w, i) => imag[start + i] * w);
      fft(re, im);
      const powerDb = Float64Array.from({ length: size }, (_, k) => {
        const bin = (k + size / 2) % size;
        return 10 * Math.log10((re[bin] ** 2 + im[bin] ** 2) / (gain ** 2) + 1e-12);
      });
      frames.push({ timeSec: (start + size / 2) / sampleRate, powerDb });
    }
    return { frames, frequenciesHz: Float64Array.from({ length: size }, (_, k) => (k - size / 2) * sampleRate / size), sampleRate, size, hop };
  }
  function seededNoise(seed) {
    let state = seed >>> 0;
    return () => { state = (1664525 * state + 1013904223) >>> 0; return (state + .5) / 4294967296; };
  }
  function simulatedSpectrogram(options = {}, snrDb = 22) {
    // A time-varying local oscillator removes the first-order Doppler trend.
    // The plotted baseband residual is not the 11.45 GHz waveform or its bandwidth.
    const sampleRate = 2048, durationSec = 16, length = sampleRate * durationSec;
    const d0 = lineOfSight(0, options).dopplerHz;
    const slope = (lineOfSight(.01, options).dopplerHz - lineOfSight(-.01, options).dopplerHz) / .02;
    const real = new Float64Array(length), imag = new Float64Array(length), random = seededNoise(20261124);
    const noiseSigma = Math.pow(10, -snrDb / 20) / Math.sqrt(2);
    let phase = 0;
    for (let i = 0; i < length; i++) {
      const time = i / sampleRate - durationSec / 2;
      const residual = lineOfSight(time, options).dopplerHz - (d0 + slope * time);
      if (Math.abs(residual) >= sampleRate / 2) throw new Error("Residual Doppler exceeds baseband Nyquist rate");
      phase += 2 * Math.PI * residual / sampleRate;
      const gaussian = () => Math.sqrt(-2 * Math.log(Math.max(random(), 1e-12))) * Math.cos(2 * Math.PI * random());
      real[i] = Math.cos(phase) + noiseSigma * gaussian();
      imag[i] = Math.sin(phase) + noiseSigma * gaussian();
    }
    const spectrum = stft(real, imag, sampleRate, 256, 128);
    spectrum.frames.forEach((frame) => { frame.timeSec -= durationSec / 2; });
    return { ...spectrum, durationSec, reference: "First-order Doppler tracking oscillator", carrierDopplerHz: d0, snrDb };
  }
  return { MU, EARTH_RADIUS, EARTH_RATE, C, defaults, orbit, receiverEcef, eciToEcef, lineOfSight, azElFromEnu, azElFromEcef, skyRadius, fft, stft, simulatedSpectrogram };
});
