class Patch {
  constructor(){
    this._patch = {
      'Osc1_on': true,
      'Osc1_wave': 'square',
      'Osc1_pitch': 0,
      'Osc1_gain': .8,
      'Osc1_F1F2': .5,

      'Osc2_on': false,
      'Osc2_wave': 'sine',
      'Osc2_pitch': 0,
      'Osc2_gain': .5,
      'Osc2_F1F2': .5,

      'Envelope_attackTime': 0,
      'Envelope_decayTime': 0,
      'Envelope_sustainLevel': .7,
      'Envelope_releaseTime': .06,

      'Filter1_on': false,
      'Filter1_type': 'lowpass',
      'Filter1_frequency': 300,
      'Filter1_Q': 1,
      'Filter1_gain': 0,
      'Filter1_dryWet': .5,

      'Filter2_on': false,
      'Filter2_type': 'lowpass',
      'Filter2_frequency': 300,
      'Filter2_Q': 1,
      'Filter2_gain': 0,
      'Filter2_dryWet': .5
    }
  }

  setParameter(parameter, value) {
    this._patch[parameter] = value;
  }

  getParameter(parameter) {
    return this._patch[parameter];
  }

  //get/set patch
  //TODO: implement patch import/export
  getPatch() {
    return this._patch;
  }

  setPatch(patch) {
    this._patch = patch
  }
}
