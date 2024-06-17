// MadnessEffects.js

import { MODULE_ID } from "./settings.js";
import { debugLog } from "./utils.js";

const styling = `
    color:#D01B00;
    background-color:#A3A6B4;
    font-size:9pt;
    font-weight:bold;
    padding:1pt;
`;

/**
 * Prompts the user with a dialog to choose a table (short-term or long-term insanity) to roll on,
 * and gain an insanity effect to reduce their madness points.
 *
 * @param {string} actorId - The ID of the actor who will receive the insanity effect and reduce madness points.
 * 
 * @returns {Promise<void>} - A promise that resolves when the dialog interaction is complete and the effect is applied.
 */
async function promptMadnessReduction(actorId) 
{
    debugLog("Prompt Madness Reduction Actor Recieved:", styling, actorId);
  
    const actor = game.actors.get(actorId);
    debugLog("Prompt Madness Actor:", styling, actor);
    if (!actor) { return; }

    new Dialog({
        title: "Temporary Insanity",
        content: `
        <style>
            .insanity-dialog {
                background: #222;
                color: #f8f8f8;
                padding: 5px;
                border-radius: 0px;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .insanity-dialog p {
                margin-bottom: 5px;
            }
            .insanity-dialog button {
                background: #f8f8f8;
                color: #ffffff;
                border: none;
                padding: 1px 5px;
                border-radius: 4px;
                font-weight: bold;
                font-size: 12px;
                cursor: pointer;
            }
            .insanity-dialog button:hover {
                background: #95f853;
            }
            .custom-dialog-position {
                top: 20% !important;
            }
        </style>
        <div class="insanity-dialog">
            <h4>Rolltable to gain an Insanity and reduce Madness:</h4>
            <ul style="text-align: left;">
                        <li>Short-Term Reduction -${game.settings.get(MODULE_ID, "shortTermInsanityReduction")}</li>
                        <li>Long-Term Reduction -${game.settings.get(MODULE_ID, "longTermInsanityReduction")}</li>
                    </ul>

        </div>
        `,
        buttons: {
            shortTerm: {
                label: `Short-Term`,
                callback: async () => 
{
                    await rollMadnessReduction(actor, "short");
                }
            },
            longTerm: {
                label: `Long-Term`,
                callback: async () => 
{
                    await rollMadnessReduction(actor, "long");
                }
            },
            cancel: {
                label: "Cancel",
                callback: () => 
{
                    console.log("Madness reduction canceled.");
                }
            }
        },
        default: "shortTerm",
    }).render(true);
}


/**
 * Rolls on the selected madness table (short-term or long-term) and applies the resulting madness effect
 * to the specified actor, then reduces the actor's madness points by the configured amount.
 *
 * @param {Actor5e} actor - The actor who will receive the madness effect and have their madness points reduced.
 * 
 * @param {string} tableType - The type of madness table to roll on ("short" or "long").
 * 
 * @returns {Promise<void>} - A promise that resolves when the madness effect is applied and madness points are reduced.
 */
async function rollMadnessReduction(actor, tableType) 
{
    let durationRoll, durationText, effect, result, roll;
    if (tableType === "short") 
    {
        roll = await new Roll("1d100").roll({ async: true });
        await roll.toMessage();
        result = getShortTermMadnessEffect(roll.total);
        durationRoll = await new Roll("1d10").roll({ async: true });
        durationText = `${durationRoll.total} minutes`;
        effect = result.effect;
        await applyMadnessEffect(actor, effect, durationText);
        await reduceMadnessPoints(actor, game.settings.get(MODULE_ID, "shortTermInsanityReduction"));
    }
    else 
    {
        roll = await new Roll("1d100").roll({ async: true });
        await roll.toMessage();
        result = getLongTermMadnessEffect(roll.total);
        durationRoll = await new Roll("1d10").roll({ async: true });
        durationText = `${durationRoll.total * 10} hours`;
        effect = result.effect;
        await applyMadnessEffect(actor, effect, durationText);
        await reduceMadnessPoints(actor, game.settings.get(MODULE_ID, "longTermInsanityReduction"));
    }

    const firstName = actor.name.split(" ")[0]; // Get the first name of the actor

    const chatMessageContent = `
        <div style="
            position: relative; 
            width: 100%; 
            padding-bottom: 50%; 
            background-image: url('modules/fates-descent/img/madnesschatbackgroundv2.webp'); 
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
                margin-top: 1%;">
                ${effect.message(firstName, durationText)}
            </div>
        </div>
    `;

    await ChatMessage.create({ content: chatMessageContent });
}

