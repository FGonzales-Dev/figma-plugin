"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// This shows the HTML page in "ui.html".
figma.showUI("<b>Hello from Figma</b>", {
    width: 1000,
    height: 1000,
    title: "Figmafolio",
});
figma.showUI(__html__, { width: 350, height: 700 });
// parent.postMessage({ pluginMessage: { type: 'create-rectangles', mobileUrlTextbox, desktopUrlTextbox } }, '*')
figma.ui.onmessage = (msg) => __awaiter(void 0, void 0, void 0, function* () {
    function generateRandomId(length = 10) {
        const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
    if (msg.type === "create-rectangles") {
        if (!msg.desktopUrlTextbox.includes("figma.com/file") &&
            !msg.mobileUrlTextbox.includes("figma.com/file") &&
            (msg.mobileUrlTextbox.includes("figma.com/proto") ||
                msg.mobileUrlTextbox.includes("figma.com/embed") ||
                msg.desktopUrlTextbox.includes("figma.com/proto") ||
                msg.desktopUrlTextbox.includes("figma.com/embed"))) {
            const payload = {
                fields: {
                    mobileUrl: { stringValue: editUrl(msg.mobileUrlTextbox) },
                    desktopUrl: { stringValue: editUrl(msg.desktopUrlTextbox) },
                },
            };
            let saved = false;
            while (!saved) {
                const randomId = generateRandomId(); // Generate a random 10-character ID
                try {
                    const response = yield fetch(`https://firestore.googleapis.com/v1/projects/figmawebapp/databases/(default)/documents/pluginFolio/${randomId}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    });
                    if (response.ok) {
                        figma.notify(`Data successfullyxxxxssss sent to Firestore with ID: ${randomId}`);
                        // figma.ui.postMessage({
                        //   pluginMessage: {
                        //     type: "display-message",
                        //     message: `https://figmafolio.com/folio-preview/${randomId}`,
                        //   },
                        // });
                        figma.ui.postMessage({
                            type: "display-message",
                            message: `https://figmafolio.com/folio-preview/${randomId}`,
                        });
                        // message: `Data saved! Click <a href=https://figmafolio.com/folio-preview/${randomId} target="_blank">here</a> to open Figmafolio.`,
                        // const url = "http://figmafolio.com/folio-preview/" + randomId;
                        // const openLinkUIString = `<script>window.open('${url}','_blank');</script>`;
                        // figma.showUI(openLinkUIString, { visible: true });
                        // figma.showUI(openLinkUIString, {
                        //   width: 1000,
                        //   height: 1000,
                        //   title: "My title",
                        // });
                        saved = true;
                    }
                    else {
                        const responseData = yield response.json();
                        if (responseData.error &&
                            responseData.error.status === "ALREADY_EXISTS") {
                            figma.notify(`Document ID ${randomId} already exists. Generating a new ID...`);
                            // Continue the loop to try with a new ID
                        }
                        else {
                            figma.notify(`Failed to send data to Firestore: ${responseData.error.message || "Unknown error"}`);
                            break; // Exit the loop if there's a different error
                        }
                    }
                }
                catch (error) {
                    figma.notify(`Error sending data to Firestore:`);
                    break; // Exit the loop on unexpected errors
                }
            }
        }
        else {
            figma.ui.postMessage({
                type: "error-message",
                message: "invalid prototype url",
            });
        }
    }
    function removeWordFromString(inputString, wordToRemove) {
        const regex = new RegExp(`\\b${wordToRemove}\\b`, "gi");
        const resultString = inputString.replace(regex, "");
        return resultString;
    }
    function editUrl(url) {
        const originalString = url;
        const wordToRemove = "https://";
        const hideUi = "&hide-ui=1";
        const hotspot = "&hotspot-hints=0";
        const embedHost = "www.figma.com/embed?embed_host=share&url=https%3A%2F%2F";
        let newUrl = "";
        let modifiedUrl = "";
        let modifiedString = removeWordFromString(originalString, wordToRemove);
        if (url.includes("content-scaling=responsive")) {
            modifiedString = encodeURIComponent(modifiedString);
        }
        if (url !== "") {
            if (!modifiedString.includes(embedHost)) {
                newUrl = "https://" + embedHost + modifiedString;
            }
            else {
                newUrl = url;
            }
            if (!newUrl.includes(hideUi)) {
                newUrl += hideUi;
            }
            if (!newUrl.includes(hotspot)) {
                newUrl += hotspot;
            }
            if (newUrl.includes("scaling=contain")) {
                if (!newUrl.includes("content-scaling=responsive")) {
                    modifiedUrl = newUrl.replace(new RegExp("scaling=contain", "g"), "scaling=scale-down-width");
                    newUrl = modifiedUrl;
                }
                else {
                    newUrl = modifiedUrl;
                }
            }
            else if (newUrl.includes("scaling=min-zoom")) {
                modifiedUrl = newUrl.replace(new RegExp("scaling=min-zoom", "g"), "scaling=scale-down-width");
                newUrl = modifiedUrl;
            }
            else if (newUrl.includes("scaling=scale-down")) {
                if (!newUrl.includes("scaling=scale-down-width")) {
                    modifiedUrl = newUrl.replace(new RegExp("scaling=scale-down", "g"), "scaling=scale-down-width");
                    newUrl = modifiedUrl;
                }
            }
        }
        else {
            newUrl = "";
        }
        return newUrl;
    }
});
