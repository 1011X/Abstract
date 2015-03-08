Abstract
========

Version: 2.1.1

Abstract is a game that [insert game description here].


Features
--------

Rotator vertex can rotate other vertices connected by an arc if powered, and the speed of rotation depends on how much power it receives.

Switch vertices can be toggled by right-clicking.
NOR vertices will turn on if they don't receive any power.
Feedback vertices will change their shade of gray based on the power they receive between 0 and 1 (higher or lower values are currently clamped).


Planned Features
----------------

* More vertex types:
	* Light vertex
	* Extend vertex
	* Timer vertex
	* Some kind of movement vertex
		* Can move self or others or both?
* Collision detection (?)
* Effective drawing techniques
	* Sort vertices to draw by type
	* Calculate "dirty" areas to clear
* Add something that appeals to those without computer science majors