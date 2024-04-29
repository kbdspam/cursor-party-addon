Game.registerMod("multiplayerCursors", {
	init: function() {
		// If we don't have mod data yet (first run) then the load() function won't run.
		// Hook the load function to simplify ourself.
		Game.original_loadModData2 = Game.loadModData;
		Game.loadModData = () => {
			Game.loadModData = Game.original_loadModData2;
			Game.original_loadModData2();
			if (this && !this.active) this.load("");
		};

		l('versionNumber').insertAdjacentHTML('beforeend','<a style="font-size:10px;margin-left:10px;" class="smallFancyButton" id="multiplayerCursorsButton">Multiplayer Cursors<br>OFF</a>');
		AddEvent(l('multiplayerCursorsButton'),'click',()=>{
			if (this.blockToggle) {
				PlaySound('snd/clickOff2.mp3');
				return;
			}
			if (this.active) {
				this.stopTheCursors();
				PlaySound('snd/clickOff2.mp3');
			} else {
				this.startTheCursors();
				PlaySound('snd/clickOn2.mp3');
			}
			setInterval(()=>{this.blockToggle = false;}, 1*1000);
		});
	},
	injectScript: function(subdomain) {
		document.multiplayerCursorsCC = "cc";
		let script = document.createElement("script");
		script.src = "http://localhost:1999/cursors.js";
		//script.src = "https://cursor-party.xxxxxxxx.partykit.dev/cursors.js";
		//script.src = `https://cursor-party-${subdomain}.c.ookie.click/cursors.js`;
		// http://localhost:1999/Untitled-1.html
		// http://localhost:1999/
		document.body.appendChild(script);

		script.onload = () => {
			this.blockToggle = false;
			l("multiplayerCursorsButton").innerHTML = "Multiplayer Cursors<br>ON";
		};
		script.onerror = () => {
			console.log(`failed to load cursors.js from ${subdomain}...`);
			if (subdomain < 5) {
				this.injectScript(subdomain + 1);
			}
		};
	},
	startTheCursors: function() {
		if ("multiplayerCursorsWs" in document) {
			// The cursors.js script sets `document.multiplayerCursorsWs` to the socket...
			document.multiplayerCursorsWs.reconnect();
			l("multiplayerCursorsButton").innerHTML = "Multiplayer Cursors<br>ON";
		} else {
			this.blockToggle = true;
			l("multiplayerCursorsButton").innerHTML = "Multiplayer Cursors<br>loading...";
			this.injectScript(0);
		}
		this.active = true;
	},
	stopTheCursors: function() {
		if ("multiplayerCursorsWs" in document) {
			document.multiplayerCursorsWs.close();
		}
		l("multiplayerCursorsButton").innerHTML = "Multiplayer Cursors<br>OFF";
		this.active = false;
	},
	save:function() {
		return this.active ? "1" : "0";
	},
	load:function(str) {
		if (this.active) return;
		if (+str) this.startTheCursors();
	},
});
