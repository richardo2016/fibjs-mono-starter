## @fibjs-mono-group/foo

[![NPM version](https://img.shields.io/npm/v/@fibjs-mono-group/foo.svg)](https://www.npmjs.org/package/@fibjs-mono-group/foo)

This repo is migration from https://github.com/sindresorhus/cli-spinners, for fibjs.

# cli-spinners

> 70+ spinners for use in the terminal

<p align="center">
	<br>
	<img width="700" src="screenshot.svg">
	<br>
	<br>
</p>

The list of spinners is just a [JSON file](spinners.json) and can be used wherever.

You probably want to use one of these spinners through the [`ora`](https://github.com/sindresorhus/ora) module.

## Install

```
$ npm install @fibjs-mono-group/foo
```

## Usage

```js
const cliSpinners = require('@fibjs-mono-group/foo');

console.log(cliSpinners.dots);
/*
{
	interval: 80,
	frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
}
*/
```

## API

Each spinner comes with a recommended `interval` and an array of `frames`.

[See the spinners.](spinners.json)

The `random` spinner will return a random spinner each time it's called.


