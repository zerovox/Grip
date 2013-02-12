define([
    'fabric'
], function (fabric) {

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
            ctx.textAlight = "center"
            ctx.strokeStyle = "#2284A1"
            ctx.fillStyle = "rgba(0, 0, 0, 0.85)"
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
            ctx.beginPath();
            ctx.arc(this.width / 2 - 1, 0, 10, -Math.PI / 2, Math.PI / 2)
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#fff"
            ctx.textAlign = 'center'
            if (this.arg !== undefined)
                ctx.fillText(this.arg, 0, 0, this.width - 20);
            else
                ctx.fillText(this.name, 0, 0, this.width - 20);
        }

    })

});