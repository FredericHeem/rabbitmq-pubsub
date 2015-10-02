'use strict';
const Promise = require('bluebird');
const amqp = require('amqplib');
const _ = require('lodash');
const util = require('util');

let log;

export default class Publisher {
    constructor(options, logOptions) {
        log = require('logfilename')(__filename, logOptions);
        let _channel;
        this._options = options || {};
        this._options = _.defaults(options, {
            type: 'direct',
            url: 'amqp://localhost'
        });
        log.info('Publisher options:', util.inspect(this._options));
    }
    start() {
        let options = this._options;
        log.info('start ', util.inspect(options));
        return amqp.connect(options.url).then(conn => {
            log.info('connected to mq');
            return conn.createChannel();
        }).then(ch => {
            log.info('connected to channel');
            this._channel = ch;
            return ch.assertExchange(options.exchange, options.type, { durable: true });
        }).then(res => {
            log.info('connected ', res);
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
    publish(key, message) {
        log.info('publish exchange:%s, key:%s, message ', this._options.exchange, key, message);
        this._channel.publish(this._options.exchange, key, new Buffer(message));
    }
}
