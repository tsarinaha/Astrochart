// ## Radix chart ###################################
(function( astrology ) {
	
	var context;
    
	/**
	 * Radix charts.
	 * 
	 * @class
	 * @public
	 * @constructor
 	 * @param {astrology.SVG} paper 
	 * @param {int} cx
	 * @param {int} cy
	 * @param {int} radius
	 * @param {Object} data
	 */
	astrology.Radix = function( paper, cx, cy, radius, data ){
		
		// Validate data
		var status = validate(data);		 		
		if( status.hasError ) {
			console.error( status.messages);								
			throw new Error( status.messages );
		}
		
		this.data = data;								
		this.paper = paper; 
		this.cx = cx;
		this.cy = cy;
		this.radius = radius;
		
		this.shift = 0;		
		if(this.data.cusps && this.data.cusps[0]){
			var deg360 = astrology.utils.radiansToDegree(2*Math.PI);
			this.shift = deg360 - this.data.cusps[0];	
		}	
				
		this.universe = document.createElementNS(this.paper.root.namespaceURI, "g");
		this.universe.setAttribute('id', astrology.ID_RADIX);
		this.paper.root.appendChild( this.universe );
		
		context = this;
			
		return this;
	};
	
	/**
	 * Draw universe.
	 */
	astrology.Radix.prototype.drawUniverse = function(){
		var universe = this.universe;
		
		// colors 
        for( var i = 0, step = 30, start = this.shift, len = astrology.COLORS_SIGNS.length; i < len; i++ ){        	        	                	
        	
        	var bottomSegment = this.paper.segment( this.cx, this.cy, this.radius-this.radius/astrology.INNER_CIRCLE_RADIUS_RATIO, start, start+step, this.radius/astrology.INDOOR_CIRCLE_RADIUS_RATIO, astrology.COLORS_SIGNS[i]);
        	bottomSegment.setAttribute("fill-opacity", astrology.COLOR_OPACITY);
        	universe.appendChild( bottomSegment );
        	
        	var topSegment = this.paper.segment( this.cx, this.cy, this.radius, start, start+step, this.radius-this.radius/astrology.INNER_CIRCLE_RADIUS_RATIO, astrology.COLORS_SIGNS[i]);
        	universe.appendChild( topSegment );
        	        	        	        	               		
			start += step;
        };
	};
	
	/**
	 * Draw points
	 */
	astrology.Radix.prototype.drawPoints = function(){
		var universe = this.universe;
		
		// Planets can not be displayed on the same radius.
		// The gap between indoor circle and outdoor circle / count of planets
		var margin = astrology.MARGIN_POINTS * astrology.SYMBOL_SCALE;
		var gap = this.radius - (this.radius/astrology.INNER_CIRCLE_RADIUS_RATIO + this.radius/astrology.INDOOR_CIRCLE_RADIUS_RATIO);
		var radiusStep = (gap - margin) / Object.keys(this.data.points).length;	
		var planetRadius = (this.radius/astrology.INDOOR_CIRCLE_RADIUS_RATIO) + margin;
									
		for (var planet in this.data.points) {
 		   if (this.data.points.hasOwnProperty( planet )) {
 		   		var position = astrology.utils.getPointPosition( this.cx, this.cy, planetRadius, this.data.points[planet] + this.shift);
        		universe.appendChild( this.paper.getSymbol(planet, position.x, position.y));
        		planetRadius += radiusStep;
    		}
		}		
	};
	
	/**
	 * Draw cusps
	 */
	astrology.Radix.prototype.drawCusps = function(){
		if(this.data.cusps == null){
			return;
		}
		
		var universe = this.universe;
		
		var textRadius = this.radius/astrology.INDOOR_CIRCLE_RADIUS_RATIO + (this.radius - (this.radius/astrology.INNER_CIRCLE_RADIUS_RATIO + this.radius/astrology.INDOOR_CIRCLE_RADIUS_RATIO) )/1.2;
		
		//Cusps
		for (var i = 0, ln = this.data.cusps.length; i < ln; i++) {
 			
 			// Lines
 			var bottomPosition = astrology.utils.getPointPosition( this.cx, this.cy, this.radius/astrology.INDOOR_CIRCLE_RADIUS_RATIO, this.data.cusps[i] + this.shift);
 			var topPosition = astrology.utils.getPointPosition( this.cx, this.cy, this.radius, this.data.cusps[i] + this.shift);
 		 	universe.appendChild( this.paper.line( bottomPosition.x, bottomPosition.y, topPosition.x, topPosition.y, astrology.COLOR_LINE, "5, 5"));
 		 	
 		 	// Text
 		 	var deg360 = astrology.utils.radiansToDegree(2*Math.PI);
 		 	var startOfCusp = this.data.cusps[i];
 		 	var endOfCusp = this.data.cusps[ (i+1)%12 ];
 		 	var gap = endOfCusp - startOfCusp > 0 ? endOfCusp - startOfCusp : endOfCusp - startOfCusp + deg360;
 		 	var textPosition = astrology.utils.getPointPosition( this.cx, this.cy, textRadius, ((startOfCusp + gap/2) % deg360) + this.shift  );
 		 	universe.appendChild( this.paper.text( i+1, textPosition.x, textPosition.y, astrology.FONT_SIZE + "px", astrology.FONT_COLOR ));
 		 	
 		 	// As
 		 	if(i == 0){
 		 		textPosition = astrology.utils.getPointPosition( this.cx, this.cy, textRadius, this.data.cusps[i] + this.shift);
 		 		universe.appendChild( this.paper.text( "As", textPosition.x, textPosition.y, astrology.FONT_SIZE * 1.5 + "px", astrology.FONT_COLOR ));
 		 	}
 		 	
 		 	// Mc
 		 	if(i == 9){
 		 		textPosition = astrology.utils.getPointPosition( this.cx, this.cy, textRadius, this.data.cusps[i] + 2 + this.shift);
 		 		universe.appendChild( this.paper.text( "Mc", textPosition.x, textPosition.y, astrology.FONT_SIZE * 1.5 + "px", astrology.FONT_COLOR ));
 		 	}
		}
	};
	
	/**
	 * Draw aspects
	 */
	astrology.Radix.prototype.drawAspects = function(){
		if(this.data.aspects == null){
			return;
		}
		
		var universe = this.universe;
		
        for( var i = 0, len = this.data.aspects.length; i < len; i++ ){ 
        	var startPosition = astrology.utils.getPointPosition( this.cx, this.cy, this.radius/astrology.INDOOR_CIRCLE_RADIUS_RATIO, this.data.aspects[i][0] + this.shift);
        	var endPosition = astrology.utils.getPointPosition( this.cx, this.cy, this.radius/astrology.INDOOR_CIRCLE_RADIUS_RATIO, this.data.aspects[i][1] + this.shift);
        	universe.appendChild( this.paper.line( startPosition.x, startPosition.y, endPosition.x, endPosition.y, this.data.aspects[i][2]));
        }
	};
	
	/**
	 * Draw signs symbols
	 * .
	 */
	astrology.Radix.prototype.drawSigns = function(){
		var universe = this.universe;
		
		// signs
        for( var i = 0, step = 30, start = 15 + this.shift, len = astrology.SYMBOL_SIGNS.length; i < len; i++ ){ 
        	var position = astrology.utils.getPointPosition( this.cx, this.cy, this.radius - (this.radius/astrology.INNER_CIRCLE_RADIUS_RATIO)/2, start);       	        	                	
        	universe.appendChild( this.paper.getSymbol( astrology.SYMBOL_SIGNS[i], position.x, position.y));        	        	        	               		
			start += step;
        }
	};
	
	/**
	 * Draw circles
	 * .
	 */
	astrology.Radix.prototype.drawCircles = function(){
		var universe = this.universe;
		
		//outdoor circle
        universe.appendChild( this.paper.circle( this.cx, this.cy, this.radius, astrology.COLOR_CIRCLE));
       	
       	//inner circle
        universe.appendChild( this.paper.circle( this.cx, this.cy, this.radius-this.radius/astrology.INNER_CIRCLE_RADIUS_RATIO, astrology.COLOR_CIRCLE));
        
        //indoor circle
       	universe.appendChild( this.paper.circle( this.cx, this.cy, this.radius/astrology.INDOOR_CIRCLE_RADIUS_RATIO, astrology.COLOR_CIRCLE));
       	
       	// rays
        var lineLength = 3;
        for( i = 0, start = 0, step = 5;i < 72; i++ ){ 
            var startPosition = astrology.utils.getPointPosition( this.cx, this.cy, this.radius, start );
        	var endPosition = astrology.utils.getPointPosition( this.cx, this.cy, this.radius + lineLength, start );
       		universe.appendChild( this.paper.line( startPosition.x, startPosition.y, endPosition.x, endPosition.y, astrology.COLOR_CIRCLE));
       		start += step;
       	}
	};
	
	/*
	 * Checks a source data
	 * @private
	 * 
	 * @param {Object} data
	 * @return {Object} status
	 */
	function validate( data ){
		var status = {hasError:false, messages:[]};
		
		if( data == null ){			
			status.messages.push( "Data is not set." );
			status.hasError = true;
			return status;
		}
		
		if(data.points == null){					
			status.messages.push( "There is not property 'points'." );
			status.hasError = true;
		}
		
		if(data.cusps != null && !Array.isArray(data.cusps)){
			status.messages.push( "Property 'cusps' has to be Array." );
			status.hasError = true;
		}
		
		if(data.cusps != null && data.cusps.length != 12){			
			status.messages.push( "Count of 'cusps' values has to be 12." );
			status.hasError = true;
		}
		
		if(data.aspects != null && !Array.isArray(data.aspects)){
			status.messages.push( "Property 'aspects' has to be Array." );
			status.hasError = true;			
		}
						
		return status;	
	};
	
}( window.astrology = window.astrology || {}));