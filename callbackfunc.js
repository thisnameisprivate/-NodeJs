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