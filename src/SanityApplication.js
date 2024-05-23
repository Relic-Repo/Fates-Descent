import { SvelteApplication } from '#runtime/svelte/application';
import SanityApp from './templates/SanityApp.svelte';

export default class SanityApplication extends SvelteApplication {
  constructor(actor, type, config, performRoll) {
    super({
      title: 'Sanity Dialog',
      width: 280,
      height: 'auto',
      svelte: {
        class: SanityApp,
        target: document.body,
        props: {
          actorId: actor.id,
          type,
          config,
          performRoll
        }
      }
    });
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['sanity-dialog'],
      resizable: true,
      id: 'sanity-dialog'
    });
  }
}
