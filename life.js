life = function(x, y, wrap, board, rules) {
    this.x = x;
    this.y = y;
    this.wrap = wrap;
    this.boards = [new Uint8Array(x*y), new Uint8Array(x*y)];
    this.board = this.boards[0];
    this.calcBoard = this.boards[1];
    this.prevCols = [0, 0];
    this.rules = rules || {
        'born': [0,0,0,1,0,0,0,0,0,0], 'survive': [0,0,1,1,0,0,0,0,0,0]};
    this.living = false;
    this.activeBrush = life.brushes.glider;
}

life.parseFirstRleLine = function(line) {
    var captures = line.match(/x\s*=\s*(\d+)[,\s]*y\s*=\s*(\d+)[,\s]*rule\s*=\s*B?(\d+)\/S?(\d+)\s*/i);
    return captures == null ? null
        : {x: captures[1], y: captures[2], b: captures[3], s: captures[4]};
}

life.repeat = function(n, x) {
    var arr = [];
    for(var i = 0; i < x; i++) {
        arr.push(n);
    }
    return arr;
}

life.parseRleLine = function(line, x, y) {
    var run = '', pattern = [], curPattern = [],
        runVals = {'b':0, 'o':1},
        pushCurrent = function() {
           if(curPattern.length < x) {
               life.repeat(0, (x - curPattern.length)).map(function(n) {
                   return curPattern.push(n);
               });
           }
           pattern.push(curPattern);
           curPattern = [];
        };

    for(var i = 0; i < line.length; i++) {
       if(line[i] == 'b' || line[i] == 'o') {
           run = (run === '' ? 1 : parseInt(run, 10));
           life.repeat(runVals[line[i]], run).map(function(n) {
               return curPattern.push(n);
           });
           run = '';
       } else if(line[i] == '$') {
           pushCurrent();
       } else if(line[i].match(/\d/)) {
           run += line[i];
       } else if(line[i] == '!') {
           pushCurrent();
       } else {
           throw "Invalid RLE";
       }
    }
    return pattern;
}



life.parseRle = function(rle) {
    var rleSpec, rleLines;
    rleLines = rle.split('\n');

    if(rleLines.length < 2) { return null; }
    rleSpec = life.parseFirstRleLine(rleLines[0]);
    rleLines = rleLines.slice(1).map(function(n) { return n.trim() }).join('');

    return life.parseRleLine(rleLines, rleSpec.x, rleSpec.y);
}


