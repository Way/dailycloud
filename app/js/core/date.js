/**
 * Extend native Date object with useful additional functions.
 */

Date.prototype.toUTCArray = function() {
    var D = this;
    return [D.getUTCFullYear(), D.getUTCMonth(), D.getUTCDate(), D.getUTCHours(), D.getUTCMinutes(), D.getUTCSeconds()];
}

Date.prototype.toISO = function() {
    var tem, A = this.toUTCArray(), i = 0;
    A[1] += 1;
    while(i++ < 7) {
        tem = A[i];
        if(tem < 10) {
            A[i] = '0' + tem;
        }
    }
    return A.splice(0, 3).join('-') + 'T' + A.join(':') + 'Z';
}