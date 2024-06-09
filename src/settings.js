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

    game.settings.register(MODULE_ID, "startingSanityPoints", {
        name: "Starting Sanity Points",
        hint: "Set the initial amount of Sanity Points before modifiers.",
        scope: "world",
        config: true,
        type: Number,
        default: 28
    });

    game.settings.register(MODULE_ID, "startingMadnessPoints", {
        name: "Starting Madness Points",
        hint: "Set the initial amount of Madness Points before modifiers.",
        scope: "world",
        config: true,
        type: Number,
        default: 8
    });

    game.settings.register(MODULE_ID, "debug", {
        name: "Enable Debug Logging",
        hint: "Enable or disable debug logging for the Fate's Descent module.",
        scope: "world",
        config: true,
        type: Boolean,
        default: false
    });

    // Hidden setting to store global save requests
    game.settings.register(MODULE_ID, "globalSaveRequests", {
        scope: "world",
        config: false,
        type: Array,
        default: []
    });

    // Hidden setting to store global test requests
    game.settings.register(MODULE_ID, "globalTestRequests", {
        scope: "world",
        config: false,
        type: Array,
        default: []
    });

    // New settings for madness point additions
    for (let i = 1; i <= 3; i++) 
{
        game.settings.register(MODULE_ID, `enableMadnessRange${i}`, {
            name: `Enable Sanity Points Range ${i}`,
            hint: `Enable or disable the addition of madness points for range ${i}.`,
            scope: "world",
            config: true,
            type: Boolean,
            default: true
        });

        game.settings.register(MODULE_ID, `madnessRange${i}Start`, {
            name: `Sanity Points Range ${i} Start`,
            hint: `The starting sanity point for range ${i}.`,
            scope: "world",
            config: true,
            type: Number,
            default: i === 1 ? 0 : i === 2 ? 10 : 20 // Default values based on current logic
        });

        // Only register the end range for the first two ranges
        if (i < 3) 
{
            game.settings.register(MODULE_ID, `madnessRange${i}End`, {
                name: `Sanity Points Range ${i} End`,
                hint: `The ending sanity point for range ${i}.`,
                scope: "world",
                config: true,
                type: Number,
                default: i === 1 ? 9 : 19 // Default values based on current logic
            });
        }

        game.settings.register(MODULE_ID, `madnessRange${i}Increment`, {
            name: `Madness Points ${i} Increment`,
            hint: `The amount of madness points to add for range ${i}.`,
            scope: "world",
            config: true,
            type: Number,
            default: i === 1 ? 3 : i === 2 ? 2 : 1 // Default values based on current logic
        });
    }
}
