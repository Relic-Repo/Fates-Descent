<script>
  import { getContext, onDestroy } from 'svelte';
  import { writable } from 'svelte/store';
  import { ApplicationShell } from '#runtime/svelte/component/core';
  import { FatesDescentRoll } from '../FatesDescentRoll.js';
  import { MODULE_ID } from '../settings.js';

  export let performRoll = FatesDescentRoll.performRoll;
  export let elementRoot;

  const { application } = getContext('#external');
  const stylesContent = { padding: '0' };

  const requestsStore = writable(game.settings.get(MODULE_ID, "globalSaveRequests"));

  function handleRoll(request) {
    const { actorId, selectedSeverity, customDC, type, useCustomLoss, loss, config, useCustomDC } = request;
    const lossInput = useCustomLoss ? loss : { 'minimal': '1d4', 'moderate': '1d6', 'serious': '1d8', 'extreme': '1d10' }[selectedSeverity.id];
    new Roll(lossInput).evaluate({ async: true }).then(rollResult => {
      performRoll(actorId, selectedSeverity.id, customDC, type, rollResult, config, useCustomDC, useCustomLoss);

      let globalRequests = game.settings.get(MODULE_ID, "globalSaveRequests");
      const index = globalRequests.findIndex(r => r.actorId === actorId && r.type === type);
      if (index > -1) {
        globalRequests.splice(index, 1);
        game.settings.set(MODULE_ID, "globalSaveRequests", globalRequests);
        requestsStore.set(globalRequests);
      }

      if (globalRequests.length === 0) {
        application.close();
      }
    });
  }

  function handleCancel(request) {
    const { actorId, type, config } = request;
    const method = type === 'save' ? 'rollAbilitySave' : 'rollAbilityTest';
    const rollOptions = {
      chatMessage: true,
      fastForward: true,
      fromDialog: true,
      advantage: config?.advantage || false,
      disadvantage: config?.disadvantage || false
    };
    const actor = game.actors.get(actorId);
    if (actor) {
      actor[method]("san", rollOptions);
    }

    let globalRequests = game.settings.get(MODULE_ID, "globalSaveRequests");
    const index = globalRequests.findIndex(r => r.actorId === actorId && r.type === type);
    if (index > -1) {
      globalRequests.splice(index, 1);
      game.settings.set(MODULE_ID, "globalSaveRequests", globalRequests);
      requestsStore.set(globalRequests);
    }

    if (globalRequests.length === 0) {
      application.close();
    }
  }

  function updateRequests() {
    const globalRequests = game.settings.get(MODULE_ID, "globalSaveRequests");
    requestsStore.set(globalRequests);
  }

  const interval = setInterval(updateRequests, 500);

  onDestroy(() => {
    clearInterval(interval);
    game.settings.set(MODULE_ID, "globalSaveRequests", []);
  });

  const severities = [
    { id: 'minimal', text: 'Minimal (DC 8)' },
    { id: 'moderate', text: 'Moderate (DC 12)' },
    { id: 'serious', text: 'Serious (DC 16)' },
    { id: 'extreme', text: 'Extreme (DC 20)' }
  ];
</script>

<svelte:options accessors={true}/>

<ApplicationShell bind:elementRoot {stylesContent}>
  <main>
    <h2><i class="fas fa-dice"></i> Sanity <i class="fas fa-dice"></i></h2>
    <div class="table">
      <div class="row header">
        <div class="cell">Character</div>
        <div class="cell">Severity</div>
        <div class="cell">Custom DC</div>
        <div class="cell">Custom Loss</div>
        <div class="cell">Confirm</div>
      </div>
      {#each $requestsStore as request (request.actorId)}
        <div class="row">
          <div class="cell">{request.actorName}</div>
          <div class="cell">
            <select bind:value={request.selectedSeverity}>
              {#each severities as severity}
                <option value={severity}>{severity.text}</option>
              {/each}
            </select>
          </div>
          <div class="cell">
            <div class="custom-dc">
              <input type="checkbox" bind:checked={request.useCustomDC} />
              <input type="text" bind:value={request.customDC} placeholder="DC" disabled={!request.useCustomDC} />
            </div>
          </div>
          <div class="cell">
            <div class="custom-loss">
              <input type="checkbox" bind:checked={request.useCustomLoss} />
              <input type="text" bind:value={request.loss} placeholder="Loss" disabled={!request.useCustomLoss} />
            </div>
          </div>
          <div class="cell">
            <div class="buttons">
              <button type="button" on:click={() => handleRoll(request)}>Roll</button>
              <button type="button" on:click={() => handleCancel(request)}>Cancel</button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </main>
</ApplicationShell>


<style>
  main {
    background: #222;
    color: #f8f8f8;
    padding: 5px;
    border-radius: 0px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  h2 {
    margin-bottom: 15px;
  }
  .table {
    width: 100%;
    display: table;
    border-collapse: collapse;
  }
  .row {
    display: table-row;
    justify-content: center;
  }
  .cell {
    display: table-cell;
    padding: 7px;
    border: 0px solid #444;
    text-align: center;
  }
  .header .cell {
    font-weight: bold;
    background: #333;
  }
  select {
    margin-left: 10px;
    background: #333; 
    color: #f8f8f8; 
    border: 1px solid #444;
    padding: 2px;
    border-radius: 4px;
    font-size: 12px;
    text-align: center;
  }
  input[type='checkbox'] {
    margin-left: 10px;
    background: #333; 
    color: #f8f8f8; 
    border: 1px solid #444;
    padding: 2px;
    border-radius: 4px;
    font-size: 12px;
    text-align: center;
  }
  input[type='text'] {
    width: 50px;
    margin-left: 10px;
    background: #333; 
    color: #f8f8f8; 
    border: 1px solid #444;
    padding: 2px;
    border-radius: 4px;
    font-size: 12px;
    text-align: center;
  }
  button {
    background: #f8f8f8;
    color: #222;
    border: none;
    padding: 1px 5px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 12px;
    cursor: pointer;
  }
  button:hover {
    background: #95f853;
  }
  .custom-dc, .custom-loss {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .buttons {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
  }
</style>
