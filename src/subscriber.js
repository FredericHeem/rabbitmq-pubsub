'use strict';
const Promise = require('bluebird');
const amqp = require('amqplib');
const _ = require('lodash');
const util = require('util');
const EventEmitter = require('events').EventEmitter;

let log;

function onIncomingMessage(message) {
    log.debug('onIncomingMessage ', message.fields);
    this._eventEmitter.emit('message', message);
}

export default class Subscriber {
    constructor(options, logOptions) {
        log = require('logfilename')(__filename, logOptions);
        this._queue;
        this._channel;
        this._eventEmitter = new EventEmitter();
        this._options = _.defaults(options, {
            type: 'direct',
            url: 'amqp://localhost'
        });
        log.info('Subscriber options:', util.inspect(this._options));

    }
    getEventEmitter() {
        return this._eventEmitter;
    }
    start() {
        log.info('start');
        let options = this._options;
        return amqp.connect(options.url).then(conn => {
            log.info('createChannel');
            return conn.createChannel();
        }).then(channel => {
            this._channel = channel;
            log.info('assertExchange ', options.exchange);
            return channel.assertExchange(options.exchange, options.type, { durable: true });
        }).then(() => {
            log.info('assertQueue name: ', options.queueName);
            return this._channel.assertQueue(options.queueName, { exclusive: false });
        }).then(res => {
            log.info('bind queue %s, key: %s', res.queue, options.key);
            this._queue = res.queue;
            return this._channel.bindQueue(this._queue, options.exchange, options.key);
        }).then(() => {
            //TODO ack
            this._channel.prefetch(1);
            return this._channel.consume(this._queue, onIncomingMessage.bind(this));
        }).then(() => {
            log.info('started');
        });
    }
    stop() {
        log.info('stop');
        if (this._channel) {
            return this._channel.close();
        } else {
            return Promise.resolve();
        }
    }
    ack(message) {
        log.debug('ack');
        this._channel.ack(message);
    }
    nack(message) {
        log.debug('nack');
        this._channel.nack(message);
    }
    purgeQueue() {
        log.info('purgeQueue ', this._queue);
        if (this._channel) {
            return this._channel.purgeQueue(this._queue);
        } else {
            log.error('purgeQueue: channel not opened');
            return Promise.resolve();
        }
    }
}
