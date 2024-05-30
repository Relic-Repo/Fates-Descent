<script>
  import { getContext, onDestroy } from 'svelte';
  import { ApplicationShell } from '#runtime/svelte/component/core';
  import { FatesDescentRoll } from '../FatesDescentRoll.js';
  import { MODULE_ID } from '../settings.js';
  import { writable } from 'svelte/store';

  export let performRoll = FatesDescentRoll.performRoll;
  export let elementRoot;

  const { application } = getContext('#external');
  const stylesContent = { padding: '0' };

  const defaultSeverities = [
    { id: 'minimal', text: 'Minimal (DC 8)', dc: 8, loss: '1d4' },
    { id: 'moderate', text: 'Moderate (DC 12)', dc: 12, loss: '1d6' },
    { id: 'serious', text: 'Serious (DC 16)', dc: 16, loss: '1d8' },
    { id: 'extreme', text: 'Extreme (DC 20)', dc: 20, loss: '1d10' }
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

  function updateRequestInStore(updatedRequest) {
    requestsStore.update(requests => {
      return requests.map(request => request.actorId === updatedRequest.actorId && request.type === updatedRequest.type ? updatedRequest : request);
    });
  }

  async function handleRoll(request) {
    const { actorId, selectedSeverity, customDC, type, useCustomLoss, loss, config, useCustomDC } = request;
    const severityId = selectedSeverity?.id || 'minimal';
    const lossInput = useCustomLoss ? loss : { 'minimal': '1d4', 'moderate': '1d6', 'serious': '1d8', 'extreme': '1d10' }[severityId];

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
    await Promise.all(globalRequests.map(request => handleRoll(request)));
    interval = setInterval(updateRequests, 500);
  }

  function handleCancel(request) {
    return new Promise((resolve) => {
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
        actor[method]("san", rollOptions).then(() => {
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
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  async function handleCancelAll() {
    clearInterval(interval);
    const globalRequests = game.settings.get(MODULE_ID, "globalSaveRequests");
    await Promise.all(globalRequests.map(request => handleCancel(request)));
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

  function updateRequestProperty(actorId, type, property, value) {
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

  function toggleRollType(actorId) {
    requestsStore.update(requests => {
      const updatedRequests = requests.map(request => {
        if (request.actorId === actorId) {
          const newType = request.type === 'save' ? 'test' : 'save';
          return { ...request, type: newType };
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
            <button type="button" on:click={handleCancelAll}>Cancel</button>
          </div>
        </div>
      </div>
      {#each $requestsStore as request (request.actorId)}
        <div class="row">
          <div class="cell">
            <button type="button" on:click={() => toggleRollType(request.actorId)} class={getButtonClass(request.type)}>{request.actorName}</button>
          </div>
          <div class="cell">
            <select bind:value={request.selectedSeverity.id} on:change={e => updateRequestProperty(request.actorId, request.type, 'selectedSeverity', defaultSeverities.find(severity => severity.id === e.target.value))}>
              {#each defaultSeverities as severity}
                <option value={severity.id}>{severity.text}</option>
              {/each}
            </select>
          </div>
          <div class="cell">
            <div class="custom-dc">
              <input type="checkbox" bind:checked={request.useCustomDC} on:change={e => updateRequestProperty(request.actorId, request.type, 'useCustomDC', e.target.checked)} />
              <input type="text" bind:value={request.customDC} placeholder={request.selectedSeverity.dc} disabled={!request.useCustomDC} on:input={e => updateRequestProperty(request.actorId, request.type, 'customDC', e.target.value)} />
            </div>
          </div>
          <div class="cell">
            <div class="custom-loss">
              <input type="checkbox" bind:checked={request.useCustomLoss} on:change={e => updateRequestProperty(request.actorId, request.type, 'useCustomLoss', e.target.checked)} />
              <input type="text" bind:value={request.loss} placeholder={request.selectedSeverity.loss} disabled={!request.useCustomLoss} on:input={e => updateRequestProperty(request.actorId, request.type, 'loss', e.target.value)} />
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
  input::placeholder {
  color: #f8f8f8;
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


