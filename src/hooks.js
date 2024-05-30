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
export function FDregisterHooks() 
{
    const sanityMadnessHandler = new SanityMadnessHandler(MODULE_ID);
   
    // eslint-disable-next-line no-shadow
    let socket;

    Hooks.once("socketlib.ready", () => 
    {
        try 
        {
            // eslint-disable-next-line no-undef
            socket = socketlib.registerModule(MODULE_ID);
            socket.register("updateSanityMadness", sanityMadnessHandler.updateSanityAndMadness.bind(sanityMadnessHandler));
            debugLog("Socketlib registered successfully.", styling);
        }
        catch (error) 
        {
            console.error("%cFailed to register socketlib:", styling, error);
        }
    });

    Hooks.once("init", () => 
    {
        try 
        {
            debugLog("Fate's Descent | Registering module settings.", styling);
            FDregisterSettings();
            debugLog("Settings registered successfully.", styling);
        }
        catch (error) 
        {
            console.error("%cFailed to register settings:", styling, error);
        }
    });

    Hooks.once('ready', () => 
    {
        try 
        {
            debugLog("Fate's Descent | Module is ready and initialized!", styling);
            if (game.settings.get(MODULE_ID, 'enableModule')) 
            {
                new FatesDescentRoll(); 
                debugLog("FatesDescentRoll instance created successfully.", styling);
            }
            else 
            {
                debugLog("Fate's Descent module is disabled in settings.", styling);
            }            
            game.actors.contents.forEach((actor) => 
            {
                if (actor.type === "character" && actor.prototypeToken.actorLink) 
                {
                    debugLog(`Initializing sanity and madness values for linked character ${actor.name}.`, styling);
                    sanityMadnessHandler.updateSanityAndMadness(actor);
                }
            });
        }
        catch (error) 
        {
            console.error("%cFailed during ready hook:", styling, error);
        }
        game.settings.set("fates-descent", "globalSaveRequests", []);
        game.settings.set("fates-descent", "globalTestRequests", []);
    });

    Hooks.on("preUpdateActor", async (actor, changes) => 
    {
        if (actor.type !== "character" || !actor.prototypeToken.actorLink) { return; }
        
        try 
        {
            debugLog("Pre-update detected for linked actor.", styling);
            const sanityPointsMax = actor.getFlag("fates-descent", "sanityPoints.max");
            const madnessMax = actor.getFlag("fates-descent", "madness.max");
            if (changes.flags?.["fates-descent"]?.sanityPoints?.current !== undefined) 
            {
                const newSanityCurrent = changes.flags["fates-descent"].sanityPoints.current;
                const clampedSanity = Math.min(Math.max(newSanityCurrent, 0), sanityPointsMax);
                changes = foundry.utils.mergeObject(changes, { ["flags.fates-descent.sanityPoints.current"]: clampedSanity });
                debugLog(`Sanity points updated: ${newSanityCurrent} -> ${clampedSanity}`, styling);
            }
            if (changes.flags?.["fates-descent"]?.madness?.current !== undefined) 
            {
                const newMadnessCurrent = changes.flags["fates-descent"].madness.current;
                const clampedMadness = Math.min(Math.max(newMadnessCurrent, 0), madnessMax);
                changes = foundry.utils.mergeObject(changes, { ["flags.fates-descent.madness.current"]: clampedMadness });
                debugLog(`Madness points updated: ${newMadnessCurrent} -> ${clampedMadness}`, styling);
            }

        }
        catch (error) 
        {
            console.error("%cFailed during preUpdateActor hook:", styling, error);
        }
    });

    Hooks.on("renderActorSheet", (app, html) => 
    {
        if (app.actor.type !== "character" || !app.actor.prototypeToken.actorLink) { return; }
        try 
        {
            debugLog("Actor sheet rendered for linked actor, adding sanity and madness bars.", styling, app, html);
            const sheetType = app._element[0].id;
            if (sheetType.includes('ActorSheet5eCharacter2-Actor')) 
            {
                debugLog("Rendering for dnd5e2 character sheet.", styling);
                sanityMadnessHandler.addSanityAndMadnessBarsDnd5e2(app.actor, html);
            }
            else if (sheetType.includes('ActorSheet5eCharacter-Actor')) 
            {
                debugLog("Rendering for dnd5e character sheet.", styling);
                sanityMadnessHandler.addSanityAndMadnessBarsDnd5e(app.actor, html);
            }
            else if (sheetType.includes('Tidy5eCharacterSheet-Actor')) 
            {
                debugLog("Rendering for tidy5e character sheet.", styling);
                sanityMadnessHandler.addSanityAndMadnessBarsTidy5e(app.actor, html);
            }
            else 
            {
                debugLog("Unknown character sheet type.", styling);
            }
        }
        catch (error) 
        {
            console.error("%cFailed during renderActorSheet hook:", styling, error);
        }
    });
}
