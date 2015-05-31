class Oscillator {
  constructor(ctx) {
    this.wave = 'sine';
    this.gain = 1;
    this.pitch = 0;
    this.ctx = ctx;
    //create VCO (voltage controlled oscillator)
    this.vco = this.ctx.createOscillator();

    //create VCA (voltage controlled amplifier)
    this.vca = this.ctx.createGain();

    //vco->vca->destination
    this.vco.connect(this.vca);
    this.vca.connect(this.ctx.destination);
  }
  //get/set wave type
  getType() {
    return this.vco.type;
  }
  setType(wave) {
    this.vco.type = wave;
  }

  //get/set gain
  getGain() {
    return this.vca.gain.value;
  }
  setGain(value) {
    this.vca.gain.value = value;
    this.vca.gain.setTargetAtTime(0, this.ctx.currentTime, .5);
  }

  //get/set pitch
  getPitch() {
    return this.vco.detune.value;
  }
  setPitch(value) {
    this.vco.detune.value = value;
  }

  //get/set frequency
  getFrequency() {
    return this.vco.frequency.value;
  }
  setFrequency(value) {
    this.vco.frequency.value = value;
  }

  //connect vca->external_node
  connect(node) {
    this.vca.connect(node);
  }

  //start/stop
  start(time=0) {
    this.vco.start(time);
  }
  stop(time=0) {
    this.vco.stop(time);
  }
}