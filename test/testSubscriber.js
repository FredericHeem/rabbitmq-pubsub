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

  let publisher;
  let subscriber;
  let publisherOptions = {
    exchange: 'user'
  };

  let subscriberOptions = {
    exchange: 'user',
    queueName: 'user.new'
  };

  function defaultIncomingMessage(message) {
    console.log("onIncomingMessage ", message.fields);
    assert(message.content.length > 0);
    subscriber.ack(message);
  }

  before(async () => {
    debug('publisher.start()');
    publisher = new Publisher(publisherOptions);
    await publisher.start();
  });

  after(async () => {
    debug('publisher.stop()');
    await publisher.stop();
  });

  describe('Invalid Constructor', function() {
    it('no options', done => {
      (function(){
        new Subscriber();
      }).should.throw();
      done();
    });
    it('no exchange options', done => {
      (function(){
        new Subscriber({})
      }).should.throw();
      done();
    });
    it('no queueName options', done => {
      (function(){
        new Subscriber({exchange:'user'});
      }).should.throw();
      done();
    });
  });

  describe('StartStop', function() {
    it('should start, purge the queue and stop the subscriber', async () => {
        let subscriber = new Subscriber(subscriberOptions);
        await subscriber.start(defaultIncomingMessage);
        await Promise.delay(1e3);
        await subscriber.purgeQueue();
        await subscriber.stop();
      });

    it('should stop the subscriber without start', async () => {
      let subscriber = new Subscriber(subscriberOptions);
      await subscriber.stop();
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
            subscriber.start(defaultIncomingMessage)
          ]);

      await Promise.delay(1e3);

      await Promise.all(
            [
              publisher.stop(),
              subscriber.stop()
            ]);

    });
  });


  describe('Subscriber', function() {
    beforeEach(async () => {
      subscriber = new Subscriber(subscriberOptions);
    });
    afterEach(async () => {
      //await subscriber.purgeQueue();
      await subscriber.stop();
    });

    it('should receive the published message with no routing key', async (done) => {
      debug('should start the mq');
      function onIncomingMessage(message) {
        console.log('onIncomingMessage ', message.fields);

        assert(message);
        assert(message.content);
        assert(message.content.length > 0);
        assert.equal(message.fields.routingKey, '');
        subscriber.ack(message);
        if(message.fields.redelivered === false){
          done();
        }
      };

      await subscriber.start(onIncomingMessage);
      await publisher.publish("", 'publish without routing key');
    });

    it('should receive the published message', async (done) => {
      debug('should start the mq');
      function onIncomingMessage(message) {
        console.log('onIncomingMessage ', message.fields);

        assert(message);
        assert(message.content);
        assert(message.content.length > 0);
        subscriber.ack(message);
        if(message.fields.redelivered === false){
          done();
        }
      };

      await subscriber.start(onIncomingMessage);
      await publisher.publish(subscriberOptions.queueName, 'Ciao');
    });

    it('should nack the received message', async (done) => {
      function onIncomingMessage(message) {
        debug('onIncomingMessage ', message.fields);

        assert(message);
        assert(message.content);
        assert(message.content.length > 0);
        subscriber.nack(message);
        if(message.fields.redelivered === false){
          done();
        }
      };

      await subscriber.start(onIncomingMessage);
      publisher.publish(subscriberOptions.queueName, 'Ciao nack');
    });

    it('should send and receive 10 messages', async (done) => {
      let numMessage = 0;
      let numMessageToSend = 10;
      debug('should start the mq');

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
          done();
        }
      }
      await subscriber.start(onIncomingMessage);
      await subscriber.purgeQueue();
      _.times(numMessageToSend, function(n) {
        publisher.publish(subscriberOptions.queueName, 'Ciao ' + n);
      });
    });
  });
});
