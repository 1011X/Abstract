# Abstract

Version: 0.3.0b

Abstract is a toy sandbox-style game where you can connect different types of vertices with different effects to form graphs that behave in a particular way. The idea for this came from asking myself, "What would the *opposite* of Minecraft look like?".


## Description

The rules of the game are that you can connect vertices by arcs (or arrows) that allow for transmitting of a numeric value, or by edges that enforce their length. The vertices themselves can have different effects, 


## Vertex Types

There are a variety of vertex types, and their effects range from mechanical movement to electromagnetic forces to logic.

**Neuron**: If the sum of its inputs pass a given threshold, it outputs a constant value to all neighbors. By default, the threshold is 1 and the output signal is 1. Might implement wear-out in the future.

**Anchor**: The position of this vertex in the world is fixed, and cannot be moved by mouse, other vertices, or any unstoppable forces (untested).

### Logic

**Min**: The numerical equivalent of a boolean AND gate. Outputs the smallest number it receives as input. If there are no inputs, it returns positive infinity.

**Max**: The numerical equivalent of a boolean OR gate. Outputs the largest number it receives as input. If there are no inputs, it returns negative infinity.

**Negate**: The numerical equivalent of a boolean NOT gate. Outputs the negation of the max of its inputs. This also makes it a NOR gate. If there are no inputs, it returns positive infinity.

### Interaction

**Feedback**: Shows the value of the sum of its inputs. Doesn't output anything.

**Switch**: Can be in an off or on state. On state outputs positive infinity to all neighbors. Off state outputs negative infinity to all neighbors. Default state is off.

### Planned Types

**Light/Shadow**: Brightness or darkness that depending on the sign of the sum of the inputs.

**Extend**: Extends or retracts the length of connecting edges when receiving a signal, depending on the sign of the input.

**Rotator**: Rotates neighbors connected by edge when receiving a non-zero input signal. I've yet to decide if the vertex will remain fixed, or if it'll take other vertices into account and rotate around a center-point.

**Positive/Negative**: Vertices with a positive or negative charge that move depending on the surrounding electric field. It might be a type that is charged based on input, or inductively based on surrounding vertices.


## Planned Features

* Collision detection (maybe?)
* Forces (eg. gravitational, electromagnetic)
* Multiple vertex selection

### Ideas

* World generation
* Time system

### Optimizations to Implement

* Clear only areas that graph components take up.
* Sort vertices to draw by type
* If new value not given for update, assume last value.
  * Only update when vertex explicitly asks, or when arc values change.
