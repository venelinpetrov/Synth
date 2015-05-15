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

      //Select control
      //TODO

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
          labelText: 'freq: ',
          className: 'sdf',
          min: 50,
          max: 1000,
          step: 10,
          value: 150,
          advanced: true
        });
        document.getElementById('Osc1_freq').className = 'parameter';
        for (var elem in slider) {

          document.getElementById('Osc1_freq').appendChild(slider[elem]);
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
    var components = {};
    console.log(osc1.getId());
    osc1.render();
    osc1.init();
    osc1.connect(ctx.destination);
    osc1.start();

    components[osc1.getId() + '_freq'] = osc1;

    var params = document.getElementsByClassName('parameter');
    //[TODO] use Array.from(arrLikeObj, function(v){}) when it's implemented in babel
    [].forEach.call(params, function (v) {
      v.addEventListener('input', function (e) {
        console.log(e);

        patch.updatePatch([e.target.parentNode.id], e.target.value);
        components[e.target.parentNode.id] = e.target.value;
        console.log(patch.getPatch());
        console.log(components);
        osc1.setFreq(e.target.value);
      }, false);
    });
    {
      console.log(a);
      var a = 1;
    }

    var Synth = function Synth() {
      _classCallCheck(this, Synth);

      this._components = {};
      var osc;
    };
  };
})(window.ns || {});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQ0EsQ0FBQyxVQUFTLEVBQUUsRUFBQztBQUNYLGNBQVksQ0FBQTs7TUFFTixZQUFZO2FBQVosWUFBWTs0QkFBWixZQUFZOzs7aUJBQVosWUFBWTs7OzthQUVHLHdCQUE0RTtnREFBSixFQUFFOztZQUF4RSxFQUFFLFFBQUYsRUFBRTtrQ0FBRSxTQUFTO1lBQVQsU0FBUyxrQ0FBQyxFQUFFO1lBQUUsU0FBUyxRQUFULFNBQVM7WUFBRSxHQUFHLFFBQUgsR0FBRztZQUFFLEdBQUcsUUFBSCxHQUFHO1lBQUUsSUFBSSxRQUFKLElBQUk7WUFBRSxLQUFLLFFBQUwsS0FBSztpQ0FBRSxRQUFRO1lBQVIsUUFBUSxpQ0FBQyxLQUFLOztBQUNyRixZQUFJLGNBQWMsQ0FBQztBQUNuQixZQUFJLEtBQUssQ0FBQztBQUNWLFlBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7OztBQUk3QyxjQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQzs7QUFFckMsY0FBTSxDQUFDLFNBQVMsR0FBRyxXQUFXLEdBQUcsR0FBRyxHQUFHLFNBQVMsQ0FBQztBQUNqRCxjQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztBQUNqQixjQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztBQUNqQixjQUFNLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNuQixjQUFNLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQzs7O0FBTXJCLFlBQUcsUUFBUSxFQUFFOztBQUVYLGVBQUssR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3hDLHdCQUFjLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7O0FBSWpELGVBQUssQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLGVBQUssQ0FBQyxJQUFJLEdBQUcsRUFBRSxHQUFHLFFBQVEsQ0FBQztBQUMzQixlQUFLLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQzs7O0FBSTlCLHdCQUFjLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztBQUM5Qyx3QkFBYyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDdkIsd0JBQWMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQ3pCLHdCQUFjLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztBQUN6Qix3QkFBYyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDN0Isd0JBQWMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQzNCLHdCQUFjLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFVBQUMsQ0FBQyxFQUFLO0FBQzlDLGtCQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO1dBQy9CLEVBQUUsS0FBSyxDQUFDLENBQUM7OztBQUlWLGdCQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNyQyxnQkFBTSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxVQUFDLENBQUMsRUFBRztBQUNwQywwQkFBYyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztXQUN2QyxFQUFFLEtBQUssQ0FBQyxDQUFDOztBQUVWLGlCQUFPLEVBQUMsTUFBTSxFQUFOLE1BQU0sRUFBRSxLQUFLLEVBQUwsS0FBSyxFQUFFLGNBQWMsRUFBZCxjQUFjLEVBQUMsQ0FBQztTQUN4Qzs7QUFFRCxlQUFPLEVBQUMsTUFBTSxFQUFOLE1BQU0sRUFBQyxDQUFDO09BQ2pCOzs7OzthQUdrQixzQkFBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRTtBQUN2QyxZQUFJLElBQUksR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZDLFlBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDNUMsYUFBSyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7QUFDNUIsYUFBSyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDckMsYUFBSyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDbkIsWUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN4QixlQUFPLEtBQUssQ0FBQztPQUNkOzs7O0FBQUE7OztXQWxFRyxZQUFZOzs7TUF3RVosS0FBSztBQUVFLGFBRlAsS0FBSyxHQUVJOzRCQUZULEtBQUs7O0FBR1AsVUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7S0FDbEI7O2lCQUpHLEtBQUs7O2FBTUUscUJBQUMsSUFBSSxFQUFFLEtBQUssRUFBRTtBQUN2QixZQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQztPQUMzQjs7O2FBRU8sb0JBQUc7QUFDVCxlQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7T0FDcEI7OztXQVpHLEtBQUs7OztNQWNMLGNBQWM7QUFDUCxhQURQLGNBQWMsQ0FDTixFQUFFLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRTs0QkFEM0IsY0FBYzs7QUFFaEIsVUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDYixVQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztBQUN6QixVQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztLQUNoQjs7aUJBTEcsY0FBYzs7YUFNYixpQkFBRztBQUNOLGVBQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQztPQUNoQjs7O1dBUkcsY0FBYzs7O01BV2QsVUFBVTtBQUVILGFBRlAsVUFBVSxDQUVGLEVBQUUsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFOzRCQUYzQixVQUFVOztBQUdaLGlDQUhFLFVBQVUsNkNBR04sRUFBRSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUU7O0FBRXpCLFVBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLGdCQUFnQixFQUFFLENBQUM7QUFDbkMsVUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDOUIsVUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7S0FDaEI7O2NBUkcsVUFBVTs7aUJBQVYsVUFBVTs7YUFVUCxpQkFBQyxLQUFLLEVBQUU7QUFDYixZQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO09BQ25DOzs7YUFFTSxpQkFBQyxJQUFJLEVBQUU7QUFDWixZQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUMxQjs7O2FBRVMsb0JBQUMsSUFBSSxFQUFFO0FBQ2YsWUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDN0I7OzthQUVJLGlCQUFHO0FBQ04sWUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztPQUNuQjs7O2FBRUcsZ0JBQUc7O0FBRUwsWUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7QUFDcEMsWUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDOzs7QUFHcEQsWUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO0FBQzNDLFlBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFOUIsZUFBTyxJQUFJLENBQUMsSUFBSSxDQUFDO09BQ2xCOzs7YUFJSyxrQkFBRztBQUNQLFlBQUksTUFBTSxHQUFHLFlBQVksQ0FBQyxZQUFZLENBQUM7QUFDckMsWUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLEdBQUcsUUFBUTtBQUN0QixtQkFBUyxFQUFFLFFBQVE7QUFDbkIsbUJBQVMsRUFBRSxLQUFLO0FBQ2hCLGFBQUcsRUFBQyxFQUFFO0FBQ04sYUFBRyxFQUFDLElBQUk7QUFDUixjQUFJLEVBQUMsRUFBRTtBQUNQLGVBQUssRUFBQyxHQUFHO0FBQ1Qsa0JBQVEsRUFBRSxJQUFJO1NBQ2YsQ0FBQyxDQUFDO0FBQ0gsZ0JBQVEsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUMsU0FBUyxHQUFHLFdBQVcsQ0FBQztBQUM3RCxhQUFJLElBQUksSUFBSSxJQUFJLE1BQU0sRUFBRTs7QUFFdEIsa0JBQVEsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQ2hFO0FBQ0QsWUFBSSxHQUFHLEdBQUcsWUFBWSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNqRSxXQUFHLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUMsVUFBUyxDQUFDLEVBQUU7QUFDekMsY0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUcsQ0FBQyxFQUFHO0FBQzdCLGdCQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1dBQzNCLE1BQU07QUFDTCxnQkFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztXQUMzQjtTQUNGLENBQUEsQ0FBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7T0FDdkI7OztXQWhFRyxVQUFVO0tBQVMsY0FBYzs7OztBQXNFdkMsUUFBTSxDQUFDLE1BQU0sR0FBRyxZQUFXO0FBQ3pCLFFBQUksR0FBRyxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7QUFDN0IsUUFBSSxJQUFJLEdBQUcsSUFBSSxVQUFVLENBQUMsTUFBTSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUMvRSxRQUFJLEtBQUssR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO0FBQ3hCLFFBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztBQUNwQixXQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBQzFCLFFBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNkLFFBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNaLFFBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzlCLFFBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7QUFHYixjQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFFLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQzs7QUFFekMsUUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLHNCQUFzQixDQUFDLFdBQVcsQ0FBQyxDQUFDOztBQUUxRCxNQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBUyxDQUFDLEVBQUM7QUFDakMsT0FBQyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxVQUFDLENBQUMsRUFBSztBQUNqQyxlQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVmLGFBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzVELGtCQUFVLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7QUFDcEQsZUFBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztBQUM5QixlQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3hCLFlBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUM5QixFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQ1gsQ0FBQyxDQUFDO0FBQ0g7QUFDQSxhQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2QsVUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ1Q7O1FBQ0ssS0FBSyxHQUNFLFNBRFAsS0FBSyxHQUNJOzRCQURULEtBQUs7O0FBRVAsVUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7QUFDdEIsVUFBSSxHQUFHLENBQUM7S0FDVDtHQUlKLENBQUE7Q0FDRixDQUFBLENBQUUsTUFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyIsImZpbGUiOiJzY3JpcHQtY29tcGlsZWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcclxuKGZ1bmN0aW9uKG5zKXtcclxuICAndXNlIHN0cmljdCdcclxuXHJcbiAgY2xhc3MgSHRtbFJlbmRlcmVyIHtcclxuICAgIC8vU2xpZGVyIGNvbnRyb2xcclxuICAgIHN0YXRpYyByZW5kZXJTbGlkZXIoe2lkLCBjbGFzc05hbWU9JycsIGxhYmVsVGV4dCwgbWluLCBtYXgsIHN0ZXAsIHZhbHVlLCBhZHZhbmNlZD1mYWxzZX0gPSB7fSkge1xyXG4gICAgICB2YXIgdmFsdWVJbmRpY2F0b3I7XHJcbiAgICAgIHZhciBsYWJlbDtcclxuICAgICAgdmFyIHNsaWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcblxyXG5cclxuICAgICAgLy9zaW1wbGUgc2xpZGVyXHJcbiAgICAgIHNsaWRlci5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAncmFuZ2UnKTtcclxuICAgICAgLy9zbGlkZXIuaWQgPSBpZDtcclxuICAgICAgc2xpZGVyLmNsYXNzTmFtZSA9ICdwYXJhbWV0ZXInICsgJyAnICsgY2xhc3NOYW1lO1xyXG4gICAgICBzbGlkZXIubWluID0gbWluO1xyXG4gICAgICBzbGlkZXIubWF4ID0gbWF4O1xyXG4gICAgICBzbGlkZXIuc3RlcCA9IHN0ZXA7XHJcbiAgICAgIHNsaWRlci52YWx1ZSA9IHZhbHVlO1xyXG5cclxuXHJcblxyXG5cclxuICAgICAgLy9hZHZhbmNlZCBzbGlkZXJcclxuICAgICAgaWYoYWR2YW5jZWQpIHtcclxuICAgICAgICAvL2NyZWF0ZSBodG1sIGVsZW1lbnRzXHJcbiAgICAgICAgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xyXG4gICAgICAgIHZhbHVlSW5kaWNhdG9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuXHJcblxyXG4gICAgICAgIC8vbGFiZWxcclxuICAgICAgICBsYWJlbC5zZXRBdHRyaWJ1dGUoJ2ZvcicsIGlkKTtcclxuICAgICAgICBsYWJlbC5uYW1lID0gaWQgKyAnX2xhYmVsJztcclxuICAgICAgICBsYWJlbC50ZXh0Q29udGVudCA9IGxhYmVsVGV4dDtcclxuXHJcblxyXG4gICAgICAgIC8vdmFsdWUgaW5kaWNhdG9yXHJcbiAgICAgICAgdmFsdWVJbmRpY2F0b3Iuc2V0QXR0cmlidXRlKCd0eXBlJywgJ251bWJlcicpO1xyXG4gICAgICAgIHZhbHVlSW5kaWNhdG9yLmlkID0gaWQ7XHJcbiAgICAgICAgdmFsdWVJbmRpY2F0b3IubWluID0gbWluO1xyXG4gICAgICAgIHZhbHVlSW5kaWNhdG9yLm1heCA9IG1heDtcclxuICAgICAgICB2YWx1ZUluZGljYXRvci52YWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgIHZhbHVlSW5kaWNhdG9yLnN0ZXAgPSBzdGVwO1xyXG4gICAgICAgIHZhbHVlSW5kaWNhdG9yLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHtcclxuICAgICAgICAgIHNsaWRlci52YWx1ZSA9IGUudGFyZ2V0LnZhbHVlO1xyXG4gICAgICAgIH0sIGZhbHNlKTtcclxuXHJcblxyXG4gICAgICAgIC8vc2xpZGVyXHJcbiAgICAgICAgc2xpZGVyLmNsYXNzTGlzdC5yZW1vdmUoJ3BhcmFtZXRlcicpO1xyXG4gICAgICAgIHNsaWRlci5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKT0+e1xyXG4gICAgICAgICAgdmFsdWVJbmRpY2F0b3IudmFsdWUgPSBlLnRhcmdldC52YWx1ZTtcclxuICAgICAgICB9LCBmYWxzZSk7XHJcblxyXG4gICAgICAgIHJldHVybiB7c2xpZGVyLCBsYWJlbCwgdmFsdWVJbmRpY2F0b3J9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4ge3NsaWRlcn07XHJcbiAgICB9XHJcblxyXG4gICAgLy9CdXR0b24gY29udHJvbFxyXG4gICAgc3RhdGljIHJlbmRlckJ1dHRvbihpZCwgdGV4dCwgY2xhc3NOYW1lKSB7XHJcbiAgICAgIHZhciBlbGVtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xyXG4gICAgICB2YXIgaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xyXG4gICAgICBpbnB1dC5jbGFzc05hbWUgPSBjbGFzc05hbWU7XHJcbiAgICAgIGlucHV0LnNldEF0dHJpYnV0ZSgndHlwZScsICdidXR0b24nKTtcclxuICAgICAgaW5wdXQudmFsdWUgPSB0ZXh0O1xyXG4gICAgICBlbGVtLmFwcGVuZENoaWxkKGlucHV0KTtcclxuICAgICAgcmV0dXJuIGlucHV0O1xyXG4gICAgfVxyXG5cclxuICAgIC8vU2VsZWN0IGNvbnRyb2xcclxuICAgIC8vVE9ET1xyXG4gIH1cclxuXHJcbiAgY2xhc3MgUGF0Y2gge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgIHRoaXMuX3BhdGNoID0ge307XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlUGF0Y2gocHJvcCwgdmFsdWUpIHtcclxuICAgICAgdGhpcy5fcGF0Y2hbcHJvcF0gPSB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRQYXRjaCgpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX3BhdGNoO1xyXG4gICAgfVxyXG4gIH1cclxuICBjbGFzcyBBdWRpb0NvbXBvbmVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcihpZCwgc2V0dGluZ3MsIGN0eCkge1xyXG4gICAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICAgIHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcclxuICAgICAgdGhpcy5jdHggPSBjdHg7XHJcbiAgICB9XHJcbiAgICBnZXRJZCgpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuaWQ7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjbGFzcyBPc2NpbGxhdG9yIGV4dGVuZHMgQXVkaW9Db21wb25lbnR7XHJcblxyXG4gICAgY29uc3RydWN0b3IoaWQsIHNldHRpbmdzLCBjdHgpIHtcclxuICAgICAgc3VwZXIoaWQsIHNldHRpbmdzLCBjdHgpO1xyXG5cclxuICAgICAgdGhpcy5fb3NjID0gY3R4LmNyZWF0ZU9zY2lsbGF0b3IoKTtcclxuICAgICAgdGhpcy5fZ2FpbiA9IGN0eC5jcmVhdGVHYWluKCk7XHJcbiAgICAgIHRoaXMuY3R4ID0gY3R4O1xyXG4gICAgfVxyXG5cclxuICAgIHNldEZyZXEodmFsdWUpIHtcclxuICAgICAgdGhpcy5fb3NjLmZyZXF1ZW5jeS52YWx1ZSA9IHZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbm5lY3Qobm9kZSkge1xyXG4gICAgICB0aGlzLl9nYWluLmNvbm5lY3Qobm9kZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZGlzY29ubmVjdChub2RlKSB7XHJcbiAgICAgIHRoaXMuX2dhaW4uZGlzY29ubmVjdChub2RlKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgdGhpcy5fb3NjLnN0YXJ0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdCgpIHtcclxuICAgICAgLy9Pc2NpbGxhdG9yXHJcbiAgICAgIHRoaXMuX29zYy50eXBlID0gdGhpcy5zZXR0aW5ncy50eXBlO1xyXG4gICAgICB0aGlzLl9vc2MuZnJlcXVlbmN5LnZhbHVlID0gdGhpcy5zZXR0aW5ncy5mcmVxdWVuY3k7XHJcblxyXG4gICAgICAvL0dhaW5cclxuICAgICAgdGhpcy5fZ2Fpbi5nYWluLnZhbHVlID0gdGhpcy5zZXR0aW5ncy5nYWluO1xyXG4gICAgICB0aGlzLl9vc2MuY29ubmVjdCh0aGlzLl9nYWluKTtcclxuXHJcbiAgICAgIHJldHVybiB0aGlzLl9vc2M7XHJcbiAgICB9XHJcblxyXG5cclxuXHJcbiAgICByZW5kZXIoKSB7XHJcbiAgICAgIHZhciBzbGlkZXIgPSBIdG1sUmVuZGVyZXIucmVuZGVyU2xpZGVyKHtcclxuICAgICAgICBpZDogdGhpcy5pZCArICdfaW5wdXQnLFxyXG4gICAgICAgIGxhYmVsVGV4dDogJ2ZyZXE6ICcsXHJcbiAgICAgICAgY2xhc3NOYW1lOiAnc2RmJyxcclxuICAgICAgICBtaW46NTAsXHJcbiAgICAgICAgbWF4OjEwMDAsXHJcbiAgICAgICAgc3RlcDoxMCxcclxuICAgICAgICB2YWx1ZToxNTAsXHJcbiAgICAgICAgYWR2YW5jZWQ6IHRydWVcclxuICAgICAgfSk7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdPc2MxX2ZyZXEnKS5jbGFzc05hbWUgPSAncGFyYW1ldGVyJztcclxuICAgICAgZm9yKGxldCBlbGVtIGluIHNsaWRlcikge1xyXG5cclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnT3NjMV9mcmVxJykuYXBwZW5kQ2hpbGQoc2xpZGVyW2VsZW1dKTtcclxuICAgICAgfVxyXG4gICAgICB2YXIgYnRuID0gSHRtbFJlbmRlcmVyLnJlbmRlckJ1dHRvbih0aGlzLmlkLCAnb24vb2ZmJywgJ3N3aXRjaCcpO1xyXG4gICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIGlmKHRoaXMuX2dhaW4uZ2Fpbi52YWx1ZSAhPTAgKSB7XHJcbiAgICAgICAgICB0aGlzLl9nYWluLmdhaW4udmFsdWUgPSAwO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLl9nYWluLmdhaW4udmFsdWUgPSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgfSkuYmluZCh0aGlzKSwgZmFsc2UpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcblxyXG4gIC8vZGVidWdnZXI7XHJcblxyXG4gIHdpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBjdHggPSBuZXcgQXVkaW9Db250ZXh0KCk7XHJcbiAgICB2YXIgb3NjMSA9IG5ldyBPc2NpbGxhdG9yKCdPc2MxJywge3R5cGU6ICdzaW5lJywgZnJlcXVlbmN5OiA3MCwgZ2FpbjogMH0sIGN0eCk7XHJcbiAgICB2YXIgcGF0Y2ggPSBuZXcgUGF0Y2goKTtcclxuICAgIHZhciBjb21wb25lbnRzID0ge307XHJcbiAgICBjb25zb2xlLmxvZyhvc2MxLmdldElkKCkpO1xyXG4gICAgb3NjMS5yZW5kZXIoKTtcclxuICAgIG9zYzEuaW5pdCgpO1xyXG4gICAgb3NjMS5jb25uZWN0KGN0eC5kZXN0aW5hdGlvbik7XHJcbiAgICBvc2MxLnN0YXJ0KCk7XHJcblxyXG5cclxuICAgIGNvbXBvbmVudHNbb3NjMS5nZXRJZCgpICsnX2ZyZXEnXSA9IG9zYzE7XHJcblxyXG4gICAgdmFyIHBhcmFtcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3BhcmFtZXRlcicpO1xyXG4gICAgLy9bVE9ET10gdXNlIEFycmF5LmZyb20oYXJyTGlrZU9iaiwgZnVuY3Rpb24odil7fSkgd2hlbiBpdCdzIGltcGxlbWVudGVkIGluIGJhYmVsXHJcbiAgICBbXS5mb3JFYWNoLmNhbGwocGFyYW1zLCBmdW5jdGlvbih2KXtcclxuICAgICAgdi5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coZSk7XHJcblxyXG4gICAgICAgIHBhdGNoLnVwZGF0ZVBhdGNoKFtlLnRhcmdldC5wYXJlbnROb2RlLmlkXSwgZS50YXJnZXQudmFsdWUpO1xyXG4gICAgICAgIGNvbXBvbmVudHNbZS50YXJnZXQucGFyZW50Tm9kZS5pZF0gPSBlLnRhcmdldC52YWx1ZTtcclxuICAgICAgICBjb25zb2xlLmxvZyhwYXRjaC5nZXRQYXRjaCgpKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhjb21wb25lbnRzKTtcclxuICAgICAgICBvc2MxLnNldEZyZXEoZS50YXJnZXQudmFsdWUpO1xyXG4gICAgICB9LCBmYWxzZSk7XHJcbiAgICB9KTtcclxuICAgIHtcclxuICAgIGNvbnNvbGUubG9nKGEpXHJcbiAgICBsZXQgYSA9IDE7XHJcbiAgICB9XHJcbiAgICBjbGFzcyBTeW50aCB7XHJcbiAgICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgdGhpcy5fY29tcG9uZW50cyA9IHt9O1xyXG4gICAgICAgIHZhciBvc2M7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gIH1cclxufSkod2luZG93Lm5zIHx8IHt9KTtcclxuIl19