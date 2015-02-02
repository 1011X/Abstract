Abstract
========

To Do
-----

Work on handling UI better.


Bugs
----

None currently known.


Features
--------

Energy vertex can power other vertices.

Rotator vertex can rotate other vertices connected by an arc if powered, and the speed of rotation depends on how much power it receives.

Switch vertices can be toggled by right-clicking. NOR vertices will turn on if they don't receive any power. Feedback vertices will change their shade of gray based on the power they receive between 0 and 1 (higher or lower values will currently be clamped).



Planned Features
----------------

* More vertex types:
	* Light vertex
	* Extend vertex
	* Timer vertex


Ideas
-----

* Checking nearby collisions using hex-grids for partitions
* Maybe take advantage of the hex-grids and make something that uses them and makes them **visible**.