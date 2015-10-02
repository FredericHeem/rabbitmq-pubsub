var assert = require('assert');
var _ = require('lodash');
var Promise = require('bluebird');
var debug = require('debug');
var Publisher = require('../src/').Publisher;
var Subscriber = require('../src/').Subscriber;

describe('PublisherSubscriber', function() {
  'use strict';
  this.timeout(15e3);
  var log = require('logfilename')(__filename, {
    console: {
      level: 'debug'
    }
  });

  log.debug('PublisherSubscriber');
  var publisher;
  var subscriber;
  var publisherOptions = {
    exchange: 'user'
  };

  var subscriberOptions = {
    exchange: 'user',
    queueName: 'user.new'
  };

  describe('StartStop', function() {

    it('should start, purge the queue and stop the subscriber', function(done) {
        subscriber = new Subscriber(subscriberOptions);
        subscriber.start()
          .delay(1e3)
          .then(() => subscriber.purgeQueue())
          .then(() => subscriber.stop())
          .then(done, done);
      });

    it('should stop the subscriber without start', function(done) {
      subscriber = new Subscriber(subscriberOptions);
      subscriber.stop().then(done, done);
    });

    it('should purge the queue without start', function(done) {
      subscriber = new Subscriber(subscriberOptions);
      subscriber.purgeQueue().then(done, done);
    });

    it('should start and stop the publisher and subscriber', function(done) {
      publisher = new Publisher(publisherOptions);
      subscriber = new Subscriber(subscriberOptions);
      Promise.all(
          [
            publisher.start(),
            subscriber.start()
          ])
        .delay(1e3)
        .then(function() {
          return Promise.all(
            [
              publisher.stop(),
              subscriber.stop()
            ]);
        })
        .then(function() {

        })
        .then(done, done);
    });
  });

  describe('Subscriber', function() {
    before(function(done) {
      debug('publisher.start()');
      publisher = new Publisher(publisherOptions);

      publisher.start().then(done,
        done);
    });
    beforeEach(function(done) {
      subscriber = new Subscriber(subscriberOptions);
      done();
    });
    afterEach(function(done) {
      subscriber.purgeQueue()
      .then(() => subscriber.stop())
      .then(done, done);
    });
    after(function(done) {
      debug('publisher.stop()');
      publisher.stop().then(done, done);
    });

    it('should receive the published message', function(done) {
      debug('should start the mq');

      function onIncomingMessage(message) {
        debug('onIncomingMessage ', message.fields);

        assert(message);
        assert(message.content);
        assert(message.content.length > 0);
        subscriber.ack(message);
        done();
      }

      subscriber.getEventEmitter().once('message',
        onIncomingMessage);

      subscriber.start()
        .then(function() {
          debug('started');
          publisher.publish('', 'Ciao');
        })
        .catch(done);
    });

    it('should nack the received message', function(done) {
      subscriber.getEventEmitter().once('message', function onIncomingMessage(message) {
        debug('onIncomingMessage ', message.fields);

        assert(message);
        assert(message.content);
        assert(message.content.length > 0);
        subscriber.nack(message);
        done();
      });

      subscriber.start()
        .then(function() {
          log.debug('started');
          publisher.publish('', 'Ciao');
        })
        .catch(done);
    });

    it('should send and receive 10 messages', function(done) {
      debug('should start the mq');

      var numMessage = 0;
      var numMessageToSend = 10;

      function onIncomingMessage(message) {
        log.debug('onIncomingMessage ', message.fields);
        subscriber.ack(message);

        if (message.fields.redelivered) {
          log.debug('onIncomingMessage ignoring redelivered');
          return;
        }
        numMessage++;
        log.debug('onIncomingMessage ', numMessage);
        if (numMessage >= numMessageToSend) {
          subscriber.getEventEmitter().removeListener('message',
            onIncomingMessage);
          done();
        }
      }

      subscriber.getEventEmitter().on('message',
        onIncomingMessage);

      subscriber.start()
        .then(() => subscriber.purgeQueue())
        .then(function() {
          debug('started');

          _.times(numMessageToSend, function(n) {
            publisher.publish('', 'Ciao ' + n);
          });
        })
        .catch(done);
    });
  });
});