/**
 * Converts a raw duration string into a duration object suitable for Foundry VTT's ActiveEffect duration.
 * 
 * The rawDuration string can contain time units such as days, hours, minutes, seconds, rounds, and turns.
 * For example, "1 day 2 hours 30 minutes" will be converted into the corresponding duration object.
 * Special values like "manual" or "none" will return a duration with a high number of seconds to indicate
 * an indefinite duration.
 * 
 * @param {string} rawDuration - The raw duration string to be converted.
 * 
 * @returns {object} - The duration object with properties such as seconds, rounds, or turns.
 */
function convertDuration(rawDuration)
{
    debugLog(`Converting rawDuration: ${rawDuration}`, styling);
    if (typeof rawDuration !== 'string') 
    {
        console.error("Invalid rawDuration:", rawDuration);
        return {};
    }
    if (rawDuration.toLowerCase() === 'manual' || rawDuration.toLowerCase() === 'none') 
    {
        return { seconds: 99999 };
    }
    const timePatterns = {
        days: { regex: /\b(\d+)\s*days?\b/i, multiplier: 86400 },
        hours: { regex: /\b(\d+)\s*hours?\b/i, multiplier: 3600 },
        minutes: { regex: /\b(\d+)\s*minutes?\b/i, multiplier: 60 },
        seconds: { regex: /\b(\d+)\s*seconds?\b/i, multiplier: 1 },
        rounds: { regex: /\b(\d+)\s*rounds?\b/i },
        turns: { regex: /\b(\d+)\s*turns?\b/i },
    };
    const duration = {};
    let specialUnitsSet = false;
    Object.entries(timePatterns).forEach(([unit, { regex, multiplier }]) => 
    {
        const match = rawDuration.match(regex);
        if (match) 
    {
            const value = parseInt(match[1], 10);
            if (multiplier) 
            {
                duration.seconds = (duration.seconds || 0) + (value * multiplier);
            }
            else 
            {
                duration[unit] = value;
                specialUnitsSet = true;
            }
        }
    });
    if (specialUnitsSet && 'seconds' in duration) 
    {
        delete duration.seconds;
    }
    debugLog(`Converted Duration:`, styling, duration);

    return duration;
}

/**
 * Applies a madness effect to the specified actor, converting the raw duration string into the appropriate format.
 *
 * This function creates an ActiveEffect document on the actor with the specified effect details, including the
 * name, icon, changes, origin, and duration. The raw duration string is converted to the appropriate duration object.
 *
 * @param {object} actor - The actor to which the madness effect will be applied.
 * 
 * @param {object} effect - The effect details, including name, icon, and changes.
 * 
 * @param {string} rawDuration - The raw duration string to be converted and applied to the effect.
 */
async function applyMadnessEffect(actor, effect, rawDuration)
{
    const duration = convertDuration(rawDuration);
    const effectData = {
        name: effect.name,
        icon: effect.icon,
        description: effect.description,
        changes: effect.changes,
        origin: `Actor.${actor.id}`,
        disabled: false,
        duration,
        flags: { core: { statusId: effect.name } }
    };

    await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
    debugLog(`Effect ${effect.name} added to actor ${actor.name}`, styling);
}

