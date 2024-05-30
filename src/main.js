// main.js for "Fate's Descent"

import { FDregisterSettings } from "./settings.js";
import { FDregisterHooks } from "./hooks.js";

const styling = `
    color:#D01B00;
    background-color:#A3A6B4;
    font-size:9pt;
    font-weight:bold;
    padding:1pt;
`;

console.log("%cFate's Descent | Initializing module.", styling);

/**
 * Initializes the module by registering settings and hooks.
 */
Hooks.on("init", () => 
{
    console.log("%cFate's Descent | Registering settings.", styling);
    FDregisterSettings();
    console.log("%cFate's Descent | Settings registered.", styling);
    FDregisterHooks();
    console.log("%cFate's Descent | Hooks registered.", styling);
  
});
