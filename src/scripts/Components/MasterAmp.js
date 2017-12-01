class MasterAmp {
  constructor(ctx) {
    this.ctx = ctx;

    //nodes
    this.masterGain = this.ctx.createGain();
    this.stereoPanner = this.ctx.createStereoPanner();

    //connections
    this.masterGain.connect(this.stereoPanner);
    this.stereoPanner.connect(this.ctx.destination);
  }

  //set masterGain (a.k.a master volume of the synth)
  setMasterGain(value) {
    this.masterGain.gain.value = value;
  }

  //set pan, value is in range -1 to 1, where -1 means all the signal goes left
  //and +1 means all the signal goes right
  setPan(value) {
    this.stereoPanner.pan.value = value;

  }

  get input() {
    return this.masterGain;
  }
}
