// settings.js for "Fate's Descent"

export const MODULE_ID = "fates-descent";

/**
 * Registers the settings for the Fate's Descent module.
 */
export function FDregisterSettings() 
    { 
        game.settings.register(MODULE_ID, "enableModule", {
        name: "Enable Fate's Descent",
        hint: "Enable or disable the Fate's Descent module.",
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    });

    game.settings.register(MODULE_ID, "startingSanityPoints", 
    {
        name: "Starting Sanity Points",
        hint: "Set the initial amount of Sanity Points before modifiers.",
        scope: "world",
        config: true,
        type: Number,
        default: 28
    });

    game.settings.register(MODULE_ID, "startingMadnessPoints", 
    {
        name: "Starting Madness Points",
        hint: "Set the initial amount of Madness Points before modifiers.",
        scope: "world",
        config: true,
        type: Number,
        default: 8
    });

    game.settings.register(MODULE_ID, "debug", 
    {
        name: "Enable Debug Logging",
        hint: "Enable or disable debug logging for the Fate's Descent module.",
        scope: "world",
        config: true,
        type: Boolean,
        default: false
    });
}
