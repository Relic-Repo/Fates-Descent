// FatesDescentRoll.js for "Fate's Descent"

import { debugLog } from "./utils.js";

export class FatesDescentRoll {
    /**
     * Constructs an instance of FatesDescentRoll and initializes socket and hooks.
     */
    constructor() {
        this.styling = `
            color:#D01B00;
            background-color:#A3A6B4;
            font-size:9pt;
            font-weight:bold;
            padding:1pt;
        `;
        this.socket = socketlib.registerModule("fates-descent");
        debugLog("FatesDescentRoll | Socket registered", this.styling);
        this.registerHooks();
        this.socket.register("showSanityDialog", this.showSanityDialog.bind(this));
        debugLog("FatesDescentRoll | Hooks registered", this.styling);
    }

    /**
     * Registers hooks for handling ability saves and tests.
     */
    registerHooks() {
        Hooks.on("dnd5e.preRollAbilitySave", (actor, config, abilityId) => this.handleAbilityRoll(actor, config, abilityId, 'save'));
        Hooks.on("dnd5e.preRollAbilityTest", (actor, config, abilityId) => this.handleAbilityRoll(actor, config, abilityId, 'test'));
    }

    /**
     * Handles ability roll hooks to trigger sanity checks and saves.
     *
     * @param {Actor} actor - The actor performing the roll.
     * @param {Object} config - Configuration options for the roll.
     * @param {string} abilityId - The ID of the ability being rolled.
     * @param {string} type - The type of roll ('save' or 'test').
     * @returns {boolean} False to block the original roll, true otherwise.
     */
    handleAbilityRoll(actor, config, abilityId, type) {
        debugLog(`Pre-roll ability ${type} hook triggered.`, this.styling);

        if (actor.type !== "character" || !actor.prototypeToken.actorLink) return true;

        debugLog("Actor:", this.styling, actor);
        debugLog("Config:", this.styling, config);
        debugLog("Ability ID:", this.styling, abilityId);

        if (abilityId !== "san" || config.fromDialog) {
            return true;
        }

        if (!game.user.isGM) {
            debugLog("Sanity check/save triggered by non-GM user, passing to GM.", this.styling);
            this.socket.executeAsGM("showSanityDialog", actor.id, type, config);
            return false;
        }

        debugLog(`Displaying sanity ${type} dialog for ${actor.name}`, this.styling);
        this.showSanityDialog(actor.id, type, config);
        return false;
    }

    /**
     * Displays a dialog for the user to perform a sanity check or save.
     *
     * @param {string} actorId - The ID of the actor.
     * @param {string} type - The type of roll ('save' or 'test').
     * @param {Object} config - Configuration options for the roll.
     */
    async showSanityDialog(actorId, type, config) {
        const actor = game.actors.get(actorId);
        if (!actor) return;

        const dialogTitle = type === 'save' ? 'Sanity Save' : 'Sanity Check';
        const dieRolls = { 'minimal': '1d4', 'moderate': '1d6', 'serious': '1d8', 'extreme': '1d10' };
        let dialogContent = `
            <style>
                .custom-dialog .dialog-content { background: #222; color: #f8f8f8; padding: 5px; border-radius: 8px; }
                .custom-dialog .dialog-buttons, .custom-dialog input { background: #333; padding: 5px; border-top: 2px solid #444; }
                .custom-dialog .dialog-button, .custom-dialog .dialog-input { background: #f8f8f8; color: #222; border: none; padding: 5px 5px; border-radius: 4px; font-weight: bold; font-size: 16px; }
                .custom-dialog .dialog-button:hover { background: #555; }
                .custom-dialog label { display: block; margin: 10px auto; font-size: 1.4em; width: 50%; text-align: left; }
                .custom-dialog input[type='text'], .custom-dialog input[type='checkbox'], .custom-dialog input[type='radio'] { margin-right: 10px; }
                .custom-dialog input[type='text'] { width: 25%; }
            </style>
            <div class="dialog-content">
                <h2 style="text-align: center; margin-bottom: 10px;"><i class="fas fa-dice"></i>&nbsp;&nbsp;${dialogTitle}&nbsp;&nbsp;<i class="fas fa-dice"></i></h2>
                <label><input type="radio" name="severity" value="minimal"> Minimal (DC 8)</label>
                <label><input type="radio" name="severity" value="moderate"> Moderate (DC 12)</label>
                <label><input type="radio" name="severity" value="serious"> Serious (DC 16)</label>
                <label><input type="radio" name="severity" value="extreme"> Extreme (DC 20)</label>
                <label>&nbsp;&nbsp;Custom DC: <input type="checkbox" name="useCustomDC" class="dialog-input"/><input type="text" name="customDC" class="dialog-input" placeholder="DC" value="0"/></label>
                <label>&nbsp;&nbsp;Loss: <input type="checkbox" name="useCustomLoss" class="dialog-input"/><input type="text" name="loss" class="dialog-input" placeholder="Loss" value="0"/></label>
            </div>`;

        new Dialog({
            title: dialogTitle,
            content: dialogContent,
            buttons: {
                roll: {
                    label: `<i class="fas fa-dice"></i> Roll <i class="fas fa-dice"></i>`,
                    callback: async (html) => {
                        const severity = html.find('input[name="severity"]:checked').val();
                        const useCustomDC = html.find('input[name="useCustomDC"]').is(':checked');
                        const useCustomLoss = html.find('input[name="useCustomLoss"]').is(':checked');
                        const customDC = html.find('input[name="customDC"]').val();
                        const lossInput = html.find('input[name="loss"]').val() || dieRolls[severity];
                        const rollResult = await new Roll(lossInput).evaluate({ async: true });
                        await this.performRoll(actor, severity, customDC, type, rollResult.total, config, useCustomDC, useCustomLoss);
                    },
                    class: "dialog-button"
                },
                cancel: {
                    label: "Cancel",
                    class: "dialog-button"
                }
            },
            default: "cancel",
            render: html => html.addClass("custom-dialog")
        }).render(true);
    }

