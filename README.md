# ember-data-in-memory-adapter

This addon provides an ember-data adapter that stores data in memory only, having no persistence between page loads.

This is useful when you want to use ember-data for transient data that may not have a server-backed URL.

It is adapted from [ember-data-fixture-adapter](https://github.com/emberjs/ember-data-fixture-adapter).

## Installation

You can install this adapter as an ember-cli addon by running `ember install ember-data-in-memory-adapter`.

## Usage

To use this adapter as the default one for your application, create or replace `app/adapters/application.js` with this:

```js
export { default } from 'ember-data-in-memory-adapter';
```

## Development

### Installation

* `git clone` this repository
* `npm install`
* `bower install`

## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Running Tests

* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
