import {expect} from 'chai';
import Babbler, {SimpleEventEmitter} from '../src';



describe('SimpleEventEmitter', () => {

  let emitter = new SimpleEventEmitter();
  let tmp;
  let fn1 = function() {
    tmp += 1;
  };
  let fn2 = function() {
    tmp += 2;
  };


  it('#on', () => {

    tmp = 0;

    emitter.on('event', fn1);
    emitter.on('event', fn2);
    emitter.emit('event');
    expect(tmp).to.be.equal(3);

  });


  it('#off', () => {

    tmp = 0;

    emitter.off('event', fn1);
    emitter.emit('event');
    expect(tmp).to.be.equal(2);
    emitter.off('event');
    emitter.emit('event');
    expect(tmp).to.be.equal(2);

  });


  it('#once', () => {

    tmp = 0;

    emitter.once('event', fn1);
    emitter.emit('event');
    expect(tmp).to.be.equal(1);
    emitter.emit('event');
    expect(tmp).to.be.equal(1);

  });


});




let b = new Babbler(window, document.location.origin);


describe('Babbler', function () {

  it('#emit()', function (done) {

    let params = {a: 1, b: 2};

    b.once('emit', function(data) {
      expect(data).to.be.deep.equal(params);
      done();
    });

    b.emit('emit', params);

  });



  it('#cmd()', function (done) {

    let params = {a: 10, b: 20};

    b.once('emit', function(params) {
      console.log(this);
      this.resolve(params.a + params.b);
    });

    b.cmd('emit', params).then(function(res) {
      expect(res).to.be.equal(30);
      done();
    });


    b.once('emit', function() {
      this.reject('err');
    });

    b.cmd('emit', params).catch(function(err) {
      console.log(err);
    });

  });

});
