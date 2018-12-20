function outer () {
    var a = 1;
    function inner () {
        var b = 2;
        console.log( a + b );
    }
    inner();
    console.log(a);
}
outer();
const TAX_RATE = 0.08;
function calculateFinalPurchaseAmount (amt) {
    amt = amt + (amt * TAX_RATE);
    return amt;
}
/*

*/
const SPENDING_THRSHOLD = 200;
const TAX_RATE = 0.08;
const PHONG_PRICE = 99.99;
const ACCESSORY_PRICE = 9.99;
var bank_balance = 303.91;
var amount = 0;
function calculateTax (amount) {
    return amount * TAX_RATE;
}
function fromatAmount (amount) {
    return "$" + amount.toFixed(2);
}
while (amount < bank_balance) {
    amount = amount + PHONG_PRICE;
    if (amount < SPENDING_THRSHOLD) {
        amount = amount + ACCESSORY_PRICE;
    }
}
amount = amount + calculateTax(amount);
console.log("Your purchase:" +  fromatAmount(amount));
if (amount > bank_balance) {
    console.log("You can't afford this purchase. :(")
}