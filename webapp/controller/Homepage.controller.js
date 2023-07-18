sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("ndbs.training.forms_service_consume.controller.Homepage", {
		onInit: function () {

		},
		onGetPDF: async function () {
			let sFormName = "PURCHASE_ORDER",
				oPDFForm,
				oPayload,
				sXMLData;

			try {
				sXMLData = await this._getXMLFile();
				oPDFForm = await this._getFormandToken(sFormName);

				oPayload = {
					"xdpTemplate": oPDFForm.data.templates[0].xdpTemplate,
					"xmlData": btoa(sXMLData),
					"formType": "Print",
					"formLocale": "de_DE",
					"taggedPdf": 1,
					"embedFont": 0
				};

				$.ajax({
					url: "/ads.restapi/v1/adsRender/pdf",
					method: "POST",
					type: "POST",
					contentType: "application/json",
					data: JSON.stringify(oPayload),
					success: function (data, textStatus, jqXHR) {
						let oFormData = data;
						var sBase64EncodedPDF = oFormData.fileContent;
						if (sBase64EncodedPDF === undefined) {
							return;
						}
						var sDecodedPdfContent = atob(sBase64EncodedPDF);
						var aByteArray = new Uint8Array(sDecodedPdfContent.length)
						for (var i = 0; i < sDecodedPdfContent.length; i++) {
							aByteArray[i] = sDecodedPdfContent.charCodeAt(i);
						}
						var oBlob = new Blob([aByteArray.buffer], {
							type: 'application/pdf'
						});
						let sPDFUrl = URL.createObjectURL(oBlob);
						window.open(sPDFUrl, '_blank');
					},
					error: function (data, textStatus, jqXHR) {
						sap.m.MessageBox.show("No data posted");
					}
				});
			} catch (error) {
				sap.m.MessageBox.error(error);
			}
		},
		_getFormandToken: function (sFormName) {
			return new Promise((resolve, reject) => {
				$.ajax({
					url: `/ads.restapi/v1/forms/${sFormName}`,
					method: "GET",
					type: "GET",
					dataType: "json",
					beforeSend: function (xhr) {
						xhr.setRequestHeader("X-CSRF-Token", "Fetch")
					},
					async: false,
					success: function (data, textStatus, jqXHR) {
						resolve({
							token: jqXHR.getResponseHeader("X-CSRF-Token"),
							data: data
						});
					},
					error: function (data, textStatus, jqXHR) {
						reject("Error while fetching form data.");
					}
				});
			});
		},
		_getXMLFile: function () {
			return new Promise((resolve, reject) => {
				$.ajax({
					type: "GET",
					url: "./model/PurchaseOrder.xml",
					dataType: "xml",
					success: function (response) {
						let sXMLDocument = new XMLSerializer().serializeToString(response);
						resolve(sXMLDocument);
					},
					error: function (error) {
						reject("Error while fetching form data.");
					},
				});
			});
		}
	});
});