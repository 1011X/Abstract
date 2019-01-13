# Abstract

Abstract is a toy sandbox-style game where you can connect different types of vertices with different effects to form complex graphs. It is currently in alpha-level quality, so don't expect *too* much.


## Description

The rules of the game are that you can connect vertices by arcs (i.e arrows, or directed connections) or by edges (undirected connections). Arcs can transmit a numeric value. Edges enforce their length (currently unimplemented). The vertices themselves can have different effects, as described below.


## Vertex Types

**Degree**: Displays the degree of the vertex (how many edges, not arcs) it has. It also outputs this information as a numerical value via arcs.

**Anchor**: The position of this vertex in the world is fixed, and cannot be moved by mouse, other vertices, or any unstoppable forces (untested).

**Meter**: Shows the value of the sum of its inputs. Re-transmits its input.

**Switch**: Can be in an off or on state. On state outputs positive one to all neighbors. Off state outputs negative one. Default state is off.

**Min**: The numerical equivalent of a boolean AND gate. Outputs the smallest number it receives as input. If there are no inputs, it returns positive infinity.

**Max**: The numerical equivalent of a boolean OR gate. Outputs the largest number it receives as input. If there are no inputs, it returns negative infinity.

**Negate**: The numerical equivalent of a trinary NOT gate. Takes the biggest input, negates it, and outputs it. If there are no inputs, it outputs positive infinity.

**Neuron**: Only sends a signal when the inputs surpass a certain threshold. Current threshold is 3.

**Sensor**: Gives a value from 0 to 1 of how close the closest vertex is. Detection ends at 0, which is 240 pixels away.

### Under construction

**Rotator**: Rotates neighbors connected by edge when receiving a non-zero input signal. Negative values rotate counter-clockwise, positive values rotate clockwise. Currently doesn't rotate in a perfect circle.

<!--
### Planned Types

**Extend**: Extends or retracts the length of connecting edges when receiving a signal, depending on the sign of the input.

**Quantum**: Vertices that output different values based on their stored probabilities.

## Planned Features

* Forces (eg. gravitational, electromagnetic)

### Optimizations to Implement

* Clear only areas that graph components take up.
  - Turns out it just uses more CPU :c
* Sort vertices to draw by type
* If new value not given for update, assume last value.
  * Only update when vertex explicitly asks, or when arc values change.
-->
