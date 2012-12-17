define([
	'backbone',
	'mustache'
	], function(Backbone, Mustache) {

		return Backbone.View.extend({
			initialize : function(functionsCollection){
			},
			render : function(){
				var canvas = new fabric.Canvas('functionList');
				var resize = function(){
					var h = Math.max(200, ($(window).height() - 200)*0.3);
					var w = $(window).width()>800?$(window).width()*10/12-40:$(window).width()-40;
					canvas.setHeight(h);
					canvas.setWidth(w);
				};
				$(window).resize(resize);			
				resize();	

				var rect = new fabric.Rect({
					width: 100,
					height: 100,
					top: 150,
					left: 150,
					fill: 'rgba(255,0,0,0.5)'
				});

				canvas.add(rect);
			}
		});



	});