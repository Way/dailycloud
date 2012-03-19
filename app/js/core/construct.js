/**
 * Javascript prototypal inheritance.
 *
 * @description Create a new object with its prototype
 * set to the given object (set of functions).
 *
 * @param fn - function which will be used as constructor.
 *              Set to null in order to create new empty function.
 *
 * @param obj - object that will be set to the functions prototype.
 *
 * @param create - set to false to prevent creating new instance of the created object.
 *
 * @return new created object or null if create-parameter is set to false.
 */
function Construct(fn, obj, create) {
    if(fn === undefined || fn === null) {
        fn = function F() {
        };
    }
    fn.prototype = obj;
    fn.prototype.constructor = fn;

    // Expose this object instance or the constructor itsels
    // (depending on the second parameter) to the global scope.
    fn.prototype.expose = function(name, exposeConstructor) {
        if(!!exposeConstructor) {
            window[name] = this.constructor;
        } else {
            window[name] = this;
        }
    }
    // Prevent creating instance of the new object
    if(create === false) {
        return null;
    }

    return new fn();
}