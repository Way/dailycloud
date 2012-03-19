// Find position of a string
if(!window.strrpos) {
    window.strrpos = function(haystack, needle, offset) {
        var i = -1;
        if(offset) {
            // strrpos' offset indicates starting point of range till end,
            // while lastIndexOf's optional 2nd argument indicates ending point of range from the beginning
            i = (haystack + '').slice(offset).lastIndexOf(needle);
            if(i !== -1) {
                i += offset;
            }
        } else {
            i = (haystack + '').lastIndexOf(needle);
        }
        return i >= 0 ? i : false;
    }
}

// Array Remove - By John Resig (MIT Licensed)
if(!window.array_remove) {
    window.array_remove = function(array, from, to) {
        var rest = array.slice((to || from) + 1 || array.length);
        array.length = from < 0 ? array.length + from : from;
        return array.push.apply(array, rest);
    }
}

// Clone object
if(!window.clone) {
    window.clone = function(obj) {
        var target = {};
        for(var i in obj) {
            if(obj.hasOwnProperty(i)) {
                target[i] = obj[i];
            }
        }
        return target;
    }
}

// Integer proof
if(!window.is_int) {
    window.is_int = function(input) {
        return typeof (input) == 'number' && parseInt(input) == input;
    }
}