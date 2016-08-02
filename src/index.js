import punycode from 'punycode';


export class SimpleEventEmitter {

  _map = new Map();

  listeners(name) {
    let listeners = this._map.get(name);
    if (!listeners) {
      listeners = new Set();
      this._map.set(name, listeners);
    }
    return listeners;
  }


  on(name, fn) {
    this.listeners(name).add(fn);
  }


  off(name, fn) {
    if (typeof fn !== 'undefined') {
      this.listeners(name).delete(fn);
    } else {
      this._map.delete(name);
    }
  }


  once(name, fn) {
    let listeners = this.listeners(name);

    function wrapped(...args) {
      this::fn(...args);
      listeners.delete(wrapped);
    }

    listeners.add(wrapped);
  }


  emit(name, ...params) {
    this.emitWithContext(name, this, ...params);
  }


  emitWithContext(name, context, ...params) {
    this.listeners(name).forEach((fn) => context::fn(...params));
  }

}


export default class Babbler {

  static _instancesCounter = 0;

  constructor(frame, origin) {
    this._frame = frame;
    this._origin = origin;
    this._emitter = new SimpleEventEmitter();
    this._messagesCount = 0;
    this._instanceNumber = Babbler._instancesCounter;
    Babbler._instancesCounter++;

    addEventListener('message', (e) => {
      if (!this._isValid(e)) {
        return;
      }
      let {commandName, params, sign, type} = e.data;

      if (type == 'cmd') {
        let resolve = (...params) => {
          this.send({commandName: sign, params, type: 'resolve'});
        };

        let reject = (...params) => {
          this.send({commandName: sign, params, type: 'reject'});
        };

        this._emitter.emitWithContext(commandName, {resolve, reject}, ...params);
        return;
      }

      this._emitter.emit(commandName, ...params);
    });

  }


  send(params) {
    this._frame.postMessage(params, this._origin);
    this._messagesCount++;
    return this;
  }


  emit(commandName, ...params) {
    this.send({commandName, params});
    return this;
  }


  cmd(commandName, ...params) {
    let sign = this._getSign();
    return new Promise((resolve) => {
      this.once(sign, (params) => resolve(params));
      this.send({commandName, params, sign, type: 'cmd'});
    });
  }


  on(commandName, fn) {
    this._emitter.on(commandName, fn);
    return this;
  }


  off(commandName, fn) {
    this._emitter.off(commandName, fn);
    return this;
  }


  once(commandName, fn) {
    this._emitter.once(commandName, fn);
    return this;
  }


  _getSign() {
    return `__babbler__${this._instanceNumber}__${this._messagesCount}`;
  }


  _isValid(e) {
    if (!e.data.commandName) {
      return false;
    }
    let origin = punycode.toUnicode(e.origin);
    if (this._origin !== '*' && this._origin !== origin) {
      return false;
    }
    return true;
  }

}