    /**
     * Performs the sanity roll and updates actor's sanity points accordingly.
     *
     * @param {Actor} actor - The actor performing the roll.
     * @param {string} severity - The severity level of the sanity check.
     * @param {number} customDC - Custom difficulty class if used.
     * @param {string} type - The type of roll ('save' or 'test').
     * @param {number} loss - The sanity points lost.
     * @param {Object} config - Configuration options for the roll.
     * @param {boolean} useCustomDC - Whether a custom difficulty class is used.
     * @param {boolean} useCustomLoss - Whether a custom loss value is used.
     */
    async performRoll(actor, severity, customDC, type, loss, config, useCustomDC, useCustomLoss) {
        let threshold = useCustomDC ? customDC : { minimal: 8, moderate: 12, serious: 16, extreme: 20 }[severity];
        const method = type === 'save' ? 'rollAbilitySave' : 'rollAbilityTest';
        const rollOptions = {
            chatMessage: true,
            fastForward: true,
            fromDialog: true,
            advantage: config.advantage,
            disadvantage: config.disadvantage
        };

        const roll = await actor[method]("san", rollOptions);
        const resultText = roll.total >= threshold ? "maintained" : "lost";
        const textColor = roll.total >= threshold ? "green" : "red";
        let messageContent = `
            <div style="background-color: #222; padding: 10px; border-radius: 4px; border: 1px solid #444; margin-bottom: 5px; color: ${textColor}; font-weight: bold;">
                <strong>${severity.charAt(0).toUpperCase() + severity.slice(1)} Severity:</strong><br>
                Result: ${roll.total} (Threshold: ${threshold}) - Sanity ${resultText}
            </div>
        `;

        if (roll.total < threshold) {
            let currentSanity = actor.getFlag(MODULE_ID, 'sanityPoints').current - loss;
            actor.setFlag(MODULE_ID, 'sanityPoints', { current: Math.max(currentSanity, 0) });
            let madnessIncrement = 0;
            if (currentSanity <= 9) {
                madnessIncrement = 2;
            } else if (currentSanity <= 19) {
                madnessIncrement = 1;
            }

            if (madnessIncrement > 0) {
                let currentMadness = actor.getFlag(MODULE_ID, 'madness').current + madnessIncrement;
                actor.setFlag(MODULE_ID, 'madness', { current: currentMadness });
            }
            messageContent = `
                <div style="background-color: #222; padding: 10px; border-radius: 4px; border: 1px solid #444; margin-bottom: 5px; color: ${textColor}; font-weight: bold;">
                    <strong>${severity.charAt(0).toUpperCase() + severity.slice(1)} Severity:</strong><br>
                    Result: ${roll.total} (Threshold: ${threshold}) - Sanity ${resultText} (Loss: ${loss})
                </div>
            `;
        }

        ChatMessage.create({
            content: messageContent
        });
    }
}
