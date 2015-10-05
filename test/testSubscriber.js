import 'mochawait';
var assert = require('assert');
var _ = require('lodash');
var Promise = require('bluebird');
var debug = require('debug');
var Publisher = require('../src/').Publisher;
var Subscriber = require('../src/').Subscriber;

describe('PublisherSubscriber', function() {
  'use strict';
  this.timeout(15e3);
  let log = require('logfilename')(__filename, {
    console: {
      level: 'debug'
    }
  });

  log.debug('PublisherSubscriber');
  let publisher;
  let subscriber
  let publisherOptions = {
    exchange: 'user'
  };

  let subscriberOptions = {
    exchange: 'user',
    queueName: 'user.new'
  };

  describe('StartStop', function() {

    it('should start, purge the queue and stop the subscriber', async () => {
        let subscriber = new Subscriber(subscriberOptions);
        await subscriber.start();
        await Promise.delay(1e3);
        await subscriber.purgeQueue();
        await subscriber.stop();
      });

    it('should stop the subscriber without start', async () => {
      let subscriber = new Subscriber(subscriberOptions);
      await subscriber.start();
    });

    it('should purge the queue without start', async () => {
      let subscriber = new Subscriber(subscriberOptions);
      await subscriber.purgeQueue();
    });

    it('should start and stop the publisher and subscriber', async () => {
      let publisher = new Publisher(publisherOptions);
      let subscriber = new Subscriber(subscriberOptions);
      await Promise.all(
          [
            publisher.start(),
            subscriber.start()
          ]);

      await Promise.delay(1e3);

      await Promise.all(
            [
              publisher.stop(),
              subscriber.stop()
            ]);
        })
    });
  });

  describe('Subscriber', function() {
    before(async () => {
      debug('publisher.start()');
      publisher = new Publisher(publisherOptions);
      await publisher.start();
    });
    beforeEach(function() {
      subscriber = new Subscriber(subscriberOptions);
    });
    afterEach(async () => {
      subscriber.purgeQueue()
      .then(() => subscriber.stop())
      .then(done, done);
    });
    after(async () => {
      debug('publisher.stop()');
      publisher.stop().then(done, done);
    });

    it('should receive the published message', async () => {
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

    it('should nack the received message', async () => {
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

    it('should send and receive 10 messages', async () => {
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
