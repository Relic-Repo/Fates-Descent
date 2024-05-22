// utils.js for "Fate's Descent"

import { MODULE_ID } from "./settings.js";

/**
 * Logs debug messages to the console if debugging is enabled in the module settings.
 *
 * @param {string} message - The debug message to log.
 * @param {string} styling - The CSS styling to apply to the message.
 * @param {any} [additionalData=null] - Optional additional data to log.
 */
export function debugLog(message, styling, additionalData = null) {
    if (game.settings.get(MODULE_ID, 'debug')) {
        console.log(`%c${message}`, styling);
        if (additionalData !== null) {
            console.log(additionalData);
        }
    }
}
