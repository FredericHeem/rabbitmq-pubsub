//var assert = require('assert');
import  Promise from 'bluebird';
import 'mochawait';

var Publisher = require('../src/').Publisher;

describe('Publisher', function() {
  'use strict';
  this.timeout(15e3);
  var log = require('logfilename')(__filename, {
    console: {
      level: 'debug'
    }
  });

  log.debug('');

  var publisherOptions = {
    exchange: 'user'
  };
  describe('Invalid Constructor', function() {
    it('no options', done => {
      (function(){
        new Publisher()
      }).should.throw();
      done();
    });
    it('no exchange options', done => {
      (function(){
        new Publisher({})
      }).should.throw();
      done();
    });
  });
  describe('StartStop', function() {
    it('should start and stop the publisher', async () => {
      let publisher = new Publisher(publisherOptions);
      await publisher.start();
      await Promise.delay(1e3);
      await publisher.stop();
    });
    it('should stop the publisher without start', async () => {
      let publisher = new Publisher(publisherOptions);
      await publisher.stop();
    });
    it('should start and publish', async () => {
      let publisher = new Publisher(publisherOptions);
      await publisher.start();
      await publisher.publish('myRoutingKey', 'Ciao');
    });
  });

});
