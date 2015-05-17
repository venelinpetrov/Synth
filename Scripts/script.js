
(function(ns){
  'use strict'

  class HtmlRenderer {
    //Slider control
    static renderSlider({id, className='', labelText, min, max, step, value, advanced=false} = {}) {
      var valueIndicator;
      var label;
      var slider = document.createElement('input');


      //simple slider
      slider.setAttribute('type', 'range');
      //slider.id = id;
      slider.className = 'parameter' + ' ' + className;
      slider.min = min;
      slider.max = max;
      slider.step = step;
      slider.value = value;


      //advanced slider
      if(advanced) {
        //create html elements
        label = document.createElement('label');
        valueIndicator = document.createElement('input');


        //label
        label.setAttribute('for', id);
        label.name = id + '_label';
        label.textContent = labelText;


        //value indicator
        valueIndicator.setAttribute('type', 'number');
        valueIndicator.id = id;
        valueIndicator.min = min;
        valueIndicator.max = max;
        valueIndicator.value = value;
        valueIndicator.step = step;
        valueIndicator.addEventListener('input', (e) => {
          slider.value = e.target.value;
        }, false);


        //slider
        slider.classList.remove('parameter');
        slider.addEventListener('input', (e)=>{
          valueIndicator.value = e.target.value;
        }, false);

        return {slider, label, valueIndicator};
      }

      return {slider};
    }


    //Button control
    static renderButton(id, text, className) {
      var elem = document.getElementById(id);
      var input = document.createElement('input');
      input.className = className;
      input.setAttribute('type', 'button');
      input.value = text;
      elem.appendChild(input);
      return input;
    }


    //TODO: Select control

  }

  class Patch {

    constructor(){
      this._patch = {};
    }

    updatePatch(prop, value) {
      this._patch[prop] = value;
    }

    getPatch() {
      return this._patch;
    }
  }
  class AudioComponent {
    constructor(id, settings, ctx) {
      this.id = id;
      this.settings = settings;
      this.ctx = ctx;
    }
    getId() {
      return this.id;
    }
  }

  class Oscillator extends AudioComponent{

    constructor(id, settings, ctx) {
      super(id, settings, ctx);

      this._osc = ctx.createOscillator();
      this._gain = ctx.createGain();
      this.ctx = ctx;
    }

    setGain(value) {
        this._gain.gain.value = value;
    }

    setFreq(value) {
      this._osc.frequency.value = value;
    }

    connect(node) {
      this._gain.connect(node);
    }

    disconnect(node) {
      this._gain.disconnect(node);
    }

    start() {
      this._osc.start();
    }

    init() {
      //Oscillator
      this._osc.type = this.settings.type;
      this._osc.frequency.value = this.settings.frequency;

      //Gain
      this._gain.gain.value = this.settings.gain;
      this._osc.connect(this._gain);

      return this._osc;
    }


    render() {
      var slider = HtmlRenderer.renderSlider({
        id: this.id + '_input',
        labelText: 'gain: ',
        className: 'sdf',
        min:0,
        max:1,
        step:.1,
        value:.7,
        advanced: true
      });
      document.getElementById('Osc1_gain').className = 'parameter';
      for(let elem in slider) {

        document.getElementById('Osc1_gain').appendChild(slider[elem]);
      }
      var btn = HtmlRenderer.renderButton(this.id, 'on/off', 'switch');
      btn.addEventListener('click', (function(e) {
        if(this._gain.gain.value !=0 ) {
          this._gain.gain.value = 0;
        } else {
          this._gain.gain.value = 1;
        }
      }).bind(this), false);
    }
  }


  //debugger;

  window.onload = function() {
    var ctx = new AudioContext();
    var osc1 = new Oscillator('Osc1', {type: 'sine', frequency: 70, gain: 0}, ctx);
    var patch = new Patch();
    //var components = {};
    osc1.render();
    osc1.init();
    osc1.connect(ctx.destination);
    osc1.start();


    //components[osc1.getId() +'_gain'] = osc1;

    var params = document.getElementsByClassName('parameter');
    //[TODO] use Array.from(arrLikeObj, function(v){}) when it's implemented in babel
    [].forEach.call(params, function(v){
      v.addEventListener('input', (e) => {


        patch.updatePatch(e.target.parentNode.id, e.target.value);
        //components[e.target.parentNode.id] = e.target.value;
        console.log('get patch:',patch.getPatch());
        //console.log(components);
        osc1.setGain(e.target.value);
      }, false);
    });


    // class Synth {
    //   constructor(){
    //     this._components = {};
    //     var osc;
    //   }
    //
    // }

  }
})(window.ns || {});
