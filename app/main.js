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
				url: '/',
				templateUrl: 'index.html'
			})
			.state('home', {
				url: '/home',
				templateUrl: 'home.html'
			})
			.state('history', {
				url: '/history',
				templateUrl: 'history.html'
			});

	
	}])
	.controller('AppController', function($scope, $state, $anchorScroll, $location, $timeout) {
		$scope.msg = "it owrksss!";
		console.log($scope.msg);

		$scope.currentItem = 'rms';

		$scope.goto = function(str) {
			$state.go(str);
		};

	});


app
	.directive('thermocard', function($timeout) {
		return {
			restrict: 'E',
			template: '<div id="thermocard"></div>',
			scope: {starttemp : '@', endtemp: '@', mode: '@', room: '@'},
			controller: function($scope, $timeout) {				
			},
			link: function($scope, elem) {

				var warm = "#FFA717";
				var cool = "#03BEEF";



				var tempToPo = function(t, radius) {
					if (t >= 70) {
						var i = t - 70;
					} else {
						var i = 10 + (10 - (70-t));
					}

					var x = 0 + radius * Math.sin(2 * Math.PI * i / 20);
    			var y = 0 - radius * Math.cos(2 * Math.PI * i / 20);   
    			return {x, y};
				};

				var iniThermo = function(e) {
					
						var element = d3.select(elem[0].firstChild);
			
						var width = elem[0].clientWidth,
						    height = elem[0].clientHeight,
						    twoPi = 2 * Math.PI;

						var radius = width/2*0.8;
						// var circumference_r = 100;

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
						  .style("fill", warm)
						  .attr("transform", "translate(" + -width/2 + "," + -height/2 + ")");


						var container = svg.append("g");

						var circumference = container.append('circle')
						  .attr('r', radius)
						  .attr('class', 'circumference')
						  .attr("fill", warm);

						handle = [{
						  x: tempToPo($scope.starttemp, radius).x,
						  y: tempToPo($scope.starttemp, radius).y,
						  id: 'first'
						}, {
						  x: tempToPo($scope.endtemp, radius).x,
						  y: tempToPo($scope.endtemp, radius).y,
						  id: 'second'
						}];

						circle = container.append("g")
						  .attr("class", "dot")
						    .selectAll('circle')
						  .data(handle)
						    .enter().append("circle")
						  .attr("r", 20)
						  .attr("cx", function(d) { return d.x;})
						  .attr("cy", function(d) { return d.y;})
						  .attr("id", function(d) { return d.id;})
						  .call(drag);

						var aa =  Math.atan2(handle[0].y,handle[0].x)-Math.atan2(-radius, 0);
						var bb =  Math.atan2(handle[1].y,handle[1].x)-Math.atan2(-radius, 0);

						var arc = d3.svg.arc()
						    .innerRadius(97)
						    .outerRadius(103)
						 
						var fg = container.append("path")
						    .style("fill", "#fff")
						    .attr("class", "foreground")

						function dragstarted(d) {
						  d3.event.sourceEvent.stopPropagation();
						  d3.select(this)
						    .classed("dragging", true);
						}

						function dragged(d) {  

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
						  } else if (handle[0].x >= -100 && handle[0].y >= 0) {
						    d.x = -100;
						    d.y = 0;  
						    d3.select(this)
						        .attr("cx", d.x)
						        .attr("cy", d.y);
						  } else if (handle[1].x <= 25 && handle[1].y >= 95) {
						  	d.x = 20;
						    d.y = 96;  
						    d3.select(this)
						        .attr("cx", d.x)
						        .attr("cy", d.y);
						  }
						  console.log(handle[1].x + "; " +handle[1].y )

						  var bIntersect = [];
						  bIntersect = intersection(0, 0, 100,  handle[1].x, handle[1].y, 20);
						  var bx = bIntersect[1];
						  var by = bIntersect[3];

						  var aIntersect = [];
						  aIntersect = intersection(0, 0, 100,  handle[0].x, handle[0].y, 20);
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
						}
				}

				$timeout(function(){
					iniThermo(elem);


				
				}, 100)




				function intersection(x0, y0, r0, x1, y1, r1) {//credit to http://stackoverflow.com/questions/12219802/a-javascript-function-that-returns-the-x-y-points-of-intersection-between-two-ci
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


