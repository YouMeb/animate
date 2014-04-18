'use strict';

var classes = require('classes');
var getStyle = window.getComputedStyle;
var duration = getPropName('transition-duration');
var proto = Animate.prototype;
var states = {
  enter: 'animate-enter',
  enterActive: 'animate-enter-active',
  leave: 'animate-leave',
  leaveActive: 'animate-leave-active'
};

/**
 * Expose `Animate`
 */

module.exports = Animate;

/**
 * @constructor
 * @param {Element} el
 */
function Animate(el) {
  if (!(this instanceof Animate)) {
    return new Animate(el);
  }
  this.classes = classes(el);
  this.el = el;
}

/**
 * @returns {Number} millisecond
 */
proto.getTransitionDuration = function () {
  var val = getStyle(this.el)[duration] || '';
  var max = 0;

  val.replace(/\d+(?:\.\d+)?/g, function (n) {
    n = Number(n);
    if (n > max) {
      max = n;
    }
  });

  return max * 1000;
}

/**
 * @param {String} className
 * @param {Function} cb
 */
proto.enter = function (className, cb) {
  cb || (cb = noop);

  this.classes.add(className);

  this.run(states.enter, function () {
    this.run(states.enterActive, function () {
      this.classes.remove(states.enter);
      cb();
    }.bind(this));
  }.bind(this));
};

/**
 * @param {String} className
 * @param {Function} cb
 */
proto.leave = function (className, cb) {
  cb || (cb = noop);

  this.run(states.leave, function () {
    this.classes.remove(states.enterActive);
    this.run(states.leaveActive, function () {
      this.classes.remove(states.leave);
      this.classes.remove(states.leaveActive);
      this.classes.remove(className);
      cb();
    }.bind(this));
  }.bind(this));
};

/**
 * @param {String} className
 * @param {Function} cb
 */
proto.toggle = function (className, cb) {
  if (this.classes.has(className)) {
    this.leave(className, cb);
  } else {
    this.enter(className, cb);
  }
};

/**
 * @param {String} className
 * @param {Function} cb
 */
proto.run = function (className, cb) {
  var d = this.getTransitionDuration();
  this.classes.add(className);
  if (d) {
    setTimeout(cb, d);
  } else {
    cb();
  }
};

/**
 * @param {String} prop css property name
 * @returns {String} css property name with vendor prefix
 */
function getPropName(prop) {
  var style = Array.prototype.join.call(getStyle(document.body), '\n');
  var r = new RegExp('^-\\w+-' + (prop || ''), 'm');
  var match = style.match(r);
  
  if (match) {
    prop = match[0];
  }

  return prop;
}

function noop() {}
