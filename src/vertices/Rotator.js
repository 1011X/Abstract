/// Rotates an edge-connected component

/// The rotator works by taking the sum of all the energy received and
/// distributing it across its edge neighbors based on their distance. The
/// linear velocity of all edge neighbors are the same.

/// To make this interesting, let's make this more complicated than it needs to.
/// Here, we're equally distributing the total incoming energy, and distributing
/// it equally between each edge neighbor. We follow the equation of rotational
/// energy, with a moment of inertia equal to that of a rod with unit mass and
/// length equal to the distance between the vertices.

/// Visually:
///     E_rot = 1/2 I w^2
///           = 1/2 (1/3 m_rod l_rod^2) w^2 ; I = 1/3 m_rod l_rod^2
///           = 1/2 (1/3 r^2) (v/r)^2       ; l_rod = r, m_rod = 1, w = v/r
///           = 1/6 v^2
/// Solving for v, this will give us the linear velocity for the vertex.
///     v = sqrt(6 E_rot)

Vertex.Rotator = class extends Vertex.Base {
	update(h) {
	    // total of input values given
	    let e = h.inputs.reduce((acc, val) => acc + val, 0)
		
		for(let neighbor of h.neighbors) {
		    let dir = Math.sign(e)
		    let energy = Math.abs(e) / h.neighbors.length
		    // moment of inertia of rod
		    let v = Math.sqrt(6 * energy)
		    //neighbor.angle = 
		    neighbor.motion
		        .cloneFrom(this.pos)
		        .sub(neighbor.pos)
		        .rotate(1/4 * Math.TAU * dir)
		        .resize(v)
		}
		
		return 0
	}
}

Vertex.Rotator.prototype.style = new VertexStyle("lightgreen", {
	symbol: "⛭",
	gradient: VertexStyle.RADIAL_GRADIENT
})
