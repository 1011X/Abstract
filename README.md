# Abstract

Version: 0.2.2b

Abstract is a game that [insert game description here].


## Features

Rotator vertex can rotate other vertices connected by an arc if powered, and the
speed of rotation depends on how much power it receives.

Switch vertices can be toggled by right-clicking.
Feedback vertices will be white if +Infinity, black if -Infinity, and gray with
a number shown if a value in between or NaN.


## Planned Features

* More vertex types:
	* Light vertex
	* Extend vertex
	* Timer vertex
	* Some kind of movement vertex
		* Can move self or others or both?
* Collision detection (?)
* Add something that appeals to those without computer science majors.


### Optimizations to Implement

* Clear only areas that graph components take up.
* Sort vertices to draw by type
* If new value not given for update, assume last value.