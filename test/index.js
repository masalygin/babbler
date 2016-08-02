import {expect} from 'chai';
import Babbler from '../src';


describe('Babbler', function () {

  it('#emit()', function (done) {

    console.log(document.location.host);
    
    let b = new Babbler(window, document.location.host);

    let params = {a: 1, b: 2};

    console.log(params);

    b.on('emit', function() {
      console.log(arguments);
      done();
    });
    b.emit('emit', params);

  });

});
