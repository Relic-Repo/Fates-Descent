import { SvelteApplication } from '#runtime/svelte/application';
import SanityApp from './templates/SanityApp.svelte';
import { FatesDescentRoll } from './FatesDescentRoll.js';
import { MODULE_ID } from './settings.js';
import { debugLog } from './utils.js';

export default class SanityApplication extends SvelteApplication 
{
  constructor(actor, type, config, performRoll) 
  {
    debugLog("SanityApplication | constructor called with:", actor, type, config);
    const actorName = game.actors.get(actor.id)?.name;
    const globalRequests = game.settings.get(MODULE_ID, "globalSaveRequests");

    // Add the new request to the global array
    globalRequests.push({ actorId: actor.id, actorName, type, config });
    game.settings.set(MODULE_ID, "globalSaveRequests", globalRequests);

    super({
      title: 'Sanity Dialog',
      width: 630,
      height: 'auto',
      resizable: false,
      svelte: {
        class: SanityApp,
        target: document.body,
        props: {
          performRoll
        }
      },
      id: `sanity-dialog-${actor.id}`
    });
  }

  static get defaultOptions() 
  {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['sanity-dialog'],
      resizable: false,
      id: 'sanity-dialog'
    });
  }

  static showSanityDialog(actorId, type, config) 
  {
    const globalRequests = game.settings.get(MODULE_ID, "globalSaveRequests");
    console.log('showSanityDialog recieve', globalRequests);

    if (globalRequests.length === 0) 
    {
      const actor = game.actors.get(actorId);
      console.log('Fates Descent | actorId', actorId);
      if (!actor) { return; }

      const sanityApp = new SanityApplication(actor, type, config, FatesDescentRoll.performRoll);
      sanityApp.render(true);
    } 
    else 
    {
      // Add the new request to the existing global array
      const actorName = game.actors.get(actorId)?.name;
      globalRequests.push({ actorId, actorName, type, config });
      game.settings.set(MODULE_ID, "globalSaveRequests", globalRequests);
    }
  }
}
