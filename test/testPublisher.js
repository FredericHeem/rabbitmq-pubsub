//var assert = require('assert');
//var Promise = require('bluebird');
var Publisher = require('../lib/').Publisher;

describe('Publisher', function() {
  'use strict';
  this.timeout(15e3);
  var log = require('logfilename')(__filename, {
    console: {
      level: 'debug'
    }
  });

  log.debug('');
  var publisher;

  var publisherOptions = {
    exchange: 'user'
  };

  describe('StartStop', function() {
    it('should start and stop the publisher', function(done) {
      publisher = new Publisher(publisherOptions);
      publisher.start().delay(1e3).then(publisher.stop).then(done,
        done);
    });
    it('should stop the publisher without start', function(done) {
      publisher = new Publisher(publisherOptions);
      publisher.stop().then(done, done);
    });
    it('should start and publish', function(done) {

      var publisher = new Publisher(publisherOptions);
      publisher.start()
      .then(function() {
        publisher.publish('myRoutingKey', 'Ciao');
      })
      .then(done,done);
    });
  });

});
