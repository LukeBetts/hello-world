// Generates assets/sounds/click.wav — a short two-transient "box clicker" sound.
const fs = require('fs');
const path = require('path');
const rate = 44100;
const len = Math.floor(rate * 0.09);
const data = new Int16Array(len);
let seed = 7;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;
function burst(start, freq, amp, decay) {
  for (let i = start; i < len; i++) {
    const t = (i - start) / rate;
    const env = Math.exp(-t * decay);
    const v = (Math.sin(2 * Math.PI * freq * t) * 0.7 + rnd() * 0.3) * env * amp;
    data[i] = Math.max(-32767, Math.min(32767, data[i] + v * 32767));
  }
}
burst(0, 3400, 0.9, 260);
burst(Math.floor(rate * 0.018), 2600, 0.7, 220);
const buf = Buffer.alloc(44 + len * 2);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + len * 2, 4); buf.write('WAVE', 8);
buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
buf.writeUInt32LE(rate, 24); buf.writeUInt32LE(rate * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
buf.write('data', 36); buf.writeUInt32LE(len * 2, 40);
for (let i = 0; i < len; i++) buf.writeInt16LE(data[i], 44 + i * 2);
fs.writeFileSync(path.join(__dirname, '..', 'assets', 'sounds', 'click.wav'), buf);
console.log('wrote click.wav', buf.length, 'bytes');
