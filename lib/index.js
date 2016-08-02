'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _punycode = require('punycode');

var _punycode2 = _interopRequireDefault(_punycode);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Babbler = function () {
  function Babbler(frame, origin) {
    var _this = this;

    _classCallCheck(this, Babbler);

    this._frame = frame;
    this._origin = origin;
    this._emitter = new _events2.default();
    this._messagesCount = 0;
    this._instanceNumber = Babbler._instancesCounter;
    Babbler._instancesCounter++;

    addEventListener('message', function (e) {
      var _emitter;

      if (!_this._isValid(e)) {
        return;
      }
      var _e$data = e.data;
      var commandName = _e$data.commandName;
      var params = _e$data.params;
      var sign = _e$data.sign;
      var type = _e$data.type;

      if (type == 'fetch') {
        var done = function done() {
          for (var _len = arguments.length, params = Array(_len), _key = 0; _key < _len; _key++) {
            params[_key] = arguments[_key];
          }

          _this.emit.apply(_this, [sign].concat(params));
        };
        params = [done].concat(_toConsumableArray(params));
      }
      (_emitter = _this._emitter).emit.apply(_emitter, [commandName].concat(_toConsumableArray(params)));
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
      for (var _len2 = arguments.length, params = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        params[_key2 - 1] = arguments[_key2];
      }

      this.send({ commandName: commandName, params: params });
      return this;
    }
  }, {
    key: 'cmd',
    value: function cmd(commandName) {
      var _this2 = this;

      for (var _len3 = arguments.length, params = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        params[_key3 - 1] = arguments[_key3];
      }

      var sign = this._getSign();
      return new Promise(function (resolve) {
        _this2.once(sign, function (params) {
          return resolve(params);
        });
        _this2.send({ commandName: commandName, params: params, sign: sign, type: 'fetch' });
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
      this._emitter.removeListener(commandName, fn);
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