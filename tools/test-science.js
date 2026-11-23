const assert = require("assert");
const science = require("../js/science/model.js");
const near = (actual, expected, tolerance, message) => assert(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} vs ${expected}`);

for (const time of [-600, -120, 0, 120, 600]) {
  const orbit = science.orbit(time);
  near(Math.hypot(...orbit.position), orbit.radius, 1e-6, "circular radius conservation");
  near(Math.hypot(...orbit.velocity), Math.sqrt(science.MU / orbit.radius), 1e-9, "circular speed");
  const state = science.lineOfSight(time);
  const finiteDifference = (science.lineOfSight(time + .001).range - science.lineOfSight(time - .001).range) / .002;
  near(state.rangeRate, finiteDifference, .001, "range-rate finite difference");
  near(state.dopplerHz, -11.45e9 * state.rangeRate / science.C, 1e-7, "Doppler sign convention");
  const ecef = science.eciToEcef(orbit.position, orbit.velocity, time);
  near(Math.hypot(...ecef.position), orbit.radius, 1e-6, "ECI/ECEF radius consistency");
  const ecefDelta = science.eciToEcef(science.orbit(time + .001).position, science.orbit(time + .001).velocity, time + .001).position;
  const ecefPrevious = science.eciToEcef(science.orbit(time - .001).position, science.orbit(time - .001).velocity, time - .001).position;
  ecef.velocity.forEach((velocity, index) => near(velocity, (ecefDelta[index] - ecefPrevious[index]) / .002, .001, "ECEF velocity derivative"));
}
assert(science.lineOfSight(-60).dopplerHz > 0 && science.lineOfSight(60).dopplerHz < 0, "approaching Doppler positive, receding negative");
[[0, 1, 0, 0], [1, 0, 0, 90], [0, -1, 0, 180], [-1, 0, 0, 270]].forEach(([east, north, up, az]) => near(science.azElFromEnu(east, north, up).azimuthDeg, az, 1e-10, "skyplot cardinal direction"));
near(science.azElFromEnu(0, 0, 1).elevationDeg, 90, 1e-10, "zenith elevation");
near(science.skyRadius(0), 1, 1e-10, "horizon radius"); near(science.skyRadius(30), 2 / 3, 1e-10, "30 degree ring"); near(science.skyRadius(60), 1 / 3, 1e-10, "60 degree ring"); near(science.skyRadius(90), 0, 1e-10, "zenith radius");

const sampleRate = 1024, length = 2048;
const sineReal = Float64Array.from({ length }, (_, i) => Math.cos(2 * Math.PI * 128 * i / sampleRate));
const sineImag = Float64Array.from({ length }, (_, i) => Math.sin(2 * Math.PI * 128 * i / sampleRate));
const sine = science.stft(sineReal, sineImag, sampleRate, 256, 128);
const peak = (frame) => frame.powerDb.indexOf(Math.max(...frame.powerDb));
near(sine.frequenciesHz[peak(sine.frames[0])], 128, 1e-10, "STFT sinusoid peak and bin scaling");
near(sine.frequenciesHz[129] - sine.frequenciesHz[128], 4, 1e-10, "STFT frequency-bin width");
const chirpReal = Float64Array.from({ length }, (_, i) => Math.cos(2 * Math.PI * (40 * i / sampleRate + 100 * (i / sampleRate) ** 2 / 2)));
const chirpImag = Float64Array.from({ length }, (_, i) => Math.sin(2 * Math.PI * (40 * i / sampleRate + 100 * (i / sampleRate) ** 2 / 2)));
const chirp = science.stft(chirpReal, chirpImag, sampleRate, 256, 128);
const early = chirp.frequenciesHz[peak(chirp.frames[2])], late = chirp.frequenciesHz[peak(chirp.frames[11])];
assert(late > early + 80, `linear chirp should rise through bins: ${early} to ${late}`);
for (const altitudeKm of [450, 550, 700]) assert(science.simulatedSpectrogram({ altitudeKm }, 20).frames.length > 200, "spectrogram valid across altitude control");
console.log("Science numerical tests passed.");
