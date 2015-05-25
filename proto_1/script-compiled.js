'use strict';

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

(function (ns) {
  'use strict';

  var HtmlRenderer = (function () {
    function HtmlRenderer() {
      _classCallCheck(this, HtmlRenderer);
    }

    _createClass(HtmlRenderer, null, [{
      key: 'renderSlider',

      //Slider control
      value: function renderSlider() {
        var _ref = arguments[0] === undefined ? {} : arguments[0];

        var id = _ref.id;
        var _ref$className = _ref.className;
        var className = _ref$className === undefined ? '' : _ref$className;
        var labelText = _ref.labelText;
        var min = _ref.min;
        var max = _ref.max;
        var step = _ref.step;
        var value = _ref.value;
        var _ref$advanced = _ref.advanced;
        var advanced = _ref$advanced === undefined ? false : _ref$advanced;

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
        if (advanced) {
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
          valueIndicator.addEventListener('input', function (e) {
            slider.value = e.target.value;
          }, false);

          //slider
          slider.classList.remove('parameter');
          slider.addEventListener('input', function (e) {
            valueIndicator.value = e.target.value;
          }, false);

          return { slider: slider, label: label, valueIndicator: valueIndicator };
        }

        return { slider: slider };
      }
    }, {
      key: 'renderButton',

      //Button control
      value: function renderButton(id, text, className) {
        var elem = document.getElementById(id);
        var input = document.createElement('input');
        input.className = className;
        input.setAttribute('type', 'button');
        input.value = text;
        elem.appendChild(input);
        return input;
      }

      //TODO: Select control

    }]);

    return HtmlRenderer;
  })();

  var Patch = (function () {
    function Patch() {
      _classCallCheck(this, Patch);

      this._patch = {};
    }

    _createClass(Patch, [{
      key: 'updatePatch',
      value: function updatePatch(prop, value) {
        this._patch[prop] = value;
      }
    }, {
      key: 'getPatch',
      value: function getPatch() {
        return this._patch;
      }
    }]);

    return Patch;
  })();

  var AudioComponent = (function () {
    function AudioComponent(id, settings, ctx) {
      _classCallCheck(this, AudioComponent);

      this.id = id;
      this.settings = settings;
      this.ctx = ctx;
    }

    _createClass(AudioComponent, [{
      key: 'getId',
      value: function getId() {
        return this.id;
      }
    }]);

    return AudioComponent;
  })();

  var Oscillator = (function (_AudioComponent) {
    function Oscillator(id, settings, ctx) {
      _classCallCheck(this, Oscillator);

      _get(Object.getPrototypeOf(Oscillator.prototype), 'constructor', this).call(this, id, settings, ctx);

      this._osc = ctx.createOscillator();
      this._gain = ctx.createGain();
      this.ctx = ctx;
    }

    _inherits(Oscillator, _AudioComponent);

    _createClass(Oscillator, [{
      key: 'setGain',
      value: function setGain(value) {
        this._gain.gain.value = value;
      }
    }, {
      key: 'setFreq',
      value: function setFreq(value) {
        this._osc.frequency.value = value;
      }
    }, {
      key: 'connect',
      value: function connect(node) {
        this._gain.connect(node);
      }
    }, {
      key: 'disconnect',
      value: function disconnect(node) {
        this._gain.disconnect(node);
      }
    }, {
      key: 'start',
      value: function start() {
        this._osc.start();
      }
    }, {
      key: 'init',
      value: function init() {
        //Oscillator
        this._osc.type = this.settings.type;
        this._osc.frequency.value = this.settings.frequency;

        //Gain
        this._gain.gain.value = this.settings.gain;
        this._osc.connect(this._gain);

        return this._osc;
      }
    }, {
      key: 'render',
      value: function render() {
        var slider = HtmlRenderer.renderSlider({
          id: this.id + '_input',
          labelText: 'gain: ',
          className: 'sdf',
          min: 0,
          max: 1,
          step: 0.1,
          value: 0.7,
          advanced: true
        });
        document.getElementById('Osc1_gain').className = 'parameter';
        for (var elem in slider) {

          document.getElementById('Osc1_gain').appendChild(slider[elem]);
        }
        var btn = HtmlRenderer.renderButton(this.id, 'on/off', 'switch');
        btn.addEventListener('click', (function (e) {
          if (this._gain.gain.value != 0) {
            this._gain.gain.value = 0;
          } else {
            this._gain.gain.value = 1;
          }
        }).bind(this), false);
      }
    }]);

    return Oscillator;
  })(AudioComponent);

  //debugger;

  window.onload = function () {
    var ctx = new AudioContext();
    var osc1 = new Oscillator('Osc1', { type: 'sine', frequency: 70, gain: 0 }, ctx);
    var patch = new Patch();
    //var components = {};
    osc1.render();
    osc1.init();
    osc1.connect(ctx.destination);
    osc1.start();

    //components[osc1.getId() +'_gain'] = osc1;

    var params = document.getElementsByClassName('parameter');
    //[TODO] use Array.from(arrLikeObj, function(v){}) when it's implemented in babel
    [].forEach.call(params, function (v) {
      v.addEventListener('input', function (e) {

        patch.updatePatch(e.target.parentNode.id, e.target.value);
        //components[e.target.parentNode.id] = e.target.value;
        console.log('get patch:', patch.getPatch());
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
  };
})(window.ns || {});

//# sourceMappingURL=data:application/json;base64,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e1xyXG4gICd1c2Ugc3RyaWN0J1xyXG5cclxuICBjbGFzcyBIdG1sUmVuZGVyZXIge1xyXG4gICAgLy9TbGlkZXIgY29udHJvbFxyXG4gICAgc3RhdGljIHJlbmRlclNsaWRlcih7aWQsIGNsYXNzTmFtZT0nJywgbGFiZWxUZXh0LCBtaW4sIG1heCwgc3RlcCwgdmFsdWUsIGFkdmFuY2VkPWZhbHNlfSA9IHt9KSB7XHJcbiAgICAgIHZhciB2YWx1ZUluZGljYXRvcjtcclxuICAgICAgdmFyIGxhYmVsO1xyXG4gICAgICB2YXIgc2xpZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuXHJcblxyXG4gICAgICAvL3NpbXBsZSBzbGlkZXJcclxuICAgICAgc2xpZGVyLnNldEF0dHJpYnV0ZSgndHlwZScsICdyYW5nZScpO1xyXG4gICAgICAvL3NsaWRlci5pZCA9IGlkO1xyXG4gICAgICBzbGlkZXIuY2xhc3NOYW1lID0gJ3BhcmFtZXRlcicgKyAnICcgKyBjbGFzc05hbWU7XHJcbiAgICAgIHNsaWRlci5taW4gPSBtaW47XHJcbiAgICAgIHNsaWRlci5tYXggPSBtYXg7XHJcbiAgICAgIHNsaWRlci5zdGVwID0gc3RlcDtcclxuICAgICAgc2xpZGVyLnZhbHVlID0gdmFsdWU7XHJcblxyXG5cclxuICAgICAgLy9hZHZhbmNlZCBzbGlkZXJcclxuICAgICAgaWYoYWR2YW5jZWQpIHtcclxuICAgICAgICAvL2NyZWF0ZSBodG1sIGVsZW1lbnRzXHJcbiAgICAgICAgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xyXG4gICAgICAgIHZhbHVlSW5kaWNhdG9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuXHJcblxyXG4gICAgICAgIC8vbGFiZWxcclxuICAgICAgICBsYWJlbC5zZXRBdHRyaWJ1dGUoJ2ZvcicsIGlkKTtcclxuICAgICAgICBsYWJlbC5uYW1lID0gaWQgKyAnX2xhYmVsJztcclxuICAgICAgICBsYWJlbC50ZXh0Q29udGVudCA9IGxhYmVsVGV4dDtcclxuXHJcblxyXG4gICAgICAgIC8vdmFsdWUgaW5kaWNhdG9yXHJcbiAgICAgICAgdmFsdWVJbmRpY2F0b3Iuc2V0QXR0cmlidXRlKCd0eXBlJywgJ251bWJlcicpO1xyXG4gICAgICAgIHZhbHVlSW5kaWNhdG9yLmlkID0gaWQ7XHJcbiAgICAgICAgdmFsdWVJbmRpY2F0b3IubWluID0gbWluO1xyXG4gICAgICAgIHZhbHVlSW5kaWNhdG9yLm1heCA9IG1heDtcclxuICAgICAgICB2YWx1ZUluZGljYXRvci52YWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgIHZhbHVlSW5kaWNhdG9yLnN0ZXAgPSBzdGVwO1xyXG4gICAgICAgIHZhbHVlSW5kaWNhdG9yLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHtcclxuICAgICAgICAgIHNsaWRlci52YWx1ZSA9IGUudGFyZ2V0LnZhbHVlO1xyXG4gICAgICAgIH0sIGZhbHNlKTtcclxuXHJcblxyXG4gICAgICAgIC8vc2xpZGVyXHJcbiAgICAgICAgc2xpZGVyLmNsYXNzTGlzdC5yZW1vdmUoJ3BhcmFtZXRlcicpO1xyXG4gICAgICAgIHNsaWRlci5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKT0+e1xyXG4gICAgICAgICAgdmFsdWVJbmRpY2F0b3IudmFsdWUgPSBlLnRhcmdldC52YWx1ZTtcclxuICAgICAgICB9LCBmYWxzZSk7XHJcblxyXG4gICAgICAgIHJldHVybiB7c2xpZGVyLCBsYWJlbCwgdmFsdWVJbmRpY2F0b3J9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4ge3NsaWRlcn07XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vQnV0dG9uIGNvbnRyb2xcclxuICAgIHN0YXRpYyByZW5kZXJCdXR0b24oaWQsIHRleHQsIGNsYXNzTmFtZSkge1xyXG4gICAgICB2YXIgZWxlbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcclxuICAgICAgdmFyIGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgICAgaW5wdXQuY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xyXG4gICAgICBpbnB1dC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAnYnV0dG9uJyk7XHJcbiAgICAgIGlucHV0LnZhbHVlID0gdGV4dDtcclxuICAgICAgZWxlbS5hcHBlbmRDaGlsZChpbnB1dCk7XHJcbiAgICAgIHJldHVybiBpbnB1dDtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLy9UT0RPOiBTZWxlY3QgY29udHJvbFxyXG5cclxuICB9XHJcblxyXG4gIGNsYXNzIFBhdGNoIHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICB0aGlzLl9wYXRjaCA9IHt9O1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZVBhdGNoKHByb3AsIHZhbHVlKSB7XHJcbiAgICAgIHRoaXMuX3BhdGNoW3Byb3BdID0gdmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0UGF0Y2goKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLl9wYXRjaDtcclxuICAgIH1cclxuICB9XHJcbiAgY2xhc3MgQXVkaW9Db21wb25lbnQge1xyXG4gICAgY29uc3RydWN0b3IoaWQsIHNldHRpbmdzLCBjdHgpIHtcclxuICAgICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgICB0aGlzLnNldHRpbmdzID0gc2V0dGluZ3M7XHJcbiAgICAgIHRoaXMuY3R4ID0gY3R4O1xyXG4gICAgfVxyXG4gICAgZ2V0SWQoKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmlkO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY2xhc3MgT3NjaWxsYXRvciBleHRlbmRzIEF1ZGlvQ29tcG9uZW50e1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGlkLCBzZXR0aW5ncywgY3R4KSB7XHJcbiAgICAgIHN1cGVyKGlkLCBzZXR0aW5ncywgY3R4KTtcclxuXHJcbiAgICAgIHRoaXMuX29zYyA9IGN0eC5jcmVhdGVPc2NpbGxhdG9yKCk7XHJcbiAgICAgIHRoaXMuX2dhaW4gPSBjdHguY3JlYXRlR2FpbigpO1xyXG4gICAgICB0aGlzLmN0eCA9IGN0eDtcclxuICAgIH1cclxuXHJcbiAgICBzZXRHYWluKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5fZ2Fpbi5nYWluLnZhbHVlID0gdmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0RnJlcSh2YWx1ZSkge1xyXG4gICAgICB0aGlzLl9vc2MuZnJlcXVlbmN5LnZhbHVlID0gdmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgY29ubmVjdChub2RlKSB7XHJcbiAgICAgIHRoaXMuX2dhaW4uY29ubmVjdChub2RlKTtcclxuICAgIH1cclxuXHJcbiAgICBkaXNjb25uZWN0KG5vZGUpIHtcclxuICAgICAgdGhpcy5fZ2Fpbi5kaXNjb25uZWN0KG5vZGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICB0aGlzLl9vc2Muc3RhcnQoKTtcclxuICAgIH1cclxuXHJcbiAgICBpbml0KCkge1xyXG4gICAgICAvL09zY2lsbGF0b3JcclxuICAgICAgdGhpcy5fb3NjLnR5cGUgPSB0aGlzLnNldHRpbmdzLnR5cGU7XHJcbiAgICAgIHRoaXMuX29zYy5mcmVxdWVuY3kudmFsdWUgPSB0aGlzLnNldHRpbmdzLmZyZXF1ZW5jeTtcclxuXHJcbiAgICAgIC8vR2FpblxyXG4gICAgICB0aGlzLl9nYWluLmdhaW4udmFsdWUgPSB0aGlzLnNldHRpbmdzLmdhaW47XHJcbiAgICAgIHRoaXMuX29zYy5jb25uZWN0KHRoaXMuX2dhaW4pO1xyXG5cclxuICAgICAgcmV0dXJuIHRoaXMuX29zYztcclxuICAgIH1cclxuXHJcblxyXG4gICAgcmVuZGVyKCkge1xyXG4gICAgICB2YXIgc2xpZGVyID0gSHRtbFJlbmRlcmVyLnJlbmRlclNsaWRlcih7XHJcbiAgICAgICAgaWQ6IHRoaXMuaWQgKyAnX2lucHV0JyxcclxuICAgICAgICBsYWJlbFRleHQ6ICdnYWluOiAnLFxyXG4gICAgICAgIGNsYXNzTmFtZTogJ3NkZicsXHJcbiAgICAgICAgbWluOjAsXHJcbiAgICAgICAgbWF4OjEsXHJcbiAgICAgICAgc3RlcDouMSxcclxuICAgICAgICB2YWx1ZTouNyxcclxuICAgICAgICBhZHZhbmNlZDogdHJ1ZVxyXG4gICAgICB9KTtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ09zYzFfZ2FpbicpLmNsYXNzTmFtZSA9ICdwYXJhbWV0ZXInO1xyXG4gICAgICBmb3IobGV0IGVsZW0gaW4gc2xpZGVyKSB7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdPc2MxX2dhaW4nKS5hcHBlbmRDaGlsZChzbGlkZXJbZWxlbV0pO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBidG4gPSBIdG1sUmVuZGVyZXIucmVuZGVyQnV0dG9uKHRoaXMuaWQsICdvbi9vZmYnLCAnc3dpdGNoJyk7XHJcbiAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgaWYodGhpcy5fZ2Fpbi5nYWluLnZhbHVlICE9MCApIHtcclxuICAgICAgICAgIHRoaXMuX2dhaW4uZ2Fpbi52YWx1ZSA9IDA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuX2dhaW4uZ2Fpbi52YWx1ZSA9IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KS5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuXHJcbiAgLy9kZWJ1Z2dlcjtcclxuXHJcbiAgd2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGN0eCA9IG5ldyBBdWRpb0NvbnRleHQoKTtcclxuICAgIHZhciBvc2MxID0gbmV3IE9zY2lsbGF0b3IoJ09zYzEnLCB7dHlwZTogJ3NpbmUnLCBmcmVxdWVuY3k6IDcwLCBnYWluOiAwfSwgY3R4KTtcclxuICAgIHZhciBwYXRjaCA9IG5ldyBQYXRjaCgpO1xyXG4gICAgLy92YXIgY29tcG9uZW50cyA9IHt9O1xyXG4gICAgb3NjMS5yZW5kZXIoKTtcclxuICAgIG9zYzEuaW5pdCgpO1xyXG4gICAgb3NjMS5jb25uZWN0KGN0eC5kZXN0aW5hdGlvbik7XHJcbiAgICBvc2MxLnN0YXJ0KCk7XHJcblxyXG5cclxuICAgIC8vY29tcG9uZW50c1tvc2MxLmdldElkKCkgKydfZ2FpbiddID0gb3NjMTtcclxuXHJcbiAgICB2YXIgcGFyYW1zID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgncGFyYW1ldGVyJyk7XHJcbiAgICAvL1tUT0RPXSB1c2UgQXJyYXkuZnJvbShhcnJMaWtlT2JqLCBmdW5jdGlvbih2KXt9KSB3aGVuIGl0J3MgaW1wbGVtZW50ZWQgaW4gYmFiZWxcclxuICAgIFtdLmZvckVhY2guY2FsbChwYXJhbXMsIGZ1bmN0aW9uKHYpe1xyXG4gICAgICB2LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHtcclxuXHJcblxyXG4gICAgICAgIHBhdGNoLnVwZGF0ZVBhdGNoKGUudGFyZ2V0LnBhcmVudE5vZGUuaWQsIGUudGFyZ2V0LnZhbHVlKTtcclxuICAgICAgICAvL2NvbXBvbmVudHNbZS50YXJnZXQucGFyZW50Tm9kZS5pZF0gPSBlLnRhcmdldC52YWx1ZTtcclxuICAgICAgICBjb25zb2xlLmxvZygnZ2V0IHBhdGNoOicscGF0Y2guZ2V0UGF0Y2goKSk7XHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhjb21wb25lbnRzKTtcclxuICAgICAgICBvc2MxLnNldEdhaW4oZS50YXJnZXQudmFsdWUpO1xyXG4gICAgICB9LCBmYWxzZSk7XHJcbiAgICB9KTtcclxuXHJcblxyXG4gICAgLy8gY2xhc3MgU3ludGgge1xyXG4gICAgLy8gICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgLy8gICAgIHRoaXMuX2NvbXBvbmVudHMgPSB7fTtcclxuICAgIC8vICAgICB2YXIgb3NjO1xyXG4gICAgLy8gICB9XHJcbiAgICAvL1xyXG4gICAgLy8gfVxyXG5cclxuICB9XHJcbn0pKHdpbmRvdy5ucyB8fCB7fSk7XHJcbiJdfQ==