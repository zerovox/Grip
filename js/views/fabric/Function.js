define([
    'fabric'
], function (fabric) {
    //From: http://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.beginPath();
        this.moveTo(x+r, y);
        this.arcTo(x+w, y,   x+w, y+h, r);
        this.arcTo(x+w, y+h, x,   y+h, r);
        this.arcTo(x,   y+h, x,   y,   r);
        this.arcTo(x,   y,   x+w, y,   r);
        this.closePath();
        return this;
    }

    return fabric.util.createClass(fabric.Object, {
        initialize : function (name, height, width, options, arg) {
            this.height = height;
            this.width = width;
            this.callSuper('initialize', options)
            this.name = name;
            this.arg = arg;
        },
        _render    : function (ctx) {
            //ctx :: CanvasRenderingContext2D
            ctx.strokeStyle = "#2284A1"
            ctx.fillStyle = "rgba(34, 34, 34, 0.95)"
            ctx.roundRect(-this.width / 2, -this.height / 2, this.width, this.height, 4).fill();
            ctx.roundRect(-this.width / 2, -this.height / 2, this.width, this.height, 4).stroke();
            ctx.fillStyle = "#fff"
            ctx.textAlign = 'center'
            ctx.font = "11pt 'Helvetica Neue' Calibri"
            ctx.textBaseline = "middle"
            if (this.arg !== undefined)
                ctx.fillText(this.arg, 0, 0, this.width - 20);
            else
                ctx.fillText(this.name, 0, 0, this.width - 20);
        }

    })

});