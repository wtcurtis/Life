life = function(x, y, wrap, board) {
    this.x = x;
    this.y = y;
    this.wrap = wrap;
    this.board = board || new Uint8Array(x*y);
    this.prevCols = [0, 0];
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
    var nBoard = new Uint8Array(this.x*this.y),
        neigh;
    
    for(var i = 0; i < this.x; i++) {
        for(var j = 0; j < this.y; j++) {
            neigh = this.neighbors(i, j);
            if(this.board[j*this.x+i]) {
                switch(neigh) {
                    case 0:
                    case 1:
                        nBoard[j*this.x+i] = 0;
                        break;
                    case 2:
                    case 3:
                        nBoard[j*this.x+i] = 1;
                        break;
                    default:
                        nBoard[j*this.x+i] = 0;
                        break;
                }
            } else {
                nBoard[j*this.x+i] = (neigh == 3 ? 1 : 0);
            }
        }
    }
    
    this.board = nBoard;
}

life.prototype.randomize = function() {
    for(var i = 0; i < this.x*this.y; i++) {
        this.board[i] = (Math.random() > .5 ? 1 : 0);
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

life.prototype.Click = function(event){
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = this;

    do{
        totalOffsetX += currentElement.offsetLeft;
        totalOffsetY += currentElement.offsetTop;
    }
    while(currentElement = currentElement.offsetParent)

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    l.board[canvasY*l.x+canvasX] = 1;
    l.board[canvasY*l.x+canvasX+1] = 1;
    l.board[(canvasY+1)*l.x+canvasX] = 1;
    l.board[(canvasY+1)*l.x+canvasX+1] = 1;
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