life.brushes = {
    'block': [ [1,1],[1,1] ],
    'glider': [ [0,1,0],[0,0,1],[1,1,1] ],
    'r-pentomino': [ [0,1,1],[1,1,0],[0,1,0] ],
    'acorn': [ [0,1,0,0,0,0,0],[0,0,0,1,0,0,0],[1,1,0,0,1,1,1] ],
    'b-heptomino': [ [1,0,1,1],[1,1,1,0],[0,1,0,0] ],
    'big-glider': [ [0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,1,0,0,1,1,1,0,0,0,0,0,0,0,0,0],
                    [0,0,0,1,0,0,1,1,1,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
                    [1,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],
                    [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
                    [0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [0,1,0,0,1,0,0,0,0,0,1,0,1,1,0,0,0,0],
                    [0,1,0,0,0,0,0,0,0,0,0,1,1,0,1,0,0,0],
                    [0,0,0,1,0,1,0,0,0,0,0,0,1,1,0,0,1,0],
                    [0,0,0,0,1,1,0,1,0,0,0,0,1,1,0,0,0,1],
                    [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0],
                    [0,0,0,0,0,0,0,1,1,1,1,0,0,0,1,0,1,0],
                    [0,0,0,0,0,0,0,1,0,1,1,0,0,0,1,1,1,1],
                    [0,0,0,0,0,0,0,0,1,0,0,0,1,1,0,1,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0],
                    [0,0,0,0,0,0,0,0,0,1,0,1,1,1,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0] ],
    'gosper-glider-gun': [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,1,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ],
    'puffer-2': [ [0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
                  [1,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
                  [0,0,0,1,0,0,0,0,1,1,1,0,0,0,0,0,0,1],
                  [0,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,1],
                  [0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0] ],
    'time-bomb': [ [0,1,0,0,0,0,0,0,0,0,0,0,0,1,1],
                   [1,0,1,0,0,0,0,1,0,0,0,0,0,0,1],
                   [0,0,0,0,0,0,0,1,0,0,0,0,1,0,0],
                   [0,0,1,0,0,1,0,0,0,1,0,0,1,0,0],
                   [0,0,1,1,0,0,0,0,0,0,1,0,0,0,0],
                   [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0] ],
    'ants': [ 
    [1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0],
    [0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1],
    [0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1],
    [1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0] ],
    'quadfuse': [ 
    [0,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0],
    [0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1],
    [0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1],
    [1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0] ],
    'titanic-toroidal-traveler': [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,1,1,1,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,1,1,1,0] ],
    '4-8-12-diamond': [
    [0,0,0,0,1,1,1,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,1,1,0,0,0,0] ]
};

life.prototype.arrayContains = function(arr, n) {
    for(var i = 0; i < arr.length; i++) {
        if(arr[i] === n) return true;
    }
    return false;
}

life.prototype.addRule = function(type, n) {
    this.rules[type][n] = 1;
}

life.prototype.removeRule = function(type, n) {
    this.rules[type][n] = 0;
}

life.prototype.neighbors = function(xp, yp) {
    var n = 0;
    var xVals, yVals;
    
    if(xp-1 == -1) { xVals = this.wrap ? [this.x-1, 0, 1] : [0, 1]; }
    else if(xp+1 == this.x) { xVals = this.wrap ? [xp-1, xp, 0] : [xp-1, xp]; }
    else { xVals = [xp-1, xp, xp+1]; }
    
    if(yp-1 == -1) { yVals = this.wrap ? [this.y-1, 0, 1] : [0, 1]; }
    else if(yp+1 == this.y) { yVals = this.wrap ? [yp-1, yp, 0] : [yp-1, yp]; }
    else { yVals = [yp-1, yp, yp+1]; }
    
    for(var i = 0; i < xVals.length; i++) {
       for(var j = 0; j < yVals.length; j++) {
           if(xVals[i] == xp && yVals[j] == yp) continue;
           n += this.board[yVals[j]*this.x+xVals[i]];
       }
    }        
    
    return n;
}

life.prototype.step = function() {
    var neigh, hit;
    
    for(var i = 0; i < this.x; i++) {
        for(var j = 0; j < this.y; j++) {
            neigh = this.neighbors(i, j);
            hit = false;
            this.calcBoard[j*this.x+i] = this.board[j*this.x+i]
                ? (this.rules['survive'][neigh] ? 1 : 0)
                : (this.rules['born'][neigh] ? 1 : 0);
        }
    }
    
    var tempBoard = this.board;
    this.board = this.calcBoard;
    this.calcBoard = tempBoard;
}

life.prototype.randomize = function() {
    this.setBoard(function() { return Math.random() > .5 ? 1 : 0; });
}

life.prototype.stripe = function() {
    this.setBoard(function(x, y) { return y % 20 ? 0 : 1; });
}

life.prototype.clear = function() {
    this.setBoard(function() { return 0; });
}

life.prototype.setBoard = function(cb) {
    for(var i = 0; i < this.x; i++) {
        for(var j = 0; j < this.y; j++) {
            this.board[j*this.x+i] = cb(i, j);
        }
    }
}

life.prototype.drawString = function() {
    var buffer = [];
    var sBuffer = '';
    for(var i = 0; i < this.x*this.y; i++) {
        if(!((i+1)%this.x)) {
            buffer.push(this.board[i]);
            sBuffer = sBuffer + buffer.join(',') + "\n";
            buffer = [];
        } else {
            buffer.push(this.board[i]);
        }
    }
    sBuffer = sBuffer + buffer.join(',') + "\n";
    console.log(sBuffer);
}

life.prototype.draw = function(context, imageData) {  
    imageData = imageData || c.createImageData(this.x, this.y);  
    for(var i = 0; i < this.x*this.y; i++) {
        var index = 4*i;
        imageData.data[index+0] = this.board[i]*256;
        imageData.data[index+1] = this.board[i]*256;
        imageData.data[index+2] = this.board[i]*256;
        imageData.data[index+3] = 0xff;
    }
    
    context.putImageData(imageData, 0, 0);
}

life.prototype.paintPattern = function(x, y, pat) {
    for(var i = 0; i < pat.length; i++) {
        for(var j = 0; j < pat[i].length; j++) {
            this.board[(y+i)*l.x+(x+j)] = 
                pat[i][j];
        }
    }
}


life.prototype.Click = function(event, that){
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = that;

    do{
        totalOffsetX += currentElement.offsetLeft;
        totalOffsetY += currentElement.offsetTop;
    }
    while(currentElement = currentElement.offsetParent)

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    this.paintPattern(canvasX, canvasY, this.activeBrush);
}

life.prototype.go = function(ms) {
    this.step();
    this.draw(c, imageData);
    var that = this;
    if(this.living) { 
        setTimeout(function() { that.go(ms) }, ms);
    }
}

life.prototype.stop = function() {
    this.living = false;
}

var init = function() {
    canEl = document.getElementById('lifecan');
    c = canEl.getContext("2d");
    width = parseInt(canEl.getAttribute("width"));
    height = parseInt(canEl.getAttribute("height"));
    
    l = new life(width, height, true);
    imageData = c.createImageData(l.x, l.y);
    l.randomize();
    l.draw(c, imageData);
}

var step = function() {
    l.step();
    l.draw(c, imageData);
}

function animate() { step(); setTimeout(animate, 10); }

