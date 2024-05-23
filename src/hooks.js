// hooks.js for "Fate's Descent"

import { FatesDescentRoll } from "./FatesDescentRoll.js";
import { MODULE_ID } from "./settings.js";
import { SanityMadnessHandler } from "./SanityMadnessHandler.js";
import { FDregisterSettings } from "./settings.js";
import { debugLog } from "./utils.js";

const styling = `
    color:#D01B00;
    background-color:#A3A6B4;
    font-size:9pt;
    font-weight:bold;
    padding:1pt;
`;

/**
 * Registers the hooks for the Fate's Descent module.
 */
export function FDregisterHooks() {
    const sanityMadnessHandler = new SanityMadnessHandler(MODULE_ID);
    let socket;

    Hooks.once("socketlib.ready", () => {
        try {
            socket = socketlib.registerModule(MODULE_ID);
            socket.register("updateSanityMadness", sanityMadnessHandler.updateSanityAndMadness.bind(sanityMadnessHandler));
            debugLog("Socketlib registered successfully.", styling);
        } catch (error) {
            console.error("%cFailed to register socketlib:", styling, error);
        }
    });

    Hooks.once("init", () => {
        try {
            debugLog("Fate's Descent | Registering module settings.", styling);
            FDregisterSettings();
            debugLog("Settings registered successfully.", styling);
        } catch (error) {
            console.error("%cFailed to register settings:", styling, error);
        }
    });

    Hooks.once('ready', () => {
        try {
            debugLog("Fate's Descent | Module is ready and initialized!", styling);
            if (game.settings.get(MODULE_ID, 'enableModule')) {
                new FatesDescentRoll(); 
                debugLog("FatesDescentRoll instance created successfully.", styling);
            } else {
                debugLog("Fate's Descent module is disabled in settings.", styling);
            }

            game.actors.contents.forEach(actor => {
                if (actor.type === "character" && actor.prototypeToken.actorLink) {
                    debugLog(`Initializing sanity and madness values for linked character ${actor.name}.`, styling);
                    sanityMadnessHandler.updateSanityAndMadness(actor);
                }
            });
        } catch (error) {
            console.error("%cFailed during ready hook:", styling, error);
        }
    });

    /**
     * Hook to handle pre-update logic for actors.
     *
     * @param {Actor} actor - The actor being updated.
     * @param {Object} changes - The changes being applied to the actor.
     * @param {Object} options - Additional options for the update.
     * @param {string} userId - The ID of the user making the update.
     */
    Hooks.on("preUpdateActor", async (actor, changes, options, userId) => {
        if (actor.type !== "character" || !actor.prototypeToken.actorLink) return;
        try {
            debugLog("Pre-update detected for linked actor.", styling);

            if (changes.system?.abilities?.san?.mod !== undefined) {
                debugLog("San mod is about to change, calculating new values.", styling);
                const newSanMod = changes.system.abilities.san.mod;
                const startingSanityPoints = game.settings.get(MODULE_ID, 'startingSanityPoints');
                const startingMadnessPoints = game.settings.get(MODULE_ID, 'startingMadnessPoints');
                const newSanityPointsMax = startingSanityPoints + newSanMod;
                const newMadnessMax = startingMadnessPoints + newSanMod;
                const existingSanity = actor.getFlag(MODULE_ID, "sanityPoints.current") || newSanityPointsMax;
                const existingMadness = actor.getFlag(MODULE_ID, "madness.current") || 0;

                const updates = {
                    [`flags.${MODULE_ID}.sanityPoints`]: { current: Math.max(existingSanity, 0), max: newSanityPointsMax },
                    [`flags.${MODULE_ID}.madness`]: { current: Math.max(existingMadness, 0), max: newMadnessMax }
                };
                await actor.update(updates);
                debugLog("Sanity and madness updated successfully for linked actor.", styling);
            }
        } catch (error) {
            console.error("%cFailed during preUpdateActor hook:", styling, error);
        }
    });

    /**
     * Hook to handle the rendering of actor sheets.
     *
     * @param {Object} app - The application object.
     * @param {jQuery} html - The jQuery HTML object of the sheet.
     * @param {Object} data - The data being rendered in the sheet.
     */
    Hooks.on("renderActorSheet", (app, html, data) => {
        if (app.actor.type !== "character" || !app.actor.prototypeToken.actorLink) return;
        try {
            debugLog("Actor sheet rendered for linked actor, adding sanity and madness bars.", styling, app, html);

            const sheetType = app._element[0].id;

            if (sheetType.includes('ActorSheet5eCharacter2-Actor')) {
                debugLog("Rendering for dnd5e2 character sheet.", styling);
                sanityMadnessHandler.addSanityAndMadnessBarsDnd5e2(app.actor, html);
            } else if (sheetType.includes('ActorSheet5eCharacter-Actor')) {
                debugLog("Rendering for dnd5e character sheet.", styling);
                sanityMadnessHandler.addSanityAndMadnessBarsDnd5e(app.actor, html);
            } else if (sheetType.includes('Tidy5eCharacterSheet-Actor')) {
                debugLog("Rendering for tidy5e character sheet.", styling);
                sanityMadnessHandler.addSanityAndMadnessBarsTidy5e(app.actor, html);
            } else {
                debugLog("Unknown character sheet type.", styling);
            }
        } catch (error) {
            console.error("%cFailed during renderActorSheet hook:", styling, error);
        }
    });
}