/**
 * Reduces the madness points of the specified actor by a given amount.
 *
 * This function calculates the new madness points by subtracting the reduction from the current madness points.
 * The new madness points value is then set as a flag on the actor. A chat message is created to indicate the reduction.
 *
 * @param {object} actor - The actor whose madness points will be reduced.
 * 
 * @param {number} reduction - The amount by which to reduce the madness points.
 */
async function reduceMadnessPoints(actor, reduction)

{
    const currentMadness = actor.getFlag("fates-descent", "madness").current;
    const newMadness = Math.max(currentMadness - reduction, 0);
    await actor.setFlag("fates-descent", "madness", { current: newMadness });
    ChatMessage.create({ content: `${actor.name} has reduced their Madness level by ${reduction} points.` });
}

/**
 * Retrieves the short-term madness effect based on the given roll.
 *
 * This function selects an effect from a predefined list of short-term madness effects
 * based on the provided roll value. Each effect includes details such as the effect name,
 * message, icon, and changes to be applied.
 *
 * @param {number} roll - The result of the roll used to determine the short-term madness effect.
 * 
 * @returns {object} The corresponding short-term madness effect based on the roll value.
 */
function getShortTermMadnessEffect(roll)
 
{
    const effects = [
        {
            range: [1, 20],
            effect: {
                name: "Stasis",
                message: (character, durationText) => `
                    <h3 style="margin-bottom: 3px;">${character} has entered Stasis.</h3>
                    <h4 style="margin-bottom: 1px;">Duration: ${durationText}</h4>
                    <p>The character retreats into his or her mind and becomes paralyzed. The effect ends if the character takes any damage.</p>
                `,
                icon: "modules/fates-descent/img/insanityIcon/paralysis.webp",
                description: "The character retreats into his or her mind and becomes paralyzed. The effect ends if the character takes any damage.",
                changes: [
                    { 
                        key: "StatusEffectName",
                        mode: 0,
                        priority: 20,
                        value: "Stasis"
                    },
                    { 
                        key: "flags.midi-qol.fail.ability.save.dex",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    },
                    { 
                        key: "flags.midi-qol.fail.ability.save.str",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    },
                    { 
                        key: "flags.midi-qol.grants.advantage.attack.all",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    },
                    { 
                        key: "flags.midi-qol.grants.critical.range",
                        mode: 5,
                        priority: 20,
                        value: "5"
                    },
                    { 
                        key: "system.attributes.movement.all",
                        mode: 0,
                        priority: 20,
                        value: "0"
                    }
                ]
            }
        },
        {
            range: [21, 30],
            effect: {
                name: "Hysterical",
                message: (character, durationText) => `
                    <h3 style="margin-bottom: 3px;">${character} has become Hysterical</h3>
                    <h4 style="margin-bottom: 1px;">Duration: ${durationText}</h4>
                    <p>The character becomes incapacitated and spends the duration screaming, laughing, or weeping.</p>
                `,
                icon: "modules/fates-descent/img/insanityIcon/hysterical.webp",
                description: "The character becomes incapacitated and spends the duration screaming, laughing, or weeping.",
                changes: [
                    { 
                        key: "StatusEffectName",
                        mode: 0,
                        priority: 20,
                        value: "Hysterical"
                    },
                    { 
                        key: "flags.midi-qol.fail.ste",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    },
                    { 
                        key: "system.attributes.movement.all",
                        mode: 0,
                        priority: 20,
                        value: "0"
                    }
                ]
            }
        },
        {
            range: [31, 40],
            effect: {
                name: "Frightened",
                message: (character, durationText) => `
                    <h3 style="margin-bottom: 3px;">${character} has become Frightened</h3>
                    <h4 style="margin-bottom: 1px;">Duration: ${durationText}</h4>
                    <p>The character becomes frightened and must use his or her action and movement each round to flee from the source of the fear.</p>
                `,
                icon: "modules/fates-descent/img/insanityIcon/frightened.webp",
                description: "The character becomes frightened and must use his or her action and movement each round to flee from the source of the fear.",
                changes: [
                    { 
                        key: "StatusEffectName",
                        mode: 0,
                        priority: 20,
                        value: "Frightened"
                    },
                    { 
                        key: "flags.midi-qol.disadvantage.attack.all",
                        mode: 0,
                        priority: 20,
                        value: ""
                    },
                    { 
                        key: "flags.midi-qol.disadvantage.ability.check.all",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    }
                ]
            }
        },
        {
            range: [41, 50],
            effect: {
                name: "Babbling",
                message: (character, durationText) => `
                    <h3 style="margin-bottom: 3px;">${character} has started Babbling</h3>
                    <h4 style="margin-bottom: 1px;">Duration: ${durationText}</h4>
                    <p>The character begins babbling and is incapable of normal speech or spellcasting.</p>
                `,
                icon: "modules/fates-descent/img/insanityIcon/babbling.webp",
                description: "The character begins babbling and is incapable of normal speech or spellcasting.",
                changes: [
                    { 
                        key: "flags.midi-qol.fail.spell.vocal",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    },
                    { 
                        key: "flags.midi-qol.fail.skill.ste",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    }
                ]
            }
        },
        {
            range: [51, 60],
            effect: {
                name: "Malice",
                message: (character, durationText) => `
                    <h3 style="margin-bottom: 3px;">${character} is Maleficent.</h3>
                    <h4 style="margin-bottom: 1px;">Duration: ${durationText}</h4>
                    <p>The character must use his or her action each round to attack the nearest creature.</p>
                `,
                icon: "modules/fates-descent/img/insanityIcon/malice.webp",
                description: "The character must use his or her action each round to attack the nearest creature.",
                changes: [
                    { 
                        key: "StatusEffectName",
                        mode: 0,
                        priority: 20,
                        value: "Malice"
                    }
                ]
            }
        },
        {
            range: [61, 70],
            effect: {
                name: "Hallucinations",
                message: (character, durationText) => `
                    <h3 style="margin-bottom: 3px;">${character} is Hallucinating.</h3>
                    <h4 style="margin-bottom: 1px;">Duration: ${durationText}</h4>
                    <p>The character experiences vivid hallucinations and has disadvantage on ability checks.</p>
                `,
                icon: "modules/fates-descent/img/insanityIcon/hallucinations.webp",
                description: "The character experiences vivid hallucinations and has disadvantage on ability checks.",
                changes: [
                    { 
                        key: "StatusEffectName",
                        mode: 0,
                        priority: 20,
                        value: "Hallucinations"
                    },
                    { 
                        key: "flags.midi-qol.disadvantage.ability.check.all",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    }
                ]
            }
        },
        {
            range: [71, 75],
            effect: {
                name: "Compelled",
                message: (character, durationText) => `
                    <h3 style="margin-bottom: 3px;">${character} is easily Compelled.</h3>
                    <h4 style="margin-bottom: 1px;">Duration: ${durationText}</h4>
                    <p>The character does whatever anyone tells him or her to do that isn't obviously self-destructive.</p>
                `,
                icon: "modules/fates-descent/img/insanityIcon/compelled.webp",
                description: "The character does whatever anyone tells him or her to do that isn't obviously self-destructive.",
                changes: [
                    { 
                        key: "StatusEffectName",
                        mode: 0,
                        priority: 20,
                        value: "Compelled"
                    }
                ]
            }
        },
        {
            range: [76, 80],
            effect: {
                name: "Hunger",
                message: (character, durationText) => `
                    <h3 style="margin-bottom: 3px;">${character} is Ravenous</h3>
                    <h4 style="margin-bottom: 1px;">Duration: ${durationText}</h4>
                    <p>The character experiences an overpowering urge to eat something strange such as dirt, slime, or offal.</p>
                `,
                icon: "modules/fates-descent/img/insanityIcon/hunger.webp",
                description: "The character experiences an overpowering urge to eat something strange such as dirt, slime, or offal.",
                changes: [
                    { 
                        key: "StatusEffectName",
                        mode: 0,
                        priority: 20,
                        value: "Hunger"
                    },
                    { 
                        key: "flags.midi-qol.disadvantage.ability.check.all",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    },
                    { 
                        key: "flags.midi-qol.disadvantage.skill.all ",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    }
                ]
            }
        },
        {
            range: [81, 90],
            effect: {
                name: "Stunned",
                message: (character, durationText) => `
                    <h3 style="margin-bottom: 3px;">${character} is Stunned</h3>
                    <h4 style="margin-bottom: 1px;">Duration: ${durationText}</h4>
                    <p>The character is stunned.</p>
                `,
                icon: "modules/fates-descent/img/insanityIcon/stunned.webp",
                description: "The character is stunned.",
                changes: [
                    { 
                        key: "StatusEffectName",
                        mode: 0,
                        priority: 20,
                        value: "Stunned"
                    },
                    { 
                        key: "flags.midi-qol.fail.ability.save.dex",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    },
                    { 
                        key: "flags.midi-qol.fail.ability.save.str",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    },
                    { 
                        key: "flags.midi-qol.grants.advantage.attack.all",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    }
                ]
            }
        },
        {
            range: [91, 100],
            effect: {
                name: "Catatonic",
                message: (character, durationText) => `
                    <h3 style="margin-bottom: 3px;">${character} falls Catatonic</h3>
                    <h4 style="margin-bottom: 1px;">Duration: ${durationText}</h4>
                    <p>The character falls unconscious.</p>
                `,
                icon: "modules/fates-descent/img/insanityIcon/unconscious.webp",
                description: "The character falls unconscious.",
                changes: [
                    { 
                        key: "StatusEffectName",
                        mode: 0,
                        priority: 20,
                        value: "Catatonic"
                    },
                    { 
                        key: "flags.midi-qol.fail.ability.save.dex",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    },
                    { 
                        key: "flags.midi-qol.fail.ability.save.str",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    },
                    { 
                        key: "flags.midi-qol.grants.advantage.attack.all",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    },
                    { 
                        key: "flags.midi-qol.grants.critical.range",
                        mode: 5,
                        priority: 20,
                        value: "5"
                    },
                    { 
                        key: "system.attributes.movement.all",
                        mode: 0,
                        priority: 20,
                        value: "0"
                    },
                    { 
                        key: "flags.midi-qol.grants.advantage.attack.mwak",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    },
                    { 
                        key: "flags.midi-qol.grants.advantage.attack.msak",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    },
                    { 
                        key: "flags.midi-qol.grants.disadvantage.attack.rwak",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    },
                    { 
                        key: "flags.midi-qol.grants.disadvantage.attack.rsak",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    },
                    { 
                        key: "flags.midi-qol.disadvantage.attack.all",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    }
                    
                ]
            }
        }
    ];

    return effects.find((effect) => roll >= effect.range[0] && roll <= effect.range[1]);
}

