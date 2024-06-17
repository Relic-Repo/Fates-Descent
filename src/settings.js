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
        name: "Starting Madness Limit",
        hint: "Set the initial amount of Madness Points before modifiers.",
        scope: "world",
        config: true,
        type: Number,
        default: 8
    });

    game.settings.register(MODULE_ID, "globalSaveRequests", {
        scope: "world",
        config: false,
        type: Array,
        default: []
    });

    game.settings.register(MODULE_ID, "globalTestRequests", {
        scope: "world",
        config: false,
        type: Array,
        default: []
    });

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
            default: i === 1 ? 0 : i === 2 ? 10 : 20
        });
        
        if (i < 3) 
        {
            game.settings.register(MODULE_ID, `madnessRange${i}End`, {
                name: `Sanity Points Range ${i} End`,
                hint: `The ending sanity point for range ${i}.`,
                scope: "world",
                config: true,
                type: Number,
                default: i === 1 ? 9 : 19 
            });
        }
    
        game.settings.register(MODULE_ID, `madnessRange${i}Increment`, {
            name: `Madness Points ${i} Increment`,
            hint: `The amount of madness points to add for range ${i}.`,
            scope: "world",
            config: true,
            type: Number,
            default: i === 1 ? 2 : i === 2 ? 1 : 0
        });
    }
    
    game.settings.register(MODULE_ID, "shortTermInsanityReduction", {
        name: "Short-Term Madness Reduction",
        hint: "Set the number of madness points reduced when a short-term insanity effect is gained.",
        scope: "world",
        config: true,
        type: Number,
        default: 1
    });

    game.settings.register(MODULE_ID, "longTermInsanityReduction", {
        name: "Long-Term Madness Reduction",
        hint: "Set the number of madness points reduced when a long-term insanity effect is gained.",
        scope: "world",
        config: true,
        type: Number,
        default: 3
    });

    // New settings for severity levels
    const severities = ["minimal", "moderate", "serious", "extreme"];
    severities.forEach((severity) => 
    {
        game.settings.register(MODULE_ID, `${severity}DC`, {
            name: `${severity.charAt(0).toUpperCase() + severity.slice(1)} Severity DC`,
            hint: `Set the DC for ${severity} severity.`,
            scope: "world",
            config: true,
            type: Number,
            default: severity === "minimal" ? 8 : severity === "moderate" ? 12 : severity === "serious" ? 16 : 20
        });

        game.settings.register(MODULE_ID, `${severity}Loss`, {
            name: `${severity.charAt(0).toUpperCase() + severity.slice(1)} Severity Loss`,
            hint: `Set the loss amount for ${severity} severity.`,
            scope: "world",
            config: true,
            type: String,
            default: severity === "minimal" ? '1d4' : severity === "moderate" ? '1d6' : severity === "serious" ? '1d8' : '1d10'
        });
    });

    game.settings.register(MODULE_ID, "debug", {
        name: "Enable Debug Logging",
        hint: "Enable or disable debug logging for the Fate's Descent module.",
        scope: "world",
        config: true,
        type: Boolean,
        default: false
    });
}

Hooks.on('renderSettingsConfig', (app, html) => 
{
    const settings = [
        { key: "startingSanityPoints", header: "Starting Sanity & Madness" },
        { key: "enableMadnessRange1", header: "Sanity Point Range 1" },
        { key: "enableMadnessRange2", header: "Sanity Point Range 2" },
        { key: "enableMadnessRange3", header: "Sanity Point Range 3" },
        { key: "shortTermInsanityReduction", header: "Rolltable Madness Reductions" },
        { key: "minimalDC", header: "Severity Levels" },
        { key: "debug", header: "Debug Settings" },
    ];

    settings.forEach((setting) => 
{
        const element = html[0].querySelector(`[data-setting-id="fates-descent.${setting.key}"]`);
        if (element) 
{
            element.insertAdjacentHTML('beforeBegin', `<h3>${setting.header}</h3>`);
        }
    });
});
