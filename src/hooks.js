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
  
              let madnessIncrement = 0;
  
              // Check each range
              for (let i = 1; i <= 3; i++) 
{
                  const enabled = game.settings.get(MODULE_ID, `enableMadnessRange${i}`);
                  if (enabled) 
{
                      const rangeStart = game.settings.get(MODULE_ID, `madnessRange${i}Start`);
                      const rangeEnd = i < 3 ? game.settings.get(MODULE_ID, `madnessRange${i}End`) : sanityPointsMax; // Use max sanity points for the third range end
                      const increment = game.settings.get(MODULE_ID, `madnessRange${i}Increment`);
                      if (clampedSanity >= rangeStart && clampedSanity <= rangeEnd) 
{
                          madnessIncrement = increment;
                          break; // Exit loop once a range matches
                      }
                  }
              }
  
              if (madnessIncrement > 0) 
{
                  const currentMadness = actor.getFlag("fates-descent", "madness").current + madnessIncrement;
                  changes = foundry.utils.mergeObject(changes, { ["flags.fates-descent.madness.current"]: Math.min(currentMadness, madnessMax) });
                  debugLog(`Madness points incremented by ${madnessIncrement}. New madness: ${currentMadness}`, styling);
              }
          }
          if (changes.flags?.["fates-descent"]?.madness?.current !== undefined) 
{
              const newMadnessCurrent = changes.flags["fates-descent"].madness.current;
              const clampedMadness = Math.min(Math.max(newMadnessCurrent, 0), madnessMax);
              changes = foundry.utils.mergeObject(changes, { ["flags.fates-descent.madness.current"]: clampedMadness });
              debugLog(`Madness points updated: ${newMadnessCurrent} -> ${clampedMadness}`, styling);
  
              applyMadnessPenalties(actor, clampedMadness);
          }
  
      }
 catch (error) 
{
          console.error("%cFailed during preUpdateActor hook:", styling, error);
      }
  });

    /**
     * Applies madness penalties to the actor.
     *
     * @param {Actor} actor
     *
     * @param {number} madnessPoints
     */
    async function applyMadnessPenalties(actor, madnessPoints) 
    {
        // Get the Sanity Modifier
        const sanityModifier = actor.system.abilities.san.mod;

        // Get the starting madness points limit from settings
        const startingMadnessPoints = game.settings.get(MODULE_ID, "startingMadnessPoints");
        const scaleFactor = startingMadnessPoints / 10;

        // Define the base madness levels, scaled according to the starting madness points
        const baseLevels = {
            1: Math.round(startingMadnessPoints * 0.2),
            2: Math.round(startingMadnessPoints * 0.4),
            3: Math.round(startingMadnessPoints * 0.6),
            4: Math.round(startingMadnessPoints * 0.8),
            5: startingMadnessPoints
        };

        // Adjust sanity modifier based on the scale factor
        const adjustedSanityModifier = Math.round(sanityModifier * scaleFactor);

        // Adjust levels based on scaled sanity modifier
        const adjustedLevels = {
            1: Math.max(1, baseLevels[1] + adjustedSanityModifier),
            2: Math.max(1, baseLevels[2] + adjustedSanityModifier),
            3: Math.max(1, baseLevels[3] + adjustedSanityModifier),
            4: Math.max(1, baseLevels[4] + adjustedSanityModifier),
            5: Math.max(1, baseLevels[5] + adjustedSanityModifier)
        };

        debugLog(`Adjusted Madness Levels: ${JSON.stringify(adjustedLevels)}`, styling);

        const penalties = {
            1: { 
                effect: "Disturbance", 
                message: (character, action) => `
                    <h3>${character} has ${action}</h3>
                    <h1>Disturbance</h1>
                    <ul style="text-align: left;">
                        <li>Disadvantage on Wisdom (Insight) checks.</li>
                        <li>Disadvantage on Charisma (Persuasion) checks.</li>
                        <li>Disadvantage on Initiative roll.</li>
                    </ul>
                `, 
                image: "modules/fates-descent/img/madnesschatbackgroundp1.webp",
                aspectRatio: (512 / 512) * 100,
                icon: "modules/fates-descent/img/effectIcon/disturbance.webp",
                changes: [
                    {
                        key: "system.skills.ins.roll.mode",                     
                        mode: 5,
                        value: "-1", 
                        priority: 20
                    },
                    {
                        key: "system.skills.per.roll.mode",                     
                        mode: 5,
                        value: "-1", 
                        priority: 20
                    },
                    {
                        key: "flags.dnd5e.initiativeDisadv",                     
                        mode: 0,
                        value: "1", 
                        priority: 20
                    }          
                ]
            },
            2: { 
                effect: "Disorientation", 
                message: (character, action) => `
                    <h3>${character} has ${action}</h3>    
                    <h1>Disorientation</h1>
                    <ul style="text-align: left;">
                        <li>Disadvantage on Intelligence checks.</li>
                        <li>Disadvantage on Wisdom saving throws.</li>
                        <li>Disadvantage on Dexterity (Acrobatics) checks due to disordered movement from hallucinations.</li>
                    </ul>
                `, 
                image: "modules/fates-descent/img/madnesschatbackgroundp2.webp",
                aspectRatio: (512 / 512) * 100,
                icon: "modules/fates-descent/img/effectIcon/disorientation.webp",
                changes: [
                    {
                        key: "flags.midi-qol.disadvantage.ability.check.int",                     
                        mode: 0,
                        value: "1", 
                        priority: 20
                    },
                    {
                        key: "flags.midi-qol.disadvantage.ability.save.wis",                     
                        mode: 0,
                        value: "1", 
                        priority: 20
                    },
                    {
                        key: "flags.midi-qol.disadvantage.skill.acr",                     
                        mode: 0,
                        value: "1", 
                        priority: 20
                    }
                ]
            },
            3: { 
                effect: "Delirium", 
                message: (character, action) => `
                    <h3>${character} has ${action}</h3> 
                    <h1>Delirium</h1>
                    <ul style="text-align: left;">
                        <li>Vulnerable to Psychic damage.</li>
                        <li>Disadvantage on Constitution saving throws to maintain concentration.</li>
                        <li>Movement speed reduced by 10 feet due to severe disorientation.</li>
                    </ul>
                `, 
                image: "modules/fates-descent/img/madnesschatbackgroundp3.webp",
                aspectRatio: (512 / 512) * 100,
                icon: "modules/fates-descent/img/effectIcon/delirium.webp",
                changes: [
                    {
                        key: "system.traits.dv.value",                     
                        mode: 0,
                        value: "psychic", 
                        priority: 20
                    },
                    {
                        key: "system.attributes.concentration.roll.mode",                     
                        mode: 5,
                        value: "-1", 
                        priority: 20
                    },
                    {
                        key: "system.attributes.movement.walk",                     
                        mode: 2,
                        value: "-10", 
                        priority: 20
                    }
                ]
            },
            4: { 
                effect: "Cataclysm", 
                message: (character, action) => `
                    <h3>${character} has ${action}</h3> 
                    <h1>Cataclysm</h1>
                    <ul style="text-align: left;">
                        <li>Disadvantage on all Wisdom and Charisma checks.</li>
                        <li>Disadvantage on all Intelligence, Wisdom, and Charisma saving throws.</li>
                        <li>Unable to benefit from long rests.</li>
                        <li>Automatic failure on concentration checks.</li>
                    </ul>
                `, 
                image: "modules/fates-descent/img/madnesschatbackgroundp4.webp",
                aspectRatio: (512 / 512) * 100,
                icon: "modules/fates-descent/img/effectIcon/cataclysm.webp",
                changes: [
                    {
                        key: "flags.midi-qol.disadvantage.ability.check.cha",                     
                        mode: 0,
                        value: "1", 
                        priority: 20
                    },
                    {
                        key: "flags.midi-qol.disadvantage.ability.check.wis",                     
                        mode: 0,
                        value: "1", 
                        priority: 20
                    },
                    {
                        key: "flags.midi-qol.disadvantage.save.int",                     
                        mode: 0,
                        value: "1", 
                        priority: 20
                    },
                    {
                        key: "flags.midi-qol.disadvantage.save.wis",                     
                        mode: 0,
                        value: "1", 
                        priority: 20
                    },
                    {
                        key: "flags.midi-qol.disadvantage.save.cha",                     
                        mode: 0,
                        value: "1", 
                        priority: 20
                    },
                    {
                      key: "flags.midi-qol.max.ability.save.concentration",
                      mode: 5,
                      priority: 20,
                      value: "1"
                    }
                ]
            },
            5: { 
                effect: "Oblivion", 
                message: (character) => `
                    <h3>${character} Surrendered to</h3> 
                    <h1>Oblivion</h1>
                    <p>The character's mind is irreparably shattered, rendering them permanently lost to the depths of their own madness.</p>
                `, 
                image: "modules/fates-descent/img/madnesschatbackgroundp5.webp",
                aspectRatio: (512 / 512) * 100,
                icon: "modules/fates-descent/img/effectIcon/oblivion.webp",
                changes: [
                    {
                        key: "type",                     
                        mode: 5,
                        value: "npc", 
                        priority: 20
                    }
                ]
            }
        };

        const actorEffects = actor.effects.map((e) => e.data.label);
        const currentEffects = [];

        // Check which effects are currently applied
        for (let i = 1; i <= 5; i++) 
        {
            if (actorEffects.includes(penalties[i].effect)) 
            {
                currentEffects.push(i);
            }
        }

        debugLog(`Current Madness Effects: ${currentEffects}`, styling);

        // Apply or remove penalties based on the current madness level
        for (let i = 1; i <= 5; i++) 
        {
            if (madnessPoints >= adjustedLevels[i]) 
            {
                if (!currentEffects.includes(i)) 
                {
                    await addMadnessEffect(actor, penalties[i].effect, penalties[i].message, penalties[i].image, penalties[i].aspectRatio, penalties[i].icon, penalties[i].changes, true);
                }
            }
            else 
            {
                if (currentEffects.includes(i)) 
                {
                    await removeMadnessEffect(actor, penalties[i].effect, penalties[i].message, penalties[i].image, penalties[i].aspectRatio);
                }
            }
        }
    }

    /**
     * Adds a Madness effect to the actor and posts a chat message.
     *
     * @param {Actor5e} actor - The actor to add the effect to.
     *
     * @param {string} effectName - The name of the effect to add.
     *
     * @param {Function} messageTemplate - The template function for the chat message.
     *
     * @param {string} imagePath - The path to the background image for the chat message.
     *
     * @param {number} aspectRatio - The aspect ratio of the image.
     *
     * @param {string} iconPath - The path to the icon for the effect.
     *
     * @param {Array} changes - The changes the effect applies.
     *
     * @param {boolean} isGain - Whether the effect is being gained or lost.
     */
    async function addMadnessEffect(actor, effectName, messageTemplate, imagePath, aspectRatio, iconPath, changes, isGain) 
    {
        const effectData = {
            label: effectName,
            icon: iconPath,
            changes,
            origin: `Actor.${actor.id}`,
            disabled: false,
            duration: { rounds: 0, turns: 0 },
            flags: { core: { statusId: effectName } }
        };

        await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
        debugLog(`Effect ${effectName} added to actor ${actor.name}`, styling);

        const characterName = actor.name.split(" ")[0]; // Get the first name of the actor
        const action = isGain ? "Gained" : "Lost";
        const updatedMessage = messageTemplate(characterName, action);

        const chatMessageContent = `
          <div style="
            position: relative; 
            width: 100%; 
            padding-bottom: ${aspectRatio}%; 
            background-image: url('${imagePath}'); 
            background-size: cover; 
            border-radius: 4px; 
            color: white; 
            font-weight: bold; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            text-align: center;">
            <div style="
                position: absolute; 
                top: 0; 
                left: 0; 
                width: 100%; 
                height: 72%; 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                justify-content: flex-start; 
                padding: 10px; 
                background-color: rgba(0, 0, 0, 0.5); 
                margin-top: 13%;">
              ${updatedMessage}
            </div>
          </div>
        `;

        ChatMessage.create({ content: chatMessageContent });
    }

    /**
     * Removes a Madness effect from the actor and posts a chat message.
     *
     * @param {Actor5e} actor - The actor to remove the effect from.
     *
     * @param {string} effectName - The name of the effect to remove.
     *
     * @param {Function} messageTemplate - The template function for the chat message.
     *
     * @param {string} imagePath - The path to the background image for the chat message.
     *
     * @param {number} aspectRatio - The aspect ratio of the image.
     */
    async function removeMadnessEffect(actor, effectName, messageTemplate, imagePath, aspectRatio) 
    {
        const effect = actor.effects.find((e) => e.data.label === effectName);
        if (effect) 
        {
            await effect.delete();
            debugLog(`Effect ${effectName} removed from actor ${actor.name}`, styling);

            const characterName = actor.name.split(" ")[0]; // Get the first name of the actor
            const updatedMessage = messageTemplate(characterName, "Lost");

            const chatMessageContent = `
              <div style="
                position: relative; 
                width: 100%; 
                padding-bottom: ${aspectRatio}%; 
                background-image: url('${imagePath}'); 
                background-size: cover; 
                border-radius: 4px; 
                color: white; 
                font-weight: bold; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                text-align: center;">
                <div style="
                    position: absolute; 
                    top: 0; 
                    left: 0; 
                    width: 100%; 
                    height: 72%; 
                    display: flex; 
                    flex-direction: column; 
                    align-items: center; 
                    justify-content: flex-start; 
                    padding: 10px; 
                    background-color: rgba(0, 0, 0, 0.5); 
                    margin-top: 13%;">
                  ${updatedMessage}
                </div>
              </div>
            `;

            ChatMessage.create({ content: chatMessageContent });
        }
    }

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
  const hasCataclysm = actor.effects.find((e) => e.data.label === "Cataclysm");
  if (hasCataclysm) 
{
      ChatMessage.create({ content: `${actor.name} cannot benefit from a long rest due to their madness.` });
      return false; // Prevent the long rest
  }
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
        .sanity-dialog select {
          margin-left: 10px;
          background: #333; 
          color: #f8f8f8; 
          border: 1px solid #444;
          padding: 2px;
          border-radius: 4px;
          font-size: 12px;
          text-align: center;
        }
        .sanity-dialog input {
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
          <select name="hitDice" style="width: 100px;>${options.join("")}</select>
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
