'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SimpleEventEmitter = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _punycode = require('punycode');

var _punycode2 = _interopRequireDefault(_punycode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SimpleEventEmitter = exports.SimpleEventEmitter = function () {
  function SimpleEventEmitter() {
    _classCallCheck(this, SimpleEventEmitter);

    this._map = new Map();
  }

  _createClass(SimpleEventEmitter, [{
    key: 'listeners',
    value: function listeners(name) {
      var listeners = this._map.get(name);
      if (!listeners) {
        listeners = new Set();
        this._map.set(name, listeners);
      }
      return listeners;
    }
  }, {
    key: 'on',
    value: function on(name, fn) {
      this.listeners(name).add(fn);
    }
  }, {
    key: 'off',
    value: function off(name, fn) {
      if (typeof fn !== 'undefined') {
        this.listeners(name).delete(fn);
      } else {
        this._map.delete(name);
      }
    }
  }, {
    key: 'once',
    value: function once(name, fn) {
      var listeners = this.listeners(name);

      function wrapped() {
        fn.call.apply(fn, [this].concat(Array.prototype.slice.call(arguments)));
        listeners.delete(wrapped);
      }

      listeners.add(wrapped);
    }
  }, {
    key: 'emit',
    value: function emit(name) {
      for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        params[_key - 1] = arguments[_key];
      }

      this.emitWithContext.apply(this, [name, this].concat(params));
    }
  }, {
    key: 'emitWithContext',
    value: function emitWithContext(name, context) {
      for (var _len2 = arguments.length, params = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        params[_key2 - 2] = arguments[_key2];
      }

      this.listeners(name).forEach(function (fn) {
        return fn.call.apply(fn, [context].concat(params));
      });
    }
  }]);

  return SimpleEventEmitter;
}();

var Babbler = function () {
  function Babbler(frame, origin) {
    var _this = this;

    _classCallCheck(this, Babbler);

    this._frame = frame;
    this._origin = origin;
    this._emitter = new SimpleEventEmitter();
    this._messagesCount = 0;
    this._instanceNumber = Babbler._instancesCounter;
    Babbler._instancesCounter++;

    addEventListener('message', function (e) {
      var _emitter2;

      if (!_this._isValid(e)) {
        return;
      }
      var _e$data = e.data;
      var commandName = _e$data.commandName;
      var params = _e$data.params;
      var sign = _e$data.sign;
      var type = _e$data.type;


      if (type == 'cmd') {
        var _emitter;

        var resolve = function resolve() {
          for (var _len3 = arguments.length, params = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            params[_key3] = arguments[_key3];
          }

          _this.send({ commandName: sign, params: params, type: 'resolve' });
        };

        var reject = function reject() {
          for (var _len4 = arguments.length, params = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            params[_key4] = arguments[_key4];
          }

          _this.send({ commandName: sign, params: params, type: 'reject' });
        };

        (_emitter = _this._emitter).emitWithContext.apply(_emitter, [commandName, { resolve: resolve, reject: reject }].concat(_toConsumableArray(params)));
        return;
      }

      (_emitter2 = _this._emitter).emit.apply(_emitter2, [commandName].concat(_toConsumableArray(params)));
    });
  }

  _createClass(Babbler, [{
    key: 'send',
    value: function send(params) {
      this._frame.postMessage(params, this._origin);
      this._messagesCount++;
      return this;
    }
  }, {
    key: 'emit',
    value: function emit(commandName) {
      for (var _len5 = arguments.length, params = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
        params[_key5 - 1] = arguments[_key5];
      }

      this.send({ commandName: commandName, params: params });
      return this;
    }
  }, {
    key: 'cmd',
    value: function cmd(commandName) {
      var _this2 = this;

      for (var _len6 = arguments.length, params = Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
        params[_key6 - 1] = arguments[_key6];
      }

      var sign = this._getSign();
      return new Promise(function (resolve) {
        _this2.once(sign, function (params) {
          return resolve(params);
        });
        _this2.send({ commandName: commandName, params: params, sign: sign, type: 'cmd' });
      });
    }
  }, {
    key: 'on',
    value: function on(commandName, fn) {
      this._emitter.on(commandName, fn);
      return this;
    }
  }, {
    key: 'off',
    value: function off(commandName, fn) {
      this._emitter.off(commandName, fn);
      return this;
    }
  }, {
    key: 'once',
    value: function once(commandName, fn) {
      this._emitter.once(commandName, fn);
      return this;
    }
  }, {
    key: '_getSign',
    value: function _getSign() {
      return '__babbler__' + this._instanceNumber + '__' + this._messagesCount;
    }
  }, {
    key: '_isValid',
    value: function _isValid(e) {
      if (!e.data.commandName) {
        return false;
      }
      var origin = _punycode2.default.toUnicode(e.origin);
      if (this._origin !== '*' && this._origin !== origin) {
        return false;
      }
      return true;
    }
  }]);

  return Babbler;
}();

Babbler._instancesCounter = 0;
exports.default = Babbler;