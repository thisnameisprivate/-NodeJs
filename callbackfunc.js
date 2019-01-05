func_one = func => {
    func();
    console.log("func_one execute");
}
func_two = () => {
    setTimeout(() => {
        console.log("func_two execute");
    }, 3000)
}
func_one(func_two);
// bind
this.a = 1;
var module = {
    a : 2,
    getA:function () {
        return this.a;
    }
};
console.log(module.getA());
var getA1 = module.getA;
console.log(getA1());
var getA2 = getA1.bind(module);
console.log(getA2());

//
function list () {
    return Array.prototype.slice.call(arguments);
}
console.table(list(1, 2, 3));
var list1 = list.bind(undefined, 4);
console.table(list1());
console.table(list1(1,2,3));
// setTimeout bind
function Fun1 () {
    this.name = 1;
}
Fun1.prototype.fun2 = function () {
    widnow.setTimeout(this.fun3.bind(this), 2000);
}
Fun1.prototype.fun3 = function () {
    console.log('name:' + this.name);
}
var fun = new Fun1;
console.log(fun());

// DOMContentLoad  or  window.onload
function domReady () {
    var d = window.document;
    if (d.addEventListener) {
        d.addEventListener("DOMContentLoaded", function () {
            d.removeEventListener("DOMContentLoaded", arguments.callee, false);
            fn();
        }, false)
    } else if (d.attachEvent) {
        var done = false;
        init = function () {
            if (!done) {
                done = true;
                fn();
            }
        };
        (function () {
            try {
                d.documentElement.doScroll("left");
            } catch (e) {
                setTimeout(arguments.callee, 50);
                return;
            }
            init();
        })();
        d.onreadystatechange = function () {
            if (d.readyState == 'complete') {
                d.onreadystatechange = null;
                init();
            }
        }
    }
}
var p1 = new Promise(function (resolve, reject) {
    throw Error("async error");
}).then(res => {
    console.log(res);
}).catch(err => {
    console.log(err);
});
var p1 = new Promise(function (resolve, reject) {
    setTimeout(() => {
        throw Error("async error");
    })
}).then(res => {
    console.log(res);
}).catch(err => {
    console.log(err);
});
var p1 = new Promise(function (resolve, reject) {
    resolve();
}).then(res => {
    throw Error("sync error");
});
function Promise (fn) {
    doResolve(fn, this);
}
function doResolve (fn, self) {
    try {
        fn (function (value) {

        }, function (reason) {

        })
    } catch (err) {
        reject(self, err)
    }
}
Promise.prototype.then = function (onFulfilled, onRejected) {
    try {
        onFulfilled(value)
    } catch (err) {
        reject(err);
    }
};
function reject (self, newValue) {
    if (! self._handled) {
        Promise._unhandledRejectionFn(self._value);
    }
}
function Promise (fn) {
    this._state = 0; // status flag
    doResolve(fn, this);
}
function doResolve (fn, self) {
    var done = false; // add event listener
    try {
        fn (function (value) {
            if (done) return;
            done = true;
            resolve(self, value);
        },
            function (reason) {
                if (done) return;
                done = true;
                reject(self, value);
            })
    } catch (err) {
        if (done) return;
        done = true;
        reject(self, err);
    }
}
function resolve (self, newValue) {
    try {
        self._state = 1;
    } catch (err) {
        reject(self, err);
    }
}
function reject (self, newValue) {
    self._state = 2;
    if (! self._handled) {
        Promise._unhandledRejectionFn(self._value);
    }
}
function hanlde (self, deferred) {
    setTimeout(function () {
        var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
        if (cb === null) {
            (self._state === 1 ? resolve : reject) (deferred.promise, self._value);
            return;
        }
        var ret;
        try {
            ret = cb(self._value);
        } catch (e) {
            reject(deferred.rpomise, e);
            return;
        }
        resolve(deferred.promise, ret)
    }, 0)
}
function observer (obj, key, watchFun, deep, page) {
    let val = obj[key];
    if (val != null && typeof val === 'object' && deep) {
        Object.keys(val).forEach((item) => {
            observer(val, item, watchFun, deep, page);
        });
    }
    Object.defineProperty(obj, key, {
        configurable: true,
        enumerable: true,
        set: function (value) {
            watchFun.call(page, value, val);
            val = value;
            if (deep) {
                observer(obj, key, watchFun, deep, page);
            }
        },
        get: function () {
            return val;
        }
    });
}
export function setWatcher (page) {
    let data = page.data;
    let watch = page.watch;
    Object.keys(watch).forEach((item) => {
        let targetData = data;
        let keys = item.split(".");
        for (let i = 0; i < keys.length - 1; i ++) {
            targetData = targetData[keys[i]];
        }
        let targetKey = keys[keys.length - 1];
        let watchFun = watch[item].handler || watch[item];
        let deep = watch[item].deep;
        observer[targetData, targetKey, watchFun, deep, page];
    });
}