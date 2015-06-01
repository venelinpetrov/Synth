class Patch {
  constructor(){
    this._patch = {
      'Osc1_on': true,
      'Osc1_wave': 'square',
      'Osc1_pitch': 0,
      'Osc1_gain': .8,

      'Osc2_on': false,
      'Osc2_wave': 'sine',
      'Osc2_pitch': 0,
      'Osc2_gain': .5,

      'Filter1_on': false,
      'Filter1_type': 'lowpass',
      'Filter1_frequency': 600,
      'Filter1_Q': 1,
      'Filter1_gain': 0
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