/**
 * Retrieves the long-term madness effect based on the given roll.
 *
 * This function selects an effect from a predefined list of long-term madness effects
 * based on the provided roll value. Each effect includes details such as the effect name,
 * message, icon, and changes to be applied.
 *
 * @param {number} roll - The result of the roll used to determine the long-term madness effect.
 * 
 * @returns {object} The corresponding long-term madness effect based on the roll value.
 */
function getLongTermMadnessEffect(roll)
 
{
    const effects = [
        {
            range: [1, 10],
            effect: {
                name: "Compulsion",
                message: (character, durationText) => `
                    <h3 style="margin-bottom: 3px;">${character} is Compulsive.</h3>
                    <h4 style="margin-bottom: 1px;">Duration: ${durationText}</h4>
                    <p>The character feels compelled to repeat a specific activity over and over, such as washing hands, touching things, praying, or counting coins.</p>
                `,
                icon: "modules/fates-descent/img/insanityIcon/compulsion.webp",
                description: "The character feels compelled to repeat a specific activity over and over, such as washing hands, touching things, praying, or counting coins.",
                changes: [
                    { 
                        key: "StatusEffectName",
                        mode: 0,
                        priority: 20,
                        value: "Compulsion"
                    }
                ]
            }
        },
        {
            range: [11, 20],
            effect: {
                name: "Hallucinations",
                message: (character, durationText) => `
                    <h3 style="margin-bottom: 3px;">${character} is Hallucinating</h3>
                    <h4 style="margin-bottom: 1px;">Duration: ${durationText}</h4>
                    <p>The character experiences vivid hallucinations and has disadvantage on ability checks.</p>
                `,
                icon: "modules/fates-descent/img/insanityIcon/hallucinations.webp",
                description: "The character experiences vivid hallucinations and has disadvantage on ability checks.",
                changes: [
                    { 
                        key: "StatusEffectName",
                        mode: 0,
                        priority: 20,
                        value: "Hallucinations"
                    },
                    { 
                        key: "flags.midi-qol.disadvantage.ability.check.all ",
                        mode: 0,
                        priority: 20,
                        value: ""
                    }
                ]
            }
        },
        {
            range: [21, 30],
            effect: {
                name: "Paranoia",
                message: (character, durationText) => `
                    <h3 style="margin-bottom: 3px;">${character} is Paranoid</h3>
                    <h4 style="margin-bottom: 1px;">Duration: ${durationText}</h4>
                    <p>The character suffers extreme paranoia. The character has disadvantage on Wisdom and Charisma checks.</p>
                `,
                icon: "modules/fates-descent/img/insanityIcon/paranoia.webp",
                description: "The character suffers extreme paranoia. The character has disadvantage on Wisdom and Charisma checks.",
                changes: [
                    { 
                        key: "StatusEffectName",
                        mode: 0,
                        priority: 20,
                        value: "Paranoia"
                    },
                    { 
                        key: "flags.midi-qol.advantage.ability.check.wis",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    },
                    { 
                        key: "flags.midi-qol.advantage.ability.check.cha",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    }
                ]
            }
        },
        {
            range: [31, 40],
            effect: {
                name: "Revulsion",
                message: (character, durationText) => `
                    <h3 style="margin-bottom: 3px;">${character} is Disgusted</h3>
                    <h4 style="margin-bottom: 1px;">Duration: ${durationText}</h4>
                    <p>The character regards something (usually the source of madness) with intense revulsion.</p>
                `,
                icon: "modules/fates-descent/img/insanityIcon/revulsion.webp",
                description: "The character regards something (usually the source of madness) with intense revulsion.",
                changes: [
                    { 
                        key: "StatusEffectName",
                        mode: 0,
                        priority: 20,
                        value: "Revulsion"
                    },
                    { 
                        key: "flags.midi-qol.disadvantage.attack.all",
                        mode: 0,
                        priority: 20,
                        value: ""
                    },
                    { 
                        key: "flags.midi-qol.disadvantage.ability.check.all",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    }
                ]
            }
        },
        {
            range: [41, 45],
            effect: {
                name: "Delusion",
                message: (character, durationText) => `
                    <h3 style="margin-bottom: 3px;">${character} is Delusional</h3>
                    <h4 style="margin-bottom: 1px;">Duration: ${durationText}</h4>
                    <p>The character experiences a powerful delusion. Choose a potion. The character imagines that he or she is under its effects.</p>
                `,
                icon: "modules/fates-descent/img/insanityIcon/delusion.webp",
                description: "The character experiences a powerful delusion. Choose a potion. The character imagines that he or she is under its effects.",
                changes: [
                    { 
                        key: "StatusEffectName",
                        mode: 0,
                        priority: 20,
                        value: "Delusion"
                    }
                ]
            }
        },
        {
            range: [46, 55],
            effect: {
                name: "Lucky Charm",
                message: (character, durationText) => `
                    <h3 style="margin-bottom: 3px;">${character} is Lucky Charmed</h3>
                    <h4 style="margin-bottom: 1px;">Duration: ${durationText}</h4>
                    <p>The character becomes attached to a "lucky charm," such as a person or an object, and has disadvantage on attack rolls, ability checks, and saving throws while more than 30 feet from it.</p>
                `,
                icon: "modules/fates-descent/img/insanityIcon/luckycharm.webp",
                description: "The character becomes attached to a lucky charm, such as a person or an object, and has disadvantage on attack rolls, ability checks, and saving throws while more than 30 feet from it.",
                changes: [
                    { 
                        key: "StatusEffectName",
                        mode: 0,
                        priority: 20,
                        value: "Lucky Charm"
                    }
                ]
            }
        },
        {
            range: [56, 65],
            effect: {
                name: "Imprisoned",
                message: (character, durationText) => `
                    <h3 style="margin-bottom: 3px;">${character} becomes Imprisoned.</h3>
                    <h4 style="margin-bottom: 1px;">Duration: ${durationText}</h4>
                    <p>The character loses sight and sound, helplessly imprisoned with their thoughts.</p>
                `,
                icon: "modules/fates-descent/img/insanityIcon/blindedanddeafened.webp",
                desription: "The character loses sight and sound, helplessly imprisoned with their thoughts.",
                changes: [
                    { 
                        key: "StatusEffectName",
                        mode: 0,
                        priority: 20,
                        value: "Imprisoned"
                    },
                    { 
                        key: "flags.midi-qol.disadvantage.attack.all",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    },
                    { 
                        key: "flags.midi-qol.grants.advantage.attack.all",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    },
                    { 
                        key: "system.attributes.movement.all",
                        mode: 0,
                        priority: 20,
                        value: "0"
                    }
                ]
            }
        },
        {
            range: [66, 75],
            effect: {
                name: "Tremors",
                message: (character, durationText) => `
                    <h3 style="margin-bottom: 3px;">${character} shakes Uncontrollably</h3>
                    <h4 style="margin-bottom: 1px;">Duration: ${durationText}</h4>
                    <p>The character experiences uncontrollable tremors or tics, which impose disadvantage on attack rolls, ability checks, and saving throws that involve Strength or Dexterity.</p>
                `,
                icon: "modules/fates-descent/img/insanityIcon/tremors.webp",
                description: "The character experiences uncontrollable tremors or tics, which impose disadvantage on attack rolls, ability checks, and saving throws that involve Strength or Dexterity.",
                changes: [
                    { 
                        key: "StatusEffectName",
                        mode: 0,
                        priority: 20,
                        value: "Tremors"
                    },
                    { 
                        key: "flags.midi-qol.disadvantage.attack.dex",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    },
                    { 
                        key: "flags.midi-qol.disadvantage.attack.str",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    },
                    { 
                        key: "flags.midi-qol.disadvantage.ability.check.dex",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    },
                    { 
                        key: "flags.midi-qol.disadvantage.ability.check.str",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    },
                    { 
                        key: "flags.midi-qol.disadvantage.ability.save.dex",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    },
                    { 
                        key: "flags.midi-qol.disadvantage.ability.save.str",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    }
                ]
            }
        },
        {
            range: [76, 85],
            effect: {
                name: "Amnesia",
                message: (character, durationText) => `
                    <h3 style="margin-bottom: 3px;">${character} is Amnesic</h3>
                    <h4 style="margin-bottom: 1px;">Duration: ${durationText}</h4>
                    <p>The character suffers from amnesia. The character knows who he or she is and retains racial traits and class features, but doesn't recognize other people or remember anything that happened before the madness took effect.</p>
                `,
                icon: "modules/fates-descent/img/insanityIcon/amnesia.webp",
                description: "The character suffers from amnesia. The character knows who he or she is and retains racial traits and class features, but doesn't recognize other people or remember anything that happened before the madness took effect.",
                changes: [
                    { 
                        key: "StatusEffectName",
                        mode: 0,
                        priority: 20,
                        value: "Amnesia"
                    }
                ]
            }
        },
        {
            range: [86, 90],
            effect: {
                name: "Confusion",
                message: (character, durationText) => `
                    <h3 style="margin-bottom: 3px;">${character} suffers Confusion</h3>
                    <h4 style="margin-bottom: 1px;">Duration: ${durationText}</h4>
                    <p>Whenever the character takes damage, he or she must succeed on a DC 15 Wisdom saving throw or be affected as though he or she failed a saving throw against the confusion spell. The confusion effect lasts for 1 minute.</p>
                `,
                icon: "modules/fates-descent/img/insanityIcon/confusion.webp",
                description: "Whenever the character takes damage, he or she must succeed on a DC 15 Wisdom saving throw or be affected as though he or she failed a saving throw against the confusion spell. The confusion effect lasts for 1 minute.",
                changes: [
                    { 
                        key: "StatusEffectName",
                        mode: 0,
                        priority: 20,
                        value: "Confusion"
                    }
                ]
            }
        },
        {
            range: [91, 95],
            effect: {
                name: "Silenced",
                message: (character, durationText) => `
                    <h3 style="margin-bottom: 3px;">${character} is Silenced</h3>
                    <h4 style="margin-bottom: 1px;">Duration: ${durationText}</h4>
                    <p>The character loses the ability to speak.</p>
                `,
                icon: "modules/fates-descent/img/insanityIcon/silenced.webp",
                description: "The character loses the ability to speak.",
                changes: [
                    { 
                        key: "StatusEffectName",
                        mode: 0,
                        priority: 20,
                        value: "Silenced"
                    },
                    { 
                        key: "flags.midi-qol.fail.spell.vocal",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    }
                ]
            }
        },
        {
            range: [96, 100],
            effect: {
                name: "Catatonic",
                message: (character, durationText) => `
                    <h3 style="margin-bottom: 3px;">${character} falls Catatonic</h3>
                    <h4 style="margin-bottom: 1px;">Duration: ${durationText}</h4>
                    <p>The character falls catatonic. No amount of jostling or damage can wake the character.</p>
                `,
                icon: "modules/fates-descent/img/insanityIcon/unconscious.webp",
                description: "The character falls catatonic. No amount of jostling or damage can wake the character.",
                changes: [
                    { 
                        key: "StatusEffectName",
                        mode: 0,
                        priority: 20,
                        value: "Catatonic"
                    },
                    { 
                        key: "flags.midi-qol.fail.ability.save.dex",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    },
                    { 
                        key: "flags.midi-qol.fail.ability.save.str",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    },
                    { 
                        key: "flags.midi-qol.grants.advantage.attack.all",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    },
                    { 
                        key: "flags.midi-qol.grants.critical.range",
                        mode: 5,
                        priority: 20,
                        value: "5"
                    },
                    { 
                        key: "system.attributes.movement.all",
                        mode: 0,
                        priority: 20,
                        value: "0"
                    },
                    { 
                        key: "flags.midi-qol.grants.advantage.attack.mwak",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    },
                    { 
                        key: "flags.midi-qol.grants.advantage.attack.msak",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    },
                    { 
                        key: "flags.midi-qol.grants.disadvantage.attack.rwak",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    },
                    { 
                        key: "flags.midi-qol.grants.disadvantage.attack.rsak",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    },
                    { 
                        key: "flags.midi-qol.disadvantage.attack.all",
                        mode: 0,
                        priority: 20,
                        value: "1"
                    }
                    
                ]
            }
        }
    ];

    return effects.find((effect) => roll >= effect.range[0] && roll <= effect.range[1]);
}

export {
    promptMadnessReduction,
    rollMadnessReduction,
    getShortTermMadnessEffect,
    getLongTermMadnessEffect
};
