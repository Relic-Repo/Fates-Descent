import { debugLog } from "./utils.js";
import { MODULE_ID } from "./settings.js";

export class SanityMadnessHandler {
    /**
     * Constructs an instance of SanityMadnessHandler, initializes styling, and sets up hooks.
     */
    constructor() {
        this.styling = `
            color:#D01B00;
            background-color:#A3A6B4;
            font-size:9pt;
            font-weight:bold;
            padding:1pt;
        `;
        this.moduleId = MODULE_ID;

        Hooks.on("updateActor", (actor, updateData) => {
            if (actor.type === "character" && actor.prototypeToken.actorLink && this.isSanityOrMadnessUpdate(updateData)) {
                this.updateBarsForActor(actor);
            }
        });
    }

    /**
     * Checks if the update data includes sanity or madness updates.
     *
     * @param {Object} updateData - The data being updated for the actor.
     * @returns {boolean} True if the update data includes sanity or madness updates, false otherwise.
     */
    isSanityOrMadnessUpdate(updateData) {
        return updateData.flags?.[this.moduleId]?.sanityPoints || updateData.flags?.[this.moduleId]?.madness;
    }

    /**
     * Updates the sanity and madness bars for the actor if the corresponding sheet is open.
     *
     * @param {Actor} actor - The actor whose bars need to be updated.
     */
    updateBarsForActor(actor) {
        const appId = `ActorSheet${actor.sheet?.constructor?.name}-${actor.id}`;
        const app = Object.values(ui.windows).find(app => app.options.id === appId);
        if (app) {
            app.render(true);
        }
    }

    /**
     * Updates sanity and madness values for the given actor.
     *
     * @param {Actor} actor - The actor whose sanity and madness values need to be updated.
     */
    updateSanityAndMadness(actor) {
        if (actor.type !== "character" || !actor.prototypeToken.actorLink) return;
        debugLog(`Updating sanity and madness for linked actor: ${actor.name}`, this.styling);

        if (!actor.system?.abilities?.san) {
            debugLog("San ability not defined for this linked actor.", this.styling);
            return;
        }
        const sanMod = actor.system.abilities.san.mod || 0;
        const startingSanityPoints = game.settings.get(this.moduleId, 'startingSanityPoints');
        const startingMadnessPoints = game.settings.get(this.moduleId, 'startingMadnessPoints');
        const sanityPointsMax = startingSanityPoints + sanMod;
        const madnessMax = startingMadnessPoints + sanMod;
        const existingSanity = actor.getFlag(this.moduleId, 'sanityPoints.current') || sanityPointsMax;
        const existingMadness = actor.getFlag(this.moduleId, 'madness.current') || 0;

        actor.setFlag(this.moduleId, 'sanityPoints', { current: Math.max(existingSanity, 0), max: sanityPointsMax });
        actor.setFlag(this.moduleId, 'madness', { current: Math.max(existingMadness, 0), max: madnessMax });
    }

    /**
     * Adds sanity and madness bars to the dnd5e2 character sheet.
     *
     * @param {Actor} actor - The actor whose sheet is being rendered.
     * @param {jQuery} html - The jQuery HTML object of the sheet.
     */
    addSanityAndMadnessBarsDnd5e2(actor, html) {
        const { sanityPointsHtml, madnessHtml } = this.generateMeterHTMLDnd5e2(actor);
        html.find('.meter-group').last().after(sanityPointsHtml + madnessHtml);
    }

    /**
     * Adds sanity and madness bars to the dnd5e character sheet.
     *
     * @param {Actor} actor - The actor whose sheet is being rendered.
     * @param {jQuery} html - The jQuery HTML object of the sheet.
     */
    addSanityAndMadnessBarsDnd5e(actor, html) {
        const { sanityPointsHtml, madnessHtml } = this.generateMeterHTMLDnd5e(actor);
        html.find('.counters').after(sanityPointsHtml + madnessHtml);
    }

    /**
     * Adds sanity and madness bars to the Tidy5e character sheet.
     *
     * @param {Actor} actor - The actor whose sheet is being rendered.
     * @param {jQuery} html - The jQuery HTML object of the sheet.
     */
    addSanityAndMadnessBarsTidy5e(actor, html) {
        const { sanityPointsHtml, madnessHtml } = this.generateMeterHTMLTidy5e(actor);
        html.find('.main-panel .flex-column.small-gap').append(sanityPointsHtml + madnessHtml);
    }

    /**
     * Generates the HTML for sanity and madness meters for the dnd5e2 character sheet.
     *
     * @param {Actor} actor - The actor whose meters are being generated.
     * @returns {Object} An object containing the HTML for the sanity and madness meters.
     */
    generateMeterHTMLDnd5e2(actor) {
        const sanityPointsData = actor.getFlag(this.moduleId, 'sanityPoints') || { current: 28, max: 28 };
        const madnessData = actor.getFlag(this.moduleId, 'madness') || { current: 0, max: 8 };

        const sanityPointsHtml = `
            <div class="meter-group">
                <div class="label roboto-condensed-upper">Sanity Points</div>
                <div class="meter sanity-points progress" role="meter" aria-valuemin="0"
                     aria-valuenow="${sanityPointsData.current}" aria-valuemax="${sanityPointsData.max}"
                     style="--bar-percentage: ${100 * sanityPointsData.current / sanityPointsData.max}%; height: 30px; background: linear-gradient(to right, indigo ${100 * sanityPointsData.current / sanityPointsData.max}%, black 0%);">
                    <div class="label">
                        <span class="value">${sanityPointsData.current}</span> / <span class="max">${sanityPointsData.max}</span>
                    </div>
                </div>
            </div>`;

        const madnessHtml = `
            <div class="meter-group">
                <div class="label roboto-condensed-upper">Madness</div>
                <div class="meter madness progress" role="meter" aria-valuemin="0"
                     aria-valuenow="${madnessData.current}" aria-valuemax="${madnessData.max}"
                     style="--bar-percentage: ${100 * madnessData.current / madnessData.max}%; height: 30px; background: linear-gradient(to right, #808000 ${100 * madnessData.current / madnessData.max}%, black 0%);">
                    <div class="label">
                        <span class="value">${madnessData.current}</span> / <span class="max">${madnessData.max}</span>
                    </div>
                </div>
            </div>`;

        return { sanityPointsHtml, madnessHtml };
    }

