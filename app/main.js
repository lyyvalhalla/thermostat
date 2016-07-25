require('jquery');
require('angular');
require('angular-material');
require('angular-ui-router');
require('d3');


var app = angular.module('App', ['ngMaterial', 'ui.router']);



app
	.config(['$stateProvider', function($stateProvider) {
		$stateProvider
			.state('index', {
				url: '',
				templateUrl: 'home.html'
			})
			.state('home', {
				url: '/home',
				templateUrl: 'home.html'
			})
			.state('history', {
				url: '/history',
				templateUrl: 'history.html'
			})
			.state('setting', {
				url: '/setting',
				templateUrl: 'setting.html'
			});

	
	}])
	.controller('AppController', function($scope, $state, $anchorScroll, $location, $timeout) {
		$scope.msg = "it owrksss!";
		$scope.currentItem = 'rms';
		$scope.allon = true;
		$scope.roomData = [
			"Living Room",
			"Hallway",
			"Bedroom",
			"Kitchen"
		];

		$scope.goto = function(str) {
			$state.go(str);
		};

		$scope.onChange = function(st) {
			$scope.allon = st;
			console.log($scope.allon);
		}

	});



app
	.directive('thermocard', function($timeout, $state) {
		return {
			restrict: 'E',
			template: '<div id="thermocard"></div>',
			scope: {starttemp : '@', endtemp: '@', mode: '@', room: '@', currenttemp: '@', allon: '@'},
			controller: function($scope, $timeout) {		
			},
			link: function($scope, elem) {
				var color;
				var cX = 0;
				var cY = 0;
				var interval = 30;
				var min = 60, max = 80;

				var tempToPo = function(t, radius, centerX, centerY) {
					if (t >= 70) {
						var i = t - 70;
					} else {
						var i = interval/2 + (interval/2 - (70-t));
					}

					var x = centerX + radius * Math.sin(2 * Math.PI * i / interval);
    			var y = centerY - radius * Math.cos(2 * Math.PI * i / interval);   
    			return {x, y};
				};

				var poToTemp = function(x, y, radius, centerX, centerY) {
					 var i =  Math.asin((x - centerX)/radius)/2/Math.PI*interval + 70;
					 return i;
				}

				var iniThermo = function(e) {
						if ($scope.mode ==='warm') {
							color = "#FFA717";
						} else if ($scope.mode==='cool') {
							color = "#03BEEF";
						} else if ($scope.mode ==='off') {
							color = "#4a4a4a";
						}
					
						var element = d3.select(elem[0].firstChild);
			
						var width = elem[0].clientWidth,
						    height = elem[0].clientHeight,
						    twoPi = 2 * Math.PI;

						var radius = width/2*0.8;
						

						var drag = d3.behavior.drag()
						  .origin(function(d) { return d; })
						  .on("dragstart", dragstarted)
						  .on("drag", dragged)
						  .on("dragend", dragended);
						  
						var svg = element.append("svg")
						  .attr("width", width)
						  .attr("height", height)
						  .append("g")
						  	.attr("width", width)
						  	.attr("height", height)
						    .attr("transform", "translate(" + width/2 + "," + height/2 + ")");

						svg.append('rect')
							.attr("width", width)
						  .attr("height", height)
						  .attr("rx", 10)
						  .attr("ry", 10)
						  .style("fill", color)
						  .attr("transform", "translate(" + -width/2 + "," + -height/2 + ")");


						var title = svg.append('text')
							.attr("id", "roomTitle")
							.attr("x", -10)
							.attr("y", -radius)
							.style({"fill": "#fff", "text-anchor": "middle"})
							.attr("font-size", "30px")
							.text($scope.room);

						var schedule = svg
					  	.append("svg:image")
							.attr("id", "on")
							.attr('width', 23)
   						.attr('height', 23)
						  .attr("x", function(){return title.node().getBBox().width/2;})
							.attr("y", -radius-23)
					    .attr("xlink:href", "http://yiyang.io/assets/calendar.svg");

						var container = svg.append("g")
							.attr("transform", "translate(" + cX + "," + 50 + ")");

						var circumference = container.append('circle')
						  .attr('r', radius)
						  .attr('class', 'circumference')
						  .attr("fill", color);

						var radial = d3.svg.arc()
							.innerRadius(radius-3)
					    .outerRadius(radius+3)

					  var bg = container.append("path")
						    .style("fill", color)
						    .attr("class", "background");

						var arc = d3.svg.arc()
					    .innerRadius(radius-3)
					    .outerRadius(radius+3);

					  var fg = container.append("path")
						    .style("fill", "#fff")
						    .attr("class", "foreground")

						var handle = [{
						  x: tempToPo($scope.starttemp, radius, cX, cY).x,
						  y: tempToPo($scope.starttemp, radius, cX, cY).y,
						  temp: $scope.starttemp,
						  id: 'first'
						}, {
						  x: tempToPo($scope.endtemp, radius, cX, cY).x,
						  y: tempToPo($scope.endtemp, radius, cX, cY).y,
						  temp: $scope.endtemp,
						  id: 'second'
						}];

						var aa =  Math.atan2(handle[0].y,handle[0].x)-Math.atan2(-radius, cX);
						var bb =  Math.atan2(handle[1].y,handle[1].x)-Math.atan2(-radius, cY);

						var da = Math.atan2(tempToPo(min, radius, cX, cY).y,tempToPo(min, radius, cX, cY).x)-Math.atan2(-radius, cX);
						var db = Math.atan2(tempToPo(max, radius, cX, cY).y,tempToPo(max, radius, cX, cY).x)-Math.atan2(-radius, cY);

					  radial
					    .startAngle(da)
					    .endAngle(db);

					  bg
					    .attr("d", radial);

					  if ($scope.mode !== 'off') {
					  	var circle = container.append("g")
							  .attr("class", "dot")
							    .selectAll('circle')
							  .data(handle)
							    .enter().append("circle")
							  .attr("r", 20)
							  .attr("cx", function(d) { return d.x;})
							  .attr("cy", function(d) { return d.y;})
							  .attr("id", function(d) { return d.id;})
							  .call(drag);

							var tempTitle = container.selectAll('text')
								.data(handle)
								.enter()
								.append("text")
								.attr("class", "tempTitle")
								.attr("id", function(d) {return d.id;})
								.attr("x", function(d) { return d.x;})
							  .attr("y", function(d) { return d.y;})
							  .attr("dy", "0.3em")
							  .style({"fill": color, "text-anchor": "middle", "font-size": "20px", "font-weight": 600})
							  .text(function(d) {return d.temp;});
					  }

				  	var currentConfig = container
							.append('text')
							.attr("id", "currentTemp")
							.attr("x", -20)
							.attr("y", cY+50)
							.style({"fill": "#fff", "text-anchor": "middle", "font-size": "30px", "font-weight": 600})
							.text("F");

						var secondConfig = container
							.append('text')
							.attr("id", "currentTemp")
							.attr("x", 15)
							.attr("y", cY+50)
							.style({"fill": "#fff", "text-anchor": "middle", "font-size": "26px", "font-weight": 300})
							.text("/  C");

						 
						var currentTemp = container
							.append('text')
							.attr("id", "currentTemp")
							.attr("x", cX)
							.attr("y", cY)
							.style({"fill": "#fff", "text-anchor": "middle", "font-size": "110px"})
							.text($scope.currenttemp);


				  var coolImg = container
				  	.append("svg:image")
						.attr("id", "on")
						.attr('width', 50)
 						.attr('height', 50)
					  .attr("x", function() {return tempToPo(min+1, radius, cX, cY).x-15;})
				    .attr("y", function() {return tempToPo(min+1, radius, cX, cY).y;})
				    .attr("xlink:href", function(d) {
				    	if ($scope.mode === 'cool') {
				    		return "http://yiyang.io/assets/cool.svg";
				    	} else {
				    		return "http://yiyang.io/assets/cooloff.svg";
				    	}
				    })
				    .on('click', function(){
				    	if ($scope.mode === 'cool') {
				    		$scope.mode = 'off';
				    	} else {
				    		$scope.mode = 'cool';
				    	}
				    	element.selectAll('svg').remove();
				    	iniThermo(e);
				    });

					  var warmImg = container
					  	.append("svg:image")
							.attr("id", "on")
							.attr('width', 50)
   						.attr('height', 50)
						  .attr("x", function() {return tempToPo(max-1, radius, cX, cY).x-30;})
					    .attr("y", function() {return tempToPo(max-1, radius, cX, cY).y;})
					    .attr("xlink:href", function(d) {
					    	if ($scope.mode === 'warm') {
					    		return "http://yiyang.io/assets/warm.svg";
					    	} else {
					    		return "http://yiyang.io/assets/warmoff.svg";
					    	}
					    })
					    .on('click', function(){
					    	if ($scope.mode === 'warm') {
					    		$scope.mode = 'off';
					    	} else {
					    		$scope.mode = 'warm';
					    	}
					    	element.selectAll('svg').remove();
					    	iniThermo(e);
					    });

						function dragstarted(d) {
						  d3.event.sourceEvent.stopPropagation();
						  d3.select(this)
						    .classed("dragging", true);
						}


						function dragged(d) { 
							
							svg.selectAll(".tempTitle").filter(function(f) {
							  	return f.id == d.id;
							  })
								.attr("x", function(f) { return d.x;})
							  .attr("y", function(f) { return d.y;})
						  	.text(parseInt(poToTemp(d.x, d.y, radius, cX, cY)));

						  d_from_origin = Math.sqrt(Math.pow(d3.event.x,2)+Math.pow(d3.event.y,2));
						  
						  alpha = Math.acos(d3.event.x/d_from_origin);
						  
						  d3.select(this)
						    .attr("cx", d.x = radius*Math.cos(alpha))
						    .attr("cy", d.y = d3.event.y < 0 ? -radius*Math.sin(alpha) : radius*Math.sin(alpha));
						 
						  if (d.id ==='first') {
						    handle[0].x = d.x;
						    handle[0].y = d.y;
						  }

						  if (d.id ==='second') {
						    handle[1].x = d.x;
						    handle[1].y = d.y;
						  }

						  if (handle[0].x >=0 && handle[1].x >=0) {
						    if (handle[0].y >= handle[1].y) {
						      d.x = handle[1].x;
						      d.y = handle[1].y;
						      d3.select(this)
						        .attr("cx", d.x = d.x )
						        .attr("cy", d.y = d.y);
						    } 
						  } else if (handle[0].x <= 0 && handle[1].x <= 0) {
						    if (handle[1].y >= handle[0].y) {
						      d.x = handle[0].x;
						      d.y = handle[0].y;  
						      d3.select(this)
						        .attr("cx", d.x = d.x)
						        .attr("cy", d.y = d.y);
						    }
						  } else if (handle[0].x >= -170 && handle[0].y >= -15) {
						    d.x = -170;
						    d.y = -15;  
						    d3.select(this)
						        .attr("cx", d.x)
						        .attr("cy", d.y);
						  } else if (handle[1].x <= 170 && handle[1].y >= 0) {
						  	d.x = 150;
						    d.y = 80;  
						    d3.select(this)
						        .attr("cx", d.x)
						        .attr("cy", d.y);
						  }
						  // console.log(handle[1].x + "; " +handle[1].y )

						  var bIntersect = [];
						  bIntersect = intersection(cX, cY, radius,  handle[1].x, handle[1].y, 20);
						  var bx = bIntersect[1];
						  var by = bIntersect[3];

						  var aIntersect = [];
						  aIntersect = intersection(cX, cY, radius,  handle[0].x, handle[0].y, 20);
						  var ax = aIntersect[0];
						  var ay = aIntersect[2];

						  var aa =  Math.atan2(ay,ax)-Math.atan2(-radius, 0);
						  var bb =  Math.atan2(by,bx)-Math.atan2(-radius, 0);

						  arc
						    .startAngle(aa)
						    .endAngle(bb);

						  fg
						    .attr("d", arc);
						}

						function dragended(d) {
						  d3.select(this)
						    .classed("dragging", false);

						  svg.selectAll(".tempTitle").filter(function(f) {
							  	return f.id == d.id;
							  })
							  .attr("x", function(f) { return d.x;})
							  .attr("y", function(f) { return d.y;})
						  	.text(parseInt(poToTemp(d.x, d.y, radius, cX, cY)));
						}
				}

				$timeout(function(){
					iniThermo(elem);


				
				}, 100)

				/* method to find intersection points on circle credits to 
				http://stackoverflow.com/questions/12219802/a-javascript-function-that-returns-the-x-y-points-of-intersection-between-two-ci */
				function intersection(x0, y0, r0, x1, y1, r1) {
				    var a, dx, dy, d, h, rx, ry;
				    var x2, y2;

				    dx = x1 - x0;
				    dy = y1 - y0;

				    d = Math.sqrt((dy*dy) + (dx*dx));

				    if (d > (r0 + r1)) {
				        return false;
				    }
				    if (d < Math.abs(r0 - r1)) {
				        return false;
				    }

				    a = ((r0*r0) - (r1*r1) + (d*d)) / (2.0 * d) ;

				    x2 = x0 + (dx * a/d);
				    y2 = y0 + (dy * a/d);

				    h = Math.sqrt((r0*r0) - (a*a));

				    rx = -dy * (h/d);
				    ry = dx * (h/d);

				    var xi = x2 + rx;
				    var xi_prime = x2 - rx;
				    var yi = y2 + ry;
				    var yi_prime = y2 - ry;

				    return [xi, xi_prime, yi, yi_prime];
				}
			}
		}
	});


