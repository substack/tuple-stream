var through = require('through');

module.exports = function (a, b) {
    var sa = a.pipe(through());
    var sb = b.pipe(through());
    var output = through();
    var slots = [ null, null ];
    
    sa.pipe(through(function (buf) {
        slots[0] = buf;
        if (slots[1] === null) {
            sa.pause();
        }
        else nextChunk();
    }, done));
    
    sb.pipe(through(function (buf) {
        slots[1] = buf;
        if (slots[0] === null) {
            sb.pause();
        }
        else nextChunk();
    }, done));
    
    function nextChunk () {
        output.queue(slots);
        slots = [ null, null ];
        
        sa.resume();
        sb.resume();
    }
    
    var pending = 2;
    function done () {
        if (--pending === 0) output.queue(null);
    }
    
    return output;
};
