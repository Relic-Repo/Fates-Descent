<script>
    import { createEventDispatcher } from 'svelte';
    import { ApplicationShell } from '#runtime/svelte/component/core';
    import { FatesDescentRoll } from '../FatesDescentRoll.js';
  
    export let actorId;
    export let type;
    export let config;
    export let performRoll = FatesDescentRoll.performRoll;
    export let elementRoot;
  
    let severities = [
      { id: 'minimal', text: 'Minimal (DC 8)' },
      { id: 'moderate', text: 'Moderate (DC 12)' },
      { id: 'serious', text: 'Serious (DC 16)' },
      { id: 'extreme', text: 'Extreme (DC 20)' }
    ];
  
    let selectedSeverity = severities[0];
    let useCustomDC = false;
    let customDC = 0;
    let useCustomLoss = false;
    let loss = 0;
  
    const dispatch = createEventDispatcher();
  
    function handleRoll() {
      const lossInput = useCustomLoss ? loss : { 'minimal': '1d4', 'moderate': '1d6', 'serious': '1d8', 'extreme': '1d10' }[selectedSeverity.id];
      performRoll(actorId, selectedSeverity.id, customDC, type, lossInput, config, useCustomDC, useCustomLoss);
      dispatch('close');
    }
  
    const dialogTitle = type === 'save' ? 'Sanity Save' : 'Sanity Check';
  </script>
  
  <svelte:options accessors={true}/>
  
  <ApplicationShell bind:elementRoot>
    <main>
      <h2><i class="fas fa-dice"></i> {dialogTitle} <i class="fas fa-dice"></i></h2>
  
      <form on:submit|preventDefault={handleRoll}>
        <label>
          Severity:
          <select bind:value={selectedSeverity} on:change={() => { customDC = 0; loss = 0; }}>
            {#each severities as severity}
              <option value={severity}>{severity.text}</option>
            {/each}
          </select>
        </label>
  
        <label>
          Custom DC: <input type="checkbox" bind:checked={useCustomDC} />
          <input type="text" bind:value={customDC} placeholder="DC" disabled={!useCustomDC} />
        </label>
  
        <label>
          Loss: <input type="checkbox" bind:checked={useCustomLoss} />
          <input type="text" bind:value={loss} placeholder="Loss" disabled={!useCustomLoss} />
        </label>
  
        <button disabled={selectedSeverity === null} type="submit">Roll</button>
        <button type="button" on:click={() => dispatch('close')}>Cancel</button>
      </form>
  
      <p>Selected severity: {selectedSeverity ? selectedSeverity.text : '[waiting...]'}</p>
    </main>
  </ApplicationShell>
  
  <style>
    main {
      background: #222;
      color: #f8f8f8;
      padding: 5px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    form {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    label {
      display: block;
      margin: 10px 0;
      font-size: 1.4em;
    }
    input[type='text'], input[type='checkbox'], select {
      margin-left: 10px;
      background: #333; 
      color: #f8f8f8; 
      border: 1px solid #444;
      padding: 2px;
      border-radius: 4px;
      font-size: 12px;
    }
    input[type='text'] {
      width: 100px;
    }
    button {
      background: #f8f8f8;
      color: #222;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      font-weight: bold;
      font-size: 16px;
      margin: 10px 0;
      cursor: pointer;
    }
    button:hover {
      background: #555;
    }
  </style>
  