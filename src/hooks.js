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

Hooks.on("midi-qol.RollComplete", async (workflow) => 
{
    debugLog("Roll Complete Hook:", styling, workflow);  
    if (!workflow.damageDetail || !Array.isArray(workflow.damageDetail)) 
    {
      console.warn("No damage detail found or not in the expected format:", workflow.damageDetail);
      return;
    }
  
    for (const damageInfo of workflow.damageDetail) 
    {
        debugLog("Processing Damage Info:", styling, damageInfo);
        if (damageInfo.type === "sanity") 
        {
            for (const target of workflow.targets) 
            {
                const targetActor = target.actor;
                const sanityPoints = getProperty(targetActor, "flags.fates-descent.sanityPoints.current");
                debugLog(`Sanity Points for ${targetActor.name}:`, styling, sanityPoints);    
                if (sanityPoints !== undefined) 
                {
                    const newSanityPoints = Math.max(0, sanityPoints - damageInfo.damage);
                    await targetActor.setFlag("fates-descent", "sanityPoints.current", newSanityPoints);
                    debugLog(`Sanity Points for ${targetActor.name} reduced from ${sanityPoints} to ${newSanityPoints}`, styling);
                } 
                else 
                {
                    console.warn(`Sanity Points attribute not found on the target actor ${targetActor.name}.`);
                }
                const currentHP = targetActor.system.attributes.hp.value;
                const newHP = currentHP + damageInfo.damage;
                await targetActor.update({ "system.attributes.hp.value": newHP });
                debugLog(`HP for ${targetActor.name} increased by ${damageInfo.damage}`, styling);
            }
        }
    }
}); 

/**
 * Registers hooks for dnd5e.preShortRest and dnd5e.preLongRest to handle sanity point recovery.
 */
Hooks.on("dnd5e.preShortRest", async (actor, config) => 
{
    return await handleSanityRest(actor, config);
  });
  
  Hooks.on("dnd5e.preLongRest", async (actor, config) => 
{
    return await handleSanityRest(actor, config);
  });
  
  /**
   * Handles sanity point recovery during short or long rests.
   * Prompts the user to select hit dice to use for recovering sanity points.
   *
   * @param {Actor5e} actor - The actor that is being rested.
   *
   * @returns {Promise<boolean>} - Returns true to continue with the rest, false otherwise.
   */
  async function handleSanityRest(actor) 
{
    const hitDiceLeft = Object.values(actor.classes).reduce((acc, classItem) => 
{
      if (classItem.system.hitDiceUsed < classItem.system.levels) 
{
        if (!acc[classItem.system.hitDice]) 
{
 acc[classItem.system.hitDice] = {
          remaining: 0,
          class: null,
        }; 
}
        acc[classItem.system.hitDice].remaining += classItem.system.levels - classItem.system.hitDiceUsed;
        acc[classItem.system.hitDice].class = classItem.identifier; 
      }
      return acc;
    }, {});
  
    const options = Object.entries(hitDiceLeft).map(([hitDice, data]) => `<option value="${hitDice}">${hitDice} (${data.remaining} left)</option>`);
    if (!options.length) { return true; }  // No hit dice left, continue with the rest
  
    const selected = await new Promise((resolve) => 
{
      const dialog = new Dialog({
        title: "Sanity Points HitDie Recovery",
        content: `
        <style>
          .sanity-dialog {
            background: #222;
            color: #f8f8f8;
            padding: 5px;
            border-radius: 0px;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .sanity-dialog p {
            margin-bottom: 5px;
          }
          .sanity-dialog select, .sanity-dialog input {
            margin-left: 10px;
            background: #333; 
            color: #f8f8f8; 
            border: 1px solid #444;
            padding: 2px;
            border-radius: 4px;
            font-size: 12px;
            text-align: center;
          }
          .sanity-dialog button {
            background: #f8f8f8;
            color: #222;
            border: none;
            padding: 1px 5px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 12px;
            cursor: pointer;
          }
          .sanity-dialog button:hover {
            background: #95f853;
          }
          .custom-dialog-position {
            top: 20% !important;
          }
        </style>
        <div class="sanity-dialog">
          <h3>Select Hit Dice to Recover Sanity</h3>
          <p>
            <select name="hitDice">${options.join("")}</select>
            <input type="number" name="numDice" min="1" value="1" style="width: 50px;" />
          </p>
        </div>
        `,
        buttons: {
          yes: {
            label: "Confirm",
            callback: (html) => 
{
              const selectedValue = html.find("select").val();
              const numDice = parseInt(html.find('input[name="numDice"]').val(), 10);
              resolve({
                class: hitDiceLeft[selectedValue].class,
                hitDice: selectedValue,
                numDice
              });
            },
          },
          no: {
            label: "Cancel",
            callback: () => resolve(null),
          },
        },
        default: "no",
      }, {
        classes: ["custom-dialog-position"]
      });
      dialog.render(true);
    });
  
    if (!selected) { return true; }  // User canceled, continue with the rest
  
    const rollDice = await new Roll(`${selected.numDice}${selected.hitDice}`).evaluate({ async: true });
    const sanityPoints = getProperty(actor, "flags.fates-descent.sanityPoints.current");
    const maxSanity = getProperty(actor, "flags.fates-descent.sanityPoints.max");
  
    if (sanityPoints < maxSanity) 
{
      const newValue = Math.min(sanityPoints + rollDice.total, maxSanity);
      await actor.setFlag("fates-descent", "sanityPoints.current", newValue);
      rollDice.toMessage();
      const regainedSanity = newValue - sanityPoints;
      ChatMessage.create({ content: `${actor.name} has regained ${regainedSanity} Sanity!` });
    }
 else 
{
      return true;  // No sanity points to recover, continue with the rest
    }
  
    if (selected.class) 
{
      for (const classItem of Object.values(actor.classes)) 
{
        if (classItem.identifier === selected.class) 
{
          classItem.system.hitDiceUsed += selected.numDice;
          await classItem.update({ 'system.hitDiceUsed': classItem.system.hitDiceUsed });
          break;
        }
      }
    }
  
    return true;
  }
  