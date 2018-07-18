Waypoint = function(origin) {
	this.origin = origin	
	this.neighbors = {};
	this.id = -1;
	
}

Waypoint.prototype.distance = function(to) {
	var dx = to.origin.x - this.origin.x
	var dy = to.origin.y - this.origin.y
	var dz = to.origin.z - this.origin.z
	var dist =  Math.sqrt(dx*dx + dy*dy + dz*dz)
	//console.log(this.neighbors[to])
	//console.log("distance from '" + this.name + "' to '" + to.name + "' is: " + dist);
	return dist
}

Waypoint.prototype.connectTo = function(other) {
	//this.neighbors.push( other )
	this.neighbors[other.name] = other
}


Pathfinder = function() {
	this.waypoints = []
	this.edges = []
	this.entities = []
	this.edgeents = []
}

Pathfinder.prototype.add = function(origin) {
	var wp = new Waypoint(origin);
	this.waypoints.push( wp );
	wp.id = this.waypoints.length - 1;
	wp.name = "wp_" + wp.id
	
	var model = spawnentity()
	model.origin = origin.sub( Vec3(0,0,25) )
	model.model = "models/items/forcegem.md3"
	this.entities.push( model )

	return wp.id
}

Pathfinder.prototype.saveToFile = function(filename) {
	var content = "var pathfinder = new Pathfinder();\n";
	for (var i=0; i<this.waypoints.length; i++) {
		var origin = this.waypoints[i].origin
		content += "pathfinder.add( " + origin.toString() + " );\n"
	}
	for (var i=0; i<this.edges.length; i++) {
		var id_0 = this.edges[i][0]
		var id_1 = this.edges[i][1]
		content += "pathfinder.connectSingle( " + id_0 + ", " + id_1 + " );\n"
	}	
	content += "pathfinder;" // last statement of eval(...) is returned
	file_put_contents(filename, content)
}


Pathfinder.prototype.reset = function() {
	for (var i in this.entities) {
		this.entities[i].free()
	}
	for (var i=0; i<this.edgeents.length; i++)
		this.edgeents[i].free()
	this.waypoints = []
	this.edges = []
	this.entities = []
	this.edgeents = []
	//for (var i=0; i<this.waypoints.length; i++) {
	//	var wp = this.waypoints[i]
	//}
}

Pathfinder.prototype.spawnEdgeEnts = function() {
	for (var i=0; i<this.edgeents.length; i++)
		this.edgeents[i].free()
	this.edgeents = []

	for (var i=0; i<this.edges.length; i++) {
		var edge_from = this.edges[i][0]
		var edge_to   = this.edges[i][1]

		var wp_from = this.waypoints[edge_from].origin
		var wp_to   = this.waypoints[edge_to  ].origin

		var delta = wp_to.sub(wp_from);
		var angles = vecToAngles(delta)

		var edgeent = spawnentity()
		edgeent.origin = wp_from.sub( Vec3(0,0,25) )
		edgeent.angles = angles.add( Vec3(0,90,90) )
		edgeent.model = "models/items/battery.md3"
		this.edgeents[i] = edgeent

		//console.log(edge_from, edge_to, angles)
	}
}

Pathfinder.prototype.connectBoth = function(id_from, id_to) {
	this.edges.push( [id_from, id_to   ] )
	this.edges.push( [id_to  , id_from ] )
	
	this.waypoints[id_from].connectTo( this.waypoints[id_to  ] )
	this.waypoints[id_to  ].connectTo( this.waypoints[id_from] )
}

Pathfinder.prototype.connectSingle = function(id_from, id_to) {
	this.edges.push( [id_from, id_to] )
	this.waypoints[id_from].connectTo( this.waypoints[id_to] )
}

Pathfinder.prototype.setupAstar = function(id_from, id_to) {
	this.astar = new Astar()
}

// retarded "multiple dispatch" here...
Pathfinder.prototype.findPath_id_id = function(id_from, id_to) {
	var a = this.waypoints[id_from];
	var b = this.waypoints[id_to  ];
	return this.astar.findPath(a, b)
}

Pathfinder.prototype.findPath_ent_ent = function(entity_a, entity_b) {
	var wp_from_id = this.getClosestWaypoint(entity_a.origin).id
	var wp_to_id   = this.getClosestWaypoint(entity_b.origin).id
	return this.findPath_id_id(wp_from_id, wp_to_id)
}

Pathfinder.prototype.getClosestWaypoint = function(origin) {
	var closestWaypoint = this.waypoints[0];
	var dist = distance( origin, closestWaypoint.origin );
	var closestDistance = dist;
	for (var i=1; i<this.waypoints.length; i++) {
		dist = distance( origin, this.waypoints[i].origin );
		if (dist < closestDistance) {
			closestWaypoint = this.waypoints[i];
			closestDistance = dist;
		}
	}
	return closestWaypoint;
}
	
Pathfinder.LoadFromFile = function(filename) {
	var content = file_get_contents(filename)
	return eval(content);
}

load_pathfinder = function() {
	if (typeof pf != "undefined") {
		pf.__proto__ = Pathfinder.prototype
		pf.reset()
		
	}
	pf = waypoints_load();
	pf.spawnEdgeEnts()
	pf.setupAstar()
}

waypoints_load = function() {
	var mapname = "stripclub"; // todo
	return Pathfinder.LoadFromFile("waypoints_" + mapname + ".js")
}

waypoints_save = function() {
	var mapname = "stripclub"; // todo
	pf.saveToFile("waypoints_" + mapname + ".js")
}

// killthreads()
waypoints_test = function() {
	if (typeof pf != "undefined") {
		console.log("please call load_pathfinder() first")
		return;
	}
	var hf = spawnNPC("jedi_hf")
	hf.thread( function() {
		while (1) {
			var path = pf.findPath_ent_ent(this, player)
			for (var i=0; i<path.length; i++) {
				var pos = path[i].origin
				this.walkTo(pos)
				do {
					var dist = distance(this.origin, pos)
					if (dist < 10)
						break;
					wait(0.05)
				} while (1);
			}
			wait(0.05)
		}
	} )()
}

/*
	path = new Astar().findPath(a, d)
	var tmp = []
	for (i=0; i<path.length; i++) {
		console.log(path[i].name)
	}
*/