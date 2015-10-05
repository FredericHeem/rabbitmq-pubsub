'use strict';
const Promise = require('bluebird');
const amqp = require('amqplib');
const _ = require('lodash');
const util = require('util');

let log;

export default class Publisher {
    constructor(options = {}, logOptions) {
        log = require('logfilename')(__filename, logOptions);
        if(!options.exchange){
            throw new Error('exchange parameter missing in options');
        }
        this._options = _.defaults(options, {
            type: 'direct',
            url: 'amqp://localhost'
        });
        log.info('Publisher options:', util.inspect(this._options));
    }
    async start() {
        let options = this._options;
        log.info('start ', util.inspect(options));
        let connection = await amqp.connect(options.url);
        log.info('connected to mq');
        this._channel = await connection.createChannel();
        log.info('connected to channel');
        let res = await this._channel.assertExchange(options.exchange, options.type, { durable: true });
        log.info('connected ', res);
    }

    async stop() {
        log.info('stop');
        if (this._channel) {
            return await this._channel.close();
        } else {
            return Promise.resolve();
        }
    }
    publish(key, message) {
        log.info('publish exchange:%s, key:%s, message ', this._options.exchange, key, message);
        this._channel.publish(this._options.exchange, key, new Buffer(message));
    }
}
