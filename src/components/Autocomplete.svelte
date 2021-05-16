<script>
  let input;
  let term = "";
  let select_from = [];
  let selected = -1;
  let items = [];
  let show;
	
	export let placeholder = "suche in Gruppen und Nutzern ..."
	export let search
	export let result = undefined
	
	const ret_selected = sel => {
    result = sel
    select_from = [];
    selected = -1;
    term = "";
    input.blur();
  }

  $: if (term.length > 1) {
    selected = -1;
		select_from = search(term)
  }
  $: if (term.length < 2) select_from = [];
	
  const key = e => {
    if (e.key === "ArrowDown") selected += 1;
    else if (e.key === "ArrowUp") selected -= 1;
    else if (e.key === "Enter" && selected >= 0) {
      ret_selected(select_from[selected]);
      return;
    } else return;
    if (selected > select_from.length - 1) selected = 0;
    if (selected < 0) selected = select_from.length - 1;
    e.preventDefault();
    items[selected].scrollIntoView({ block: "center", inline: "nearest" });
  };
  const blur = _ => {
    setTimeout(_ => (show = false), 500);
  };
</script>

<style>
  .wrapper {
    position: relative;
  }
  .input {
    width: 20rem;
  }
  .items {
    position: absolute;
    border: 1px solid #d4d4d4;
    z-index: 99;
    top: 100%;
    left: 0;
    right: 0;
    max-height: 80vh;
    overflow: auto;
  }
  .items div {
    padding: 10px;
    cursor: pointer;
    background-color: #fff;
    border-bottom: 1px solid #d4d4d4;
  }
  .items div:hover {
    background-color: #e9e9e9;
  }
  .active {
    background-color: DodgerBlue !important;
    color: #ffffff;
  }
</style>

<div class="wrapper">
  <input
    class="input"
    type="text"
    {placeholder}
    bind:this={input}
    bind:value={term}
    on:keydown={key}
    on:blur={blur}
    on:focus={() => (show = true)} />
  {#if select_from.length && show}
    <div class="items">
      {#each select_from as item, i}
        <div
          on:click={() => ret_selected(item)}
          class:active={selected === i}
          bind:this={items[i]}>
          {item.info}
        </div>
      {/each}
    </div>
  {/if}
</div>
