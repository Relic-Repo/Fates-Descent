<script>
  import { getContext, onDestroy } from 'svelte';
  import { ApplicationShell } from '#runtime/svelte/component/core';
  import RequestLine from './RequestLine.svelte';
  import { FatesDescentRoll } from '../FatesDescentRoll.js';
  import { MODULE_ID } from '../settings.js';
  import { writable } from 'svelte/store';

  export let performRoll = FatesDescentRoll.performRoll;
  export let elementRoot;

  const { application } = getContext('#external');
  const stylesContent = { padding: '0' };

  const defaultSeverities = [
    { id: 'minimal', text: 'Minimal (DC 8)', dc: game.settings.get(MODULE_ID, 'minimalDC'), loss: game.settings.get(MODULE_ID, 'minimalLoss') },
    { id: 'moderate', text: 'Moderate (DC 12)', dc: game.settings.get(MODULE_ID, 'moderateDC'), loss: game.settings.get(MODULE_ID, 'moderateLoss') },
    { id: 'serious', text: 'Serious (DC 16)', dc: game.settings.get(MODULE_ID, 'seriousDC'), loss: game.settings.get(MODULE_ID, 'seriousLoss') },
    { id: 'extreme', text: 'Extreme (DC 20)', dc: game.settings.get(MODULE_ID, 'extremeDC'), loss: game.settings.get(MODULE_ID, 'extremeLoss') }
];

  const requestsStore = writable(game.settings.get(MODULE_ID, "globalSaveRequests").map(request => ({
    ...request,
    selectedSeverity: request.selectedSeverity || defaultSeverities[0]
  })));

  let previousRequests = JSON.stringify(game.settings.get(MODULE_ID, "globalSaveRequests"));

  let allRollType = 'save';

  function getButtonClass(type) {
    if (type === 'save') return 'button-save';
    if (type === 'test') return 'button-test';
    return 'button-all';
  }

  async function handleRoll({ detail: request }) {
    const { actorId, selectedSeverity, customDC, type, useCustomLoss, loss, config, useCustomDC } = request;
    const severityId = selectedSeverity?.id || 'minimal';
    const lossInput = useCustomLoss ? loss : {
    'minimal': game.settings.get(MODULE_ID, 'minimalLoss'),
    'moderate': game.settings.get(MODULE_ID, 'moderateLoss'),
    'serious': game.settings.get(MODULE_ID, 'seriousLoss'),
    'extreme': game.settings.get(MODULE_ID, 'extremeLoss')
    }[severityId];

    await performRoll(actorId, severityId, customDC, type, lossInput, config, useCustomDC, useCustomLoss);

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

  async function handleRollAll() {
    clearInterval(interval);
    const globalRequests = game.settings.get(MODULE_ID, "globalSaveRequests");
    await Promise.all(globalRequests.map(request => handleRoll({ detail: request })));
    interval = setInterval(updateRequests, 500);
  }

  async function handleCancel({ detail: request }) {
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
      await actor[method]("san", rollOptions);
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

  async function handleCancelAll() {
    clearInterval(interval);
    const globalRequests = game.settings.get(MODULE_ID, "globalSaveRequests");
    await Promise.all(globalRequests.map(request => handleCancel({ detail: request })));
    interval = setInterval(updateRequests, 500);
  }

  function updateRequests() {
    const globalRequests = JSON.stringify(game.settings.get(MODULE_ID, "globalSaveRequests").map(request => ({
      ...request,
      selectedSeverity: request.selectedSeverity || defaultSeverities[0]
    })));
    if (globalRequests !== previousRequests) {
      requestsStore.set(JSON.parse(globalRequests));
      previousRequests = globalRequests;
    }
  }

  let interval = setInterval(updateRequests, 500);

  onDestroy(() => {
    clearInterval(interval);
    game.settings.set(MODULE_ID, "globalSaveRequests", []);
  });

  function setAllSelectedSeverity(event) {
    const selectedSeverity = defaultSeverities.find(severity => severity.id === event.target.value);
    requestsStore.update(requests => {
      const updatedRequests = requests.map(request => ({ ...request, selectedSeverity }));
      game.settings.set(MODULE_ID, "globalSaveRequests", updatedRequests);
      return updatedRequests;
    });
  }

  function setAllCustomDC(event) {
    const useCustomDC = event.target.checked;
    requestsStore.update(requests => {
      const updatedRequests = requests.map(request => ({ ...request, useCustomDC }));
      game.settings.set(MODULE_ID, "globalSaveRequests", updatedRequests);
      return updatedRequests;
    });
  }

  function setAllCustomLoss(event) {
    const useCustomLoss = event.target.checked;
    requestsStore.update(requests => {
      const updatedRequests = requests.map(request => ({ ...request, useCustomLoss }));
      game.settings.set(MODULE_ID, "globalSaveRequests", updatedRequests);
      return updatedRequests;
    });
  }

  function updateRequestProperty({ detail }) {
    const { actorId, type, property, value } = detail;
    requestsStore.update(requests => {
      const updatedRequests = requests.map(request => {
        if (request.actorId === actorId && request.type === type) {
          return { ...request, [property]: value };
        }
        return request;
      });
      game.settings.set(MODULE_ID, "globalSaveRequests", updatedRequests);
      return updatedRequests;
    });
  }

  function toggleRollType({ detail }) {
    const { actorId, type } = detail;
    requestsStore.update(requests => {
      const updatedRequests = requests.map(request => {
        if (request.actorId === actorId) {
          return { ...request, type };
        }
        return request;
      });
      game.settings.set(MODULE_ID, "globalSaveRequests", updatedRequests);
      return updatedRequests;
    });
  }

  function setAllRollType() {
    const newType = allRollType === 'save' ? 'test' : 'save';
    allRollType = newType;
    requestsStore.update(requests => {
      const updatedRequests = requests.map(request => ({ ...request, type: newType }));
      game.settings.set(MODULE_ID, "globalSaveRequests", updatedRequests);
      return updatedRequests;
    });
  }
</script>

<svelte:options accessors={true}/>

<ApplicationShell bind:elementRoot {stylesContent}>
  <main>
    <h2><i class="fas fa-dice"></i> Sanity Roller <i class="fas fa-dice"></i></h2>
    <div class="color-key">
      <span class="color-key-item"><span class="color-pip save"></span>Save</span>
      <span class="color-key-item"><span class="color-pip test"></span>Check</span>
    </div>
    <div class="table">
      <div class="row header">
        <div class="cell">Character</div>
        <div class="cell">Severity</div>
        <div class="cell">Custom DC</div>
        <div class="cell">Custom Loss</div>
        <div class="cell">Confirm</div>
      </div>
      <!-- New row for Roll All and Cancel All buttons -->
      <div class="row">
        <div class="cell">
          <button type="button" on:click={setAllRollType} class={getButtonClass(allRollType)}>All</button>
        </div>
        <div class="cell">
          <select on:change={setAllSelectedSeverity}>
            {#each defaultSeverities as severity}
              <option value={severity.id}>{severity.text}</option>
            {/each}
          </select>
        </div>
        <div class="cell">
          <div class="custom-dc">
            <input type="checkbox" on:change={setAllCustomDC} />
            <input type="text" placeholder="DC" disabled />
          </div>
        </div>
        <div class="cell">
          <div class="custom-loss">
            <input type="checkbox" on:change={setAllCustomLoss} />
            <input type="text" placeholder="Loss" disabled />
          </div>
        </div>
        <div class="cell">
          <div class="buttons">
            <button type="button" on:click={handleRollAll}>Roll All</button>
            <button type="button" on:click={handleCancelAll}>Cancel All</button>
          </div>
        </div>
      </div>
      {#each $requestsStore as request (request.actorId)}
        <RequestLine
          {request}
          {defaultSeverities}
          {performRoll}
          on:updateRequestProperty={updateRequestProperty}
          on:toggleRollType={toggleRollType}
          on:handleRoll={handleRoll}
          on:handleCancel={handleCancel}
        />
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
    margin-bottom: 5px;
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
  input::placeholder {
    color: #f8f8f8;
  }
  .color-key {
    display: flex;
    justify-content: center;
    margin-bottom: 1px;
  }
  .color-key-item {
    display: flex;
    align-items: center;
    margin: 0 10px;
    font-size: 12px;
  }
  .color-pip {
    width: 30px;
    height: 10px;
    border-radius: 15%;
    display: inline-block;
    margin-right: 5px;
  }
  .color-pip.save {
    background-color: orange;
  }
  .color-pip.test {
    background-color: rgb(53, 116, 254);
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
  .button-save {
    background-color: orange;
  }
  .button-test {
    background-color: rgb(53, 116, 254);
  }
  .button-all {
    background-color: grey;
  }
</style>




