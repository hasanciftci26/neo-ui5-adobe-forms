/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"ndbs/training/forms_service_consume/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});