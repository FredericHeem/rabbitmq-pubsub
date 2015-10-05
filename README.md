

> RabbitMQ Publisher Subscriber

A promise based API on top of [ampqlib](http://www.squaremobius.net/amqp.node/).

# [![Test Coverage](https://codeclimate.com/github/FredericHeem/rabbitmq-pubsub/badges/coverage.svg)](https://codeclimate.com/github/FredericHeem/rabbitmq-pubsub/coverage) [![Code Climate](https://codeclimate.com/github/FredericHeem/rabbitmq-pubsub/badges/gpa.svg)](https://codeclimate.com/github/FredericHeem/rabbitmq-pubsub)  [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]

## Install

```sh
$ npm install --save rabbitmq-pubsub
```


## Usage
### Publisher
```js
var Publisher = require('rabbitmq-pubsub').Publisher;

var publisherOptions = {
  exchange: 'user',
  type: 'direct',
  url: 'amqp://localhost'
};

var publisher = new Publisher(publisherOptions);
publisher.start()
.then(function() {
  publisher.publish('myRoutingKey', 'Ciao');
})

```

### Subscriber
```js

var Subscriber = require('rabbitmq-pubsub').Subscriber;
var subscriberOptions = {
	exchange: 'user',
	queueName: 'user.new'
};

var subscriber = new Subscriber(subscriberOptions);

subscriber.getEventEmitter().on('message', function onIncomingMessage(message) {
	debug('onIncomingMessage ', message.fields);

	assert(message);
	assert(message.content);
	assert(message.content.length > 0);
	subscriber.nack(message);
});

subscriber.start()



```

## Test

    $ npm test

## License

MIT © [Frederic Heem](https://github.com/FredericHeem)


[npm-image]: https://badge.fury.io/js/rabbitmq-pubsub.svg
[npm-url]: https://npmjs.org/package/rabbitmq-pubsub
[travis-image]: https://travis-ci.org/FredericHeem/rabbitmq-pubsub.svg?branch=master
[travis-url]: https://travis-ci.org/FredericHeem/rabbitmq-pubsub
[daviddm-image]: https://david-dm.org/FredericHeem/rabbitmq-pubsub.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/FredericHeem/rabbitmq-pubsub
