// FatesDescentRoll.js for "Fate's Descent"

import { MODULE_ID } from "./settings.js";
import { debugLog } from "./utils.js";
import SanityApplication from './SanityApplication.js';

export class FatesDescentRoll 
{
  /**
   * Constructs an instance of FatesDescentRoll and initializes socket and hooks.
   */
  constructor() 
  {
    this.styling = `
      color:#D01B00;
      background-color:#A3A6B4;
      font-size:9pt;
      font-weight:bold;
      padding:1pt;
    `;
    // eslint-disable-next-line no-undef
    this.socket = socketlib.registerModule("fates-descent");
    debugLog("FatesDescentRoll | Socket registered", this.styling);
    this.registerHooks();
    this.socket.register("showSanityDialog", this.showSanityDialog.bind(this));
    debugLog("FatesDescentRoll | Hooks registered", this.styling);
  }

  /**
   * Registers hooks for handling ability saves and tests.
   */
  registerHooks() 
  {
    Hooks.on("dnd5e.preRollAbilitySave", (actor, config, abilityId) => this.handleAbilityRoll(actor, config, abilityId, 'save'));
    Hooks.on("dnd5e.preRollAbilityTest", (actor, config, abilityId) => this.handleAbilityRoll(actor, config, abilityId, 'test'));
  }

  /**
   * Handles ability roll hooks to trigger sanity checks and saves.
   *
   * @param {Actor} actor - The actor performing the roll.
   *
   * @param {object} config - Configuration options for the roll.
   *
   * @param {string} abilityId - The ID of the ability being rolled.
   *
   * @param {string} type - The type of roll ('save' or 'test').
   *
   * @returns {boolean} False to block the original roll, true otherwise.
   */
  handleAbilityRoll(actor, config, abilityId, type) 
  {
    debugLog(`Pre-roll ability ${type} hook triggered.`, this.styling);

    if (actor.type !== "character" || !actor.prototypeToken.actorLink) { return true; }

    debugLog("Actor:", this.styling, actor);
    debugLog("Config:", this.styling, config);
    debugLog("Ability ID:", this.styling, abilityId);

    if (abilityId !== "san" || config.fromDialog) 
    {
      return true;
    }

    if (!game.user.isGM) 
    {
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
   *
   * @param {string} type - The type of roll ('save' or 'test').
   *
   * @param {object} config - Configuration options for the roll.
   */
  async showSanityDialog(actorId, type, config) 
  {
    SanityApplication.showSanityDialog(actorId, type, config);
  }

  /**
   * Performs the sanity roll and updates actor's sanity points accordingly.
   *
   * @param {string} actorId - The ID of the actor.
   *
   * @param {string} severity - The severity level of the sanity check.
   *
   * @param {number} customDC - Custom difficulty class if used.
   *
   * @param {string} type - The type of roll ('save' or 'test').
   *
   * @param {number} loss - The sanity points lost.
   *
   * @param {object} config - Configuration options for the roll.
   *
   * @param {boolean} useCustomDC - Whether a custom difficulty class is used.
   */
  static async performRoll(actorId, severity, customDC, type, loss, config, useCustomDC) 
  {
    const actor = game.actors.get(actorId);
    if (!actor) { return; }
    const totalLoss = loss._total;
    console.log(`Return from SanityApp loss: `, totalLoss);

    const threshold = useCustomDC ? customDC : { minimal: 8, moderate: 12, serious: 16, extreme: 20 }[severity];
    const method = type === 'save' ? 'rollAbilitySave' : 'rollAbilityTest';
    const rollOptions = {
      chatMessage: true,
      fastForward: true,
      fromDialog: true,
      advantage: config?.advantage || false,
      disadvantage: config?.disadvantage || false
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

    if (roll.total < threshold) 
    {
      const currentSanity = actor.getFlag(MODULE_ID, 'sanityPoints').current - totalLoss;
      actor.setFlag(MODULE_ID, 'sanityPoints', { current: Math.max(currentSanity, 0) });
      let madnessIncrement = 0;
      if (currentSanity <= 9) 
      {
        madnessIncrement = 2;
      }
      else if (currentSanity <= 19) 
      {
        madnessIncrement = 1;
      }

      if (madnessIncrement > 0) 
      {
        const currentMadness = actor.getFlag(MODULE_ID, 'madness').current + madnessIncrement;
        actor.setFlag(MODULE_ID, 'madness', { current: currentMadness });
      }
      messageContent = `
        <div style="background-color: #222; padding: 10px; border-radius: 4px; border: 1px solid #444; margin-bottom: 5px; color: ${textColor}; font-weight: bold;">
          <strong>${severity.charAt(0).toUpperCase() + severity.slice(1)} Severity:</strong><br>
          Result: ${roll.total} (Threshold: ${threshold}) - Sanity ${resultText} (Loss: ${totalLoss})
        </div>
      `;
    }

    ChatMessage.create({
      content: messageContent
    });
  }
}
