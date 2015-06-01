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
      'Osc2_gain': .5
    }
  }

  setParameter(parameter, value) {
    this._patch[parameter] = value;
  }

  getParameter(parameter) {
    return this._patch[parameter];
  }
}
