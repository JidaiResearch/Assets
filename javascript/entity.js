/*
pos = entities[0].traceEyeEntity(1024).position
ent = spawnentity()
ent.setOrigin(pos)
ent.setModel("kungmodels/heart.kung1")
*/
function spawnentity() {
	return entities[g_spawn()];
}

function Entity(id) {
	this.id = id;
	this.threads = [];
		
	this.disconnect = function() {
		printf("js> entityid=%d disconnected\n", this.id);

		for (var i=0; i<this.threads.length; i++) {
			var thread = this.threads[i];
			var callbacks = thread.events["disconnect"];
			
			// yea honestly, some threads do not define a disconnect event :^)
			if (typeof callbacks == "undefined") {
				continue;
			}
			
			// iterate over all callbacks and call them bounded to this entity
			for (var j=0; j<callbacks.length; j++)
			{
				callbacks[j].bind(this)();
			}
			
			// when we have called all callbacks, remove them
			thread.events["disconnect"] = [];
			
		}
	}
	
	this.useButtonPressed    = function()                      { return entity_usebuttonpressed   (this.id);                                           }
	this.sprintButtonPressed = function()                      { return entity_sprintbuttonpressed(this.id);                                           }
	this.attackButtonPressed = function()                      { return entity_attackbuttonpressed(this.id);                                           }
	this.getEye              = function()                      { return entity_get_eye            (this.id);                                           }
	this.getOrigin           = function()                      { return entity_get_origin         (this.id);                                           }
	this.setOrigin           = function(origin)                { return entity_set_origin         (this.id, origin[0], origin[1], origin[2]);          }
	this.addEvent            = function(normal)                { return entity_add_event          (this.id, normal[0], normal[1], normal[2]);          }
	this.animate             = function(start, num)            { return entity_animate            (this.id, start, start+num               );          }
	this.getAngles           = function()                      { return entity_get_angles         (this.id);                                           }
	this.getWeapon           = function()                      { return entity_get_weapon         (this.id);                                           }
	this.getWeaponState      = function()                      { return entity_get_weaponstate    (this.id);                                           }
	this.getWeaponTime       = function()                      { return entity_get_weapontime     (this.id);                                           }
	this.setAngles           = function(angles)                { return entity_set_angles         (this.id, angles[0], angles[1], angles[2]);          }	
	this.getForward          = function()                      { return entity_get_forward        (this.id);                                           }
	this.getClassname        = function()                      { return entity_get_classname      (this.id);                                           }
	this.moveTo              = function(pos, durationSeconds)  { return entity_moveto             (this.id, pos[0], pos[1], pos[2], durationSeconds);  }
	this.solid               = function()                      { return entity_solid              (this.id);                                           }
	this.suicide             = function()                      { return entity_suicide            (this.id);                                           }
	this.die                 = function(self, inflictor, attacker, damage, mod)                   { return entity_die                (self.id, inflictor.id, attacker.id, damage, mod);                                           }
	this.free                = function()                      { return entity_delete             (this.id);                                           } // same, whatever u prefer
	this.unlink              = function()                      { return entity_delete             (this.id);                                           } // same, whatever u prefer
	this.notSolid            = function()                      { return entity_notsolid           (this.id);                                           }
	this.setModel            = function(modelname)             { return entity_set_model          (this.id, modelname);                                }
	
	this.printf = function() {
		var msg = sprintf.apply(undefined, arguments);
		sendservercommand(this.id, "print \"" + msg + "\"");
	}
}

Entity.prototype.traceEyeEntity = function(distance, ignoredEntity) {
	var eye = this.getEye();
	var forward = this.getForward();
	var endpos = vec3_new();
	vec3_a_is_b_plus_c_times_d(endpos, eye, forward, distance)
	//printf("endpos=%, eye=%, forward=%, distance=%\n", endpos, eye, forward, distance);
	var tmp = bullettrace(eye, endpos, "useless", ignoredEntity);
	return tmp;
}

Entity.prototype.setMoney = function(money) {
	this.money = money;	
	this.hudMoney.setText("Money: " + this.money);
}