    /**
     * Generates the HTML for sanity and madness meters for the dnd5e character sheet.
     *
     * @param {Actor} actor - The actor whose meters are being generated.
     * @returns {Object} An object containing the HTML for the sanity and madness meters.
     */
    generateMeterHTMLDnd5e(actor) {
        const sanityPointsData = actor.getFlag(this.moduleId, 'sanityPoints') || { current: 28, max: 28 };
        const madnessData = actor.getFlag(this.moduleId, 'madness') || { current: 0, max: 8 };

        const sanityPointsHtml = `
            <div class="counter flexrow">
                <h4>Sanity Points</h4>
                <div class="meter sanity-points progress" role="meter" aria-valuemin="0"
                     aria-valuenow="${sanityPointsData.current}" aria-valuemax="${sanityPointsData.max}"
                     style="--bar-percentage: ${100 * sanityPointsData.current / sanityPointsData.max}%; height: 30px; background: linear-gradient(to right, indigo ${100 * sanityPointsData.current / sanityPointsData.max}%, black 0%);">
                    <div class="label" style="font-size: 14px; color: #f8f8f8;">
                        <span class="value">${sanityPointsData.current}</span> / <span class="max">${sanityPointsData.max}</span>
                    </div>
                </div>
            </div>`;

        const madnessHtml = `
            <div class="counter flexrow">
                <h4>Madness</h4>
                <div class="meter madness progress" role="meter" aria-valuemin="0"
                     aria-valuenow="${madnessData.current}" aria-valuemax="${madnessData.max}"
                     style="--bar-percentage: ${100 * madnessData.current / madnessData.max}%; height: 30px; background: linear-gradient(to right, #808000 ${100 * madnessData.current / madnessData.max}%, black 0%);">
                    <div class="label" style="font-size: 14px; color: #f8f8f8;">
                        <span class="value">${madnessData.current}</span> / <span class="max">${madnessData.max}</span>
                    </div>
                </div>
            </div>`;

        return { sanityPointsHtml, madnessHtml };
    }

    /**
     * Generates the HTML for sanity and madness meters for the Tidy5e character sheet.
     *
     * @param {Actor} actor - The actor whose meters are being generated.
     * @returns {Object} An object containing the HTML for the sanity and madness meters.
     */
    generateMeterHTMLTidy5e(actor) {
        const sanityPointsData = actor.getFlag(this.moduleId, 'sanityPoints') || { current: 28, max: 28 };
        const madnessData = actor.getFlag(this.moduleId, 'madness') || { current: 0, max: 8 };

        const sanityPointsHtml = `
            <div class="meter-group" style="margin-bottom: 5px;">
                <h4 class="resource-name svelte-1bmdrvx">Sanity Points</h4>
                <div class="resource-value multiple svelte-1bmdrvx">
                    <span class="value" style="font-size: 14px">${sanityPointsData.current}</span>
                    <span class="sep svelte-1bmdrvx">/</span>
                    <span class="max" style="font-size: 14px">${sanityPointsData.max}</span>
                </div>
                <div class="meter sanity-points progress svelte-1bmdrvx" role="meter" aria-valuemin="0"
                     aria-valuenow="${sanityPointsData.current}" aria-valuemax="${sanityPointsData.max}"
                     style="--bar-percentage: ${100 * sanityPointsData.current / sanityPointsData.max}%; height: 30px; background: linear-gradient(to right, indigo ${100 * sanityPointsData.current / sanityPointsData.max}%, black 0%);">
                </div>
            </div>`;

        const madnessHtml = `
            <div class="meter-group" style="margin-bottom: 5px;">
                <h4 class="resource-name svelte-1bmdrvx">Madness</h4>
                <div class="resource-value multiple svelte-1bmdrvx">
                    <span class="value" style="font-size: 14px">${madnessData.current}</span>
                    <span class="sep svelte-1bmdrvx">/</span>
                    <span class="max" style="font-size: 14px">${madnessData.max}</span>
                </div>
                <div class="meter madness progress svelte-1bmdrvx" role="meter" aria-valuemin="0"
                     aria-valuenow="${madnessData.current}" aria-valuemax="${madnessData.max}"
                     style="--bar-percentage: ${100 * madnessData.current / madnessData.max}%; height: 30px; background: linear-gradient(to right, #808000 ${100 * madnessData.current / madnessData.max}%, black 0%);">
                </div>
            </div>`;

        return { sanityPointsHtml, madnessHtml };
    }
}
