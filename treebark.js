// Imports //
const util = require('util');
const fs = require('fs');
const stripAnsi = require('strip-ansi');

class Logger {
	/**
	 * Construct a new Logger instance.
	 * @param {string|null} [prefix]
	 * @param {string|null} [file]
	 */
	constructor(prefix, file) {
		this.depth = 0;
		this.parent = null;

		this.setPrefix(prefix);
		this.setLogFile(file);
	}

	/**
	 * Get the timestamp of the last message logged.
	 * @returns {*}
	 */
	get lastMessageTime() {
		if (this.parent)
			return this.parent.lastMessageTime;

		return this._lastMessageTime || +new Date();
	}

	/**
	 * Set the timestamp of the last message logged.
	 * @param value
	 */
	set lastMessageTime(value) {
		if (this.parent)
			this.parent.lastMessageTime = value;
		else
			this._lastMessageTime = value;
	}

	/**
	 * Obtain the highest file stream in this logging tree.
	 * @returns {*}
	 */
	get fileStream() {
		if (this.parent)
			return this.parent.fileStream;

		return this.stream;
	}

	/**
	 * The default depth for this type of logger.
	 * @returns {number}
	 */
	get defaultDepth() {
		return 0;
	}

	/**
	 * The current indent level based on tree structure.
	 * @returns {number}
	 */
	get indentDepth() {
		let depth = this.depth;
		if (this.parent)
			depth += this.parent.indentDepth;

		return depth;
	}

	/**
	 * Write a message to the log.
	 * @param {string} message
	 * @param {...} args
	 * @returns {Logger}
	 */
	write(message, ...args) {
		let now = +new Date();
		let offset = '+' + ((now - this.lastMessageTime) / 1000).toFixed(2) + ' ';

		let padding = '    '.repeat(this.indentDepth);
		let output = offset + this.prefix + padding + util.format(message.toString(), ...args);

		console.info(output);
		if (this.fileStream)
			this.fileStream.write(stripAnsi(output) + '\n');

		this.lastMessageTime = now;

		if (this._indentTemp)
			this.unindent();

		return this;
	}

	/**
	 * Set the prefix for this logger.
	 * @param {string} [prefix]
	 */
	setPrefix(prefix) {
		this.prefix = typeof prefix === 'string' ? prefix.trim() + ' ' : '';
	}

	/**
	 * Set the file to store logger output into.
	 * @param {string} [file]
	 */
	setLogFile(file) {
		if (this.stream)
			this.stream.end();

		if (typeof file === 'string')
			this.stream = fs.createWriteStream(file, { encoding: 'utf8' });
	}

	/**
	 * Dump an object to the log.
	 * @param {object} object
	 * @param {number} [depth]
	 * @param {boolean} [color]
	 * @returns {Logger}
	 */
	dump(object, depth = 50, color = true) {
		return this.write(util.inspect(object, { colors: color, depth: depth }));
	}

	/**
	 * Add a raw level of indentation.
	 * @returns {Logger}
	 */
	indent() {
		this.depth++;
		return this;
	}

	/**
	 * Add a raw level of indention for just the next message.
	 * @returns {Logger}
	 */
	indentNext() {
		if (!this._indentTemp) {
			this.indent();
			this._indentTemp = true;
		}
		return this;
	}

	/**
	 * Remove a raw level of indentation.
	 * @returns {Logger}
	 */
	unindent() {
		this.depth = Math.max(0, this.depth - 1);
		return this;
	}

	/**
	 * Clear all raw indention.
	 * @returns {Logger}
	 */
	clearIndent() {
		this.depth = this.defaultDepth;
		return this;
	}

	/**
	 * Create an indented sub-group logger.
	 * @returns {SubLogger}
	 */
	group() {
		return new SubLogger(this);
	}

	/**
	 * Insert `count` amount of blank lines.
	 * @param {number} [count]
	 */
	blank(count = 1) {
		for (let i = 0; i < count; i++)
			this.write('');

		return this;
	}
}

class SubLogger extends Logger {
	/**
	 * Construct a new SubLogger instance.
	 * @param parent
	 */
	constructor(parent) {
		super();
		this.depth = 1;
		this.parent = parent;
	}

	/**
	 * The default depth for this type of logger.
	 * @returns {number}
	 */
	get defaultDepth() {
		return 1;
	}

	/**
	 * End this sub-group, returning the parent.
	 * @returns {Logger|SubLogger}
	 */
	end() {
		return this.parent;
	}
}

module.exports = Logger;