function vec4(a,b,c,d) {
	var ret = new Float32Array(4);
	ret[0] = a;
	ret[1] = b;
	ret[2] = c;
	ret[3] = d;
	return ret;
}

function JS_getPlayersInRange(position, maxDistance) {
	var ret = getPlayersInRange(position[0], position[1], position[2], maxDistance);
	ents = [];
	for (var i=0; i<ret.length; i++) {
		ents.push( entities[ret[i]] );
	}
	return ents;
}

Entity.prototype.getPlayersInRange = function(maxDistance) {
	return JS_getPlayersInRange(this.getOrigin(), maxDistance);
}

Entity.prototype.walkTo = function(to) {
	var unitsPerSecond = 100;
	var dist = distance( this.origin, to )
	var timeNeeded = dist / unitsPerSecond;
	this.angles = vecToAngles(to.sub(this.origin))
	this.moveTo(to, timeNeeded)
	this.walk()
}

Entity.prototype.walkToSlow = function(to) {
	var unitsPerSecond = 20;
	var dist = distance( this.origin, to )
	var timeNeeded = dist / unitsPerSecond;
	this.angles = vecToAngles(to.sub(this.origin))
	this.moveTo(to, timeNeeded)
	this.walk()
}

Entity.prototype.sit    = function(to) { this.animate(13547,  2) }
Entity.prototype.crouch = function(to) { this.animate( 2949, 25) }
Entity.prototype.walk   = function(to) { this.animate(20438, 26) }


spawnNPC = function(name) {
	var npc = spawnentity()
	npc.model = "models/players/" + name + "/model.glm"
	npc.origin = player.origin
	return npc
}

//zf.__proto__ = Entity.prototype

Object.defineProperty(Entity.prototype, "origin", {
	get: function (   ) { return entity_get_origin(this.id                         ); },
	set: function (tmp) { return entity_set_origin(this.id, tmp[0], tmp[1], tmp[2] ); }
});

Object.defineProperty(Entity.prototype, "velocity", {
	get: function (   ) { return entity_get_velocity(this.id                        ); },
	set: function (tmp) { return entity_set_velocity(this.id, tmp[0], tmp[1], tmp[2]); }
});

Object.defineProperty(Entity.prototype, "forward", {
	get:   function (   ) { return entity_get_forward(this.id                        ); },
	//set: function (tmp) { return entity_set_forward(this.id, tmp[0], tmp[1], tmp[2]); }
});

Object.defineProperty(Entity.prototype, "right", {
	get:   function (   ) { return entity_get_right(this.id                        ); },
	//set: function (tmp) { return entity_set_right(this.id, tmp[0], tmp[1], tmp[2]); }
});

Object.defineProperty(Entity.prototype, "up", {
	get:   function (   ) { return entity_get_up(this.id                        ); },
	//set: function (tmp) { return entity_set_up(this.id, tmp[0], tmp[1], tmp[2]); }
});

Object.defineProperty(Entity.prototype, "eye", {
	get:   function (   ) { return entity_get_eye(this.id                        ); },
	//set: function (tmp) { return entity_set_eye(this.id, tmp[0], tmp[1], tmp[2]); }
});

Object.defineProperty(Entity.prototype, "angles", {
	get: function (   ) { return entity_get_angles(this.id                        ); },
	set: function (tmp) { return entity_set_angles(this.id, tmp[0], tmp[1], tmp[2]); }
});

Object.defineProperty(Entity.prototype, "model", {
	get: function (   ) { return entity_get_model(this.id     ); },
	set: function (tmp) { return entity_set_model(this.id, tmp); }
});

// entities[0].origin *= 2
// o = entities[0].origin
// o[2] += 300
// entities[0].pos1 = o
// entities[0].setOrigin(o)


if (typeof entities == "undefined") {
	entities = Array(1024);
	for (var i=0; i<1024; i++)
		entities[i] = new Entity(i);
	player  = entities[0]
	player0 = entities[0]
	player1 = entities[1]
	player2 = entities[2]
	player3 = entities[3]
	player4 = entities[4]
	player5 = entities[5]
	player6 = entities[6]
	player7 = entities[7]
	player8 = entities[8]
}
