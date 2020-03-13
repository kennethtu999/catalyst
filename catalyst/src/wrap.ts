/**
 * A utility method which wraps a prototype method, ensuring the given function
 * is also called as part of the given method name.
 *
 * Used in the `contoller()` decorator.
 */
export function wrap(obj: any, name: string, fn: (...args: any[]) => any) {
  if (!obj.prototype[name]) {
    obj[name] = fn
  } else {
    const oldFn = obj.prototype[name]
    obj.prototype[name] = function () {
      oldFn.call(this)
      fn.call(this, this)
    }
  }
}