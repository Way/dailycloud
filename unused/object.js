/**
 * Prototypal Inheritance in JavaScript
 *
 * create an operator that implements true prototypal inheritance.
 *
 * @url http://javascript.crockford.com/prototypal.html
 */
if( typeof Object.create !== 'function') {
    Object.create = function(o) {
        function F() {}
        F.prototype = o;
        return new F();
    };
}