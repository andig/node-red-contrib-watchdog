module.exports = function (RED) {
	"use strict";

	function WatchdogNode(config) {
		const STATE_OK = 0;
		const STATE_WARNING = 1;
		const STATE_ERROR = 2;
		const STATE_RESTART = 3;
		var status = STATE_OK;

		RED.nodes.createNode(this, config);
		var node = this;

		var tick, timeout, warning, countdown;
		warning = parseInt(config.warning);

		function startTimer() {
			timeout = countdown = parseInt(config.timer);
			tick = setInterval(function () {
				node.emit("input", {
					payload: '_watchdogHeartBeat',
					topic: ""
				});
			}, 1000); // trigger every 1 sec
		}

		function restartTimer() {
			if (tick) {
				clearInterval(tick);
			}
			startTimer();
		}

		startTimer();

		node.on("input", function (msg) {
			// every message resets the timeout
			if (msg.payload != "_watchdogHeartBeat") {
				countdown = timeout;
			}

			// error state always set independent of message defined
			if (countdown === 0) {
				node.status({
					fill: "red",
					shape: "dot",
					text: "Error",
				});

				if ((status != STATE_ERROR) || config.repeat) {
					status = STATE_ERROR;

					if (config.outerror !== "") {
						// outputs = [ok, error, warning]
						node.send({
							payload: config.outerror,
							topic: config.topic,
						});
					}
				}

				// restart watchdog
				if (config.restart) {
					restartTimer();
					status = STATE_RESTART; // will send healthy message if defined
				}
			}
			// warning state only set if message defined
			else if ((countdown <= warning) && (config.outwarning !== "")) {
				node.status({
					fill: "yellow",
					shape: "dot",
					text: "Warning: " + countdown,
				});
				
				countdown--;

				if ((status != STATE_WARNING) || config.repeat) {
					status = STATE_WARNING;
					// outputs = [ok, error, warning]
					node.send({
						payload: config.outwarning,
						topic: config.topic,
					});
				}
			}
			else {
				node.status({
					fill: "green",
					shape: "dot",
					text: "Countdown: " + countdown,
				});

				countdown--;

				if ((status !== STATE_OK) || config.repeat) {
					status = STATE_OK;

					if (config.outhealthy !== "") {
						node.send({
							payload: config.outhealthy,
							topic: config.topic,
						});
					}
				}
			}
		});

		node.on("close", function () {
			if (tick) {
				clearInterval(tick);
			}
		});
	}

	RED.nodes.registerType("watchdog", WatchdogNode);
};
