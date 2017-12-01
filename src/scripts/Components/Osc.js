class Oscillator {
  constructor(ctx) {

    this.ctx = ctx;
    //create VCO (voltage controlled oscillator)
    this.vco = this.ctx.createOscillator();

    //create VCA (voltage controlled amplifier)
    this.vca = this.ctx.createGain();

    //vco->vca->destination
    this.vco.connect(this.vca);

    //f1/f2 crossfader gains
    this.f1Gain = this.ctx.createGain();
    this.f2Gain = this.ctx.createGain();

    //connect vca to f1Gain and f2Gain
    this.vca.connect(this.f1Gain);
    this.vca.connect(this.f2Gain);


  }
  //get/set wave type
  getType() {
    return this.vco.type;
  }
  setType(value) {
    this.vco.type = value;
  }

  //get/set gain
  getGain() {
    return this.vca.gain.value;
  }
  setGain(value) {
    this.vca.gain.value = value;
    //this.vca.gain.setTargetAtTime(0, this.ctx.currentTime, .5);
  }

  //get/set pitch
  getPitch() {
    return this.vco.detune.value;
  }
  setPitch(value) {
    this.vco.detune.value = value  * 100; //detune is in cents (100cent = 1 semi-tone), but values come fractional, so multiply by 100
  }
  get pitchAudioParam() {
    return this.vco.detune;
  }

  //get/set frequency
  getFrequency() {
    return this.vco.frequency.value;
  }
  setFrequency(value) {
    this.vco.frequency.value = value;
  }

  //set crossfader value
  //value=1 means all the output goes to filter1
  setFilterCrossfader(value) {
    this.f1Gain.gain.value = value;
    this.f2Gain.gain.value = 1 - value;
  }

  //getters for oscillator outputs
  get out1() {
    return this.f1Gain;
  }

  get out2() {
    return this.f2Gain;
  }

  get mainVca() {
    return this.vca;
  }
  get vcaAudioParam() {
    return this.vca.gain;
  }

  //start/stop
  start(time=0) {
    this.vco.start(time);
  }
  stop(time=0) {
    this.vco.stop(time);
  }
}
