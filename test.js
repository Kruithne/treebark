const Logger = require('./treebark');

let log = new Logger(null, 'test.log');
log.write('Normal message.');
log.write('This is a %s message.', 'formatted');

// Object Dumping //
log.dump({ hello: 'world' });

// Indent testing //
log.write('Indent #0');
log.indent().write('Indent #1');
log.indent().write('Indent #2');
log.unindent().write('Indent #1');
log.indent().write('Indent #2');
log.clearIndent().write('Indent #0');

let group = log.group();
group.write('Group #1 Indent #0');
group.indent().write('Group #1 Indent #1');
log.write('Indent #0');
log.indent().write('Indent #1');
group.write('Group #1 Indent #1');
group.clearIndent().write('Group #1 Indent #0');

log.clearIndent();
log.write('My Object:').indentNext().dump([1, 5, 23, 6, 2, 6]);
log.write('Those were my objects.');

// Prefixing //
log = new Logger('[Prefix]');
log.write('This is prefixed!');

log.setPrefix('[Different Prefix]');
log.write('This is prefixed differently!');

// Blank Lines //
log.write('Hello...');
log.blank(2);
log.write('...world!');

// Time Check //
setTimeout(() => {
	log.write('This is delayed.');
}, 2500);