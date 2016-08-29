import {expect} from 'chai';
import Babbler from '../src';



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
