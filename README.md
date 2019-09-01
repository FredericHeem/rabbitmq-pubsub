

> RabbitMQ Publisher Subscriber

A promise based API on top of [ampqlib](http://www.squaremobius.net/amqp.node/).

[![Build Status][travis-image]][travis-url]
[![Test Coverage](https://codeclimate.com/github/FredericHeem/rabbitmq-pubsub/badges/coverage.svg)](https://codeclimate.com/github/FredericHeem/rabbitmq-pubsub/coverage) [![Code Climate](https://codeclimate.com/github/FredericHeem/rabbitmq-pubsub/badges/gpa.svg)](https://codeclimate.com/github/FredericHeem/rabbitmq-pubsub) [![Coverage Status](https://coveralls.io/repos/FredericHeem/rabbitmq-pubsub/badge.svg?branch=master&service=github)](https://coveralls.io/github/FredericHeem/rabbitmq-pubsub?branch=master) [![Greenkeeper badge](https://badges.greenkeeper.io/FredericHeem/rabbitmq-pubsub.svg)](https://greenkeeper.io/) [![NPM version][npm-image]][npm-url]

[![Dependency Status][daviddm-image]][daviddm-url]

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
  type: 'topic',
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
  queueName: 'user',
  routingKeys:['user.regiser', 'user.resetpassword']
};

var subscriber = new Subscriber(subscriberOptions);

function onIncomingMessage(message) {
  debug('onIncomingMessage ', message.fields);

  assert(message);
  assert(message.content);
  assert(message.content.length > 0);

  subscriber.ack(message);

  //subscriber.nack(message);
};

subscriber.start(onIncomingMessage)


```

## Test

Make sure the rabbitmq server is running locally before running the test

    $ npm test

## License

MIT © [Frederic Heem](https://github.com/FredericHeem)


[npm-image]: https://badge.fury.io/js/rabbitmq-pubsub.svg
[npm-url]: https://npmjs.org/package/rabbitmq-pubsub
[travis-image]: https://travis-ci.org/FredericHeem/rabbitmq-pubsub.svg?branch=master
[travis-url]: https://travis-ci.org/FredericHeem/rabbitmq-pubsub
[daviddm-image]: https://david-dm.org/FredericHeem/rabbitmq-pubsub.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/FredericHeem/rabbitmq-pubsub
