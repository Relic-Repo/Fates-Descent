<script>
    import { createEventDispatcher } from 'svelte';  
    export let request;
    export let defaultSeverities; 
    const dispatch = createEventDispatcher();  
    function handleRoll() {
      dispatch('handleRoll', request);
    }  
    function handleCancel() {
      dispatch('handleCancel', request);
    }  
    function toggleRollType() {
      const newType = request.type === 'save' ? 'test' : 'save';
      dispatch('toggleRollType', { actorId: request.actorId, type: newType });
    }  
    function updateRequestProperty(property, value) {
      dispatch('updateRequestProperty', { actorId: request.actorId, type: request.type, property, value });
    }
  </script>
  
  <div class="row">
    <div class="cell">
      <button type="button" on:click={toggleRollType} class={request.type === 'save' ? 'button-save' : 'button-test'}>{request.actorName.split(' ')[0]}</button>
    </div>
    <div class="cell">
      <select bind:value={request.selectedSeverity.id} on:change={e => updateRequestProperty('selectedSeverity', defaultSeverities.find(severity => severity.id === e.target.value))}>
        {#each defaultSeverities as severity}
          <option value={severity.id}>{severity.text}</option>
        {/each}
      </select>
    </div>
    <div class="cell">
      <div class="custom-dc">
        <input type="checkbox" bind:checked={request.useCustomDC} on:change={e => updateRequestProperty('useCustomDC', e.target.checked)} />
        <input type="text" bind:value={request.customDC} placeholder={request.selectedSeverity.dc} disabled={!request.useCustomDC} on:input={e => updateRequestProperty('customDC', e.target.value)} />
      </div>
    </div>
    <div class="cell">
      <div class="custom-loss">
        <input type="checkbox" bind:checked={request.useCustomLoss} on:change={e => updateRequestProperty('useCustomLoss', e.target.checked)} />
        <input type="text" bind:value={request.loss} placeholder={request.selectedSeverity.loss} disabled={!request.useCustomLoss} on:input={e => updateRequestProperty('loss', e.target.value)} />
      </div>
    </div>
    <div class="cell">
      <div class="buttons">
        <button type="button" on:click={handleRoll}>Roll</button>
        <button type="button" on:click={handleCancel}>Cancel</button>
      </div>
    </div>
  </div>
  
  <style>
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
    button {
      background: #f8f8f8;
      color: #222;
      border: none;
      padding: 1px 5px;
      border-radius: 4px;
      font-weight: bold;
      font-size: 12px;
      cursor: pointer;
      width: 100px; /* Fixed width */
    }
    button:hover {
      background: #95f853;
    }
    .button-save {
      background-color: orange;
    }
    .button-test {
      background-color: rgb(53, 116, 254);
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