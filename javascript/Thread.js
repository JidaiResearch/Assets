//function ThreadState()
function handleYield(runframeData) {
	var ret = eval(runframeData);
	Duktape.Thread.yield( ret ); // put thread back to sleep, we just wanted to eval something in its context
}
function wait(time)         { var resumeArg = Duktape.Thread.yield( ["wait",            time * 1000] ); if (resumeArg) handleYield(resumeArg); }
function waittillframeend() { var resumeArg = Duktape.Thread.yield( ["waittillframeend"            ] ); if (resumeArg) handleYield(resumeArg); }
function waittill(what)     { var resumeArg = Duktape.Thread.yield( ["waittill",        what       ] ); if (resumeArg) handleYield(resumeArg); }
function killthread()       { level.currentthread.userkill = true;                   }

function runframe() {
	for (var i=0; i</*entities.length*/1024; i++) {
		if (entities[i] != undefined)
			entities[i].runframe()
	}
	level.time += 50;
}

killthreads = function() {
	for (var i=0; i<1024; i++) {
		var ent = entities[i];
		ent.threads = []
	}
}

Entity.prototype.thread = function(func) {
	var self = this;
	return function() {
		var t = new Duktape.Thread(function(args) {
			func.bind(self)(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9]);
			//func.apply(self, arguments) // waiting for: https://github.com/svaarala/duktape/issues/1420
		});
		t.nextrun = level.time;
		t.parameters = arguments;
		t.events = [];
		t.entity = self;
		t.userkill = false;
		t.eval = function(code) { return Duktape.Thread.resume(t, code); }
		t.doFirstCall = true;
		self.threads.push(t)
		//level.currentthread = t;
		//Duktape.Thread.resume(t, arguments);
		
	}
}


Entity.prototype.runframe = function() {
	// iterate backwards over it, so we can delete finished threads instantly via ID
	for (var i=this.threads.length-1; i>=0; i--) {
		var thread = this.threads[i];

		var state = Duktape.info(thread);
		//printf("entid=% threadid=% state=%,%\n", this.id, i, state[0], state[1]);

		if (thread.nextrun > level.time) {
			//printf("entid=% threadid=%> No run yet: nextrun in %\n", this.id, i, thread.nextrun - level.time)
			continue;
		}

		// user called killthread()
		if (thread.userkill) {
			//printf("DELETE THREAD %d\n", this.id);
			this.threads.splice(i, 1); // delete thread from array
			continue;
		}		
		
		try {
			level.currentthread = thread;
			var arg = undefined;
			if (thread.doFirstCall) {
				arg = thread.parameters;
				thread.doFirstCall = false;
			}
			var whatnow = undefined;
			try {
				whatnow = Duktape.Thread.resume(thread, arg);
			} catch (e) {
				printf("error runframe: %\n", e);
				
			}

			var state = Duktape.info(thread);
			//printf("AFTER RESUME: entid=% threadid=% state=%,%\n", this.id, i, state[0], state[1]);

			switch (whatnow[0]) {
				case "wait": thread.nextrun += whatnow[1];	break;
			}
			//printf("whatnow: %\n", whatnow);
		} catch (e) {
			this.threads.splice(i, 1); // delete thread from array
			//printf("Entity::runframe> Finished Thread id=% entityid=% level.time=%\n", i, this.id, level.time);

		}
	}
}