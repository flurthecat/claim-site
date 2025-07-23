<script lang="ts">
  import { onMount } from 'svelte';
import { browser } from '$app/environment';
  import { supabase } from '$lib/supabase';
  import { getAllocation, markClaimed } from '$lib/getAllocation';
  import type { AllocationRow } from '$lib/getAllocation';
  import { CheckCircle } from 'phosphor-svelte';
  import { writable, get } from 'svelte/store';

  const walletAddress = writable<string | null>(null);
  const allocation = writable<AllocationRow | null>(null);
  const loading = writable(false);
  const message = writable<string | null>(null);

  // Connect to Phantom wallet
  async function connectWallet() {
    //@ts-ignore
    const provider = browser ? window?.solana : undefined;
    if (!provider || !provider.isPhantom) {
      message.set('Please install Phantom Wallet to continue.');
      return;
    }

    try {
      const resp = await provider.connect();
      walletAddress.set(resp.publicKey.toString());
    } catch (err) {
      message.set('Wallet connection failed');
    }
  }

  // Watch walletAddress changes
  walletAddress.subscribe(async (address) => {
    if (!address) return;
    loading.set(true);
    try {
      const data = await getAllocation(address);
      allocation.set(data);
      if (!data) message.set('This wallet is not eligible for a claim.');
    } catch (e) {
      console.error(e);
      message.set('Error fetching allocation');
    } finally {
      loading.set(false);
    }
  });

  async function claim() {
    const addr = get(walletAddress);
    if (!addr) return;
    loading.set(true);
    try {
      await markClaimed(addr);
      allocation.update((a) => (a ? { ...a, claimed: true, claimed_at: new Date().toISOString() } : a));
      message.set('Successfully claimed!');
    } catch (e) {
      message.set('Error processing claim');
    } finally {
      loading.set(false);
    }
  }
</script>

<svelte:head>
  <title>Claim Site</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<main class="container">
  <h1>Flur Token Claim</h1>

  {#if $walletAddress}
    <p>Your wallet: <strong>{$walletAddress}</strong></p>

    {#if $loading}
      <p>Loading...</p>
    {:else if $allocation}
      {#if $allocation.claimed}
        <div class="success"><CheckCircle size="32" weight="fill" /> You have already claimed on {$allocation.claimed_at}</div>
      {:else}
        <p>Allocation amount: <strong>{$allocation.allocation_amount}</strong></p>
        <button on:click={claim}>Claim</button>
      {/if}
    {:else}
      <p>{$message}</p>
    {/if}
  {:else}
    <button on:click={connectWallet}>Connect Phantom Wallet</button>
  {/if}

  {#if $message && !$allocation}
    <p class="error">{$message}</p>
  {/if}
</main>

<style>
  .container {
    max-width: 600px;
    margin: 2rem auto;
    padding: 1rem;
    text-align: center;
  }
  button {
    background: #6366f1;
    border: none;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
  }
  button:hover {
    opacity: 0.9;
  }
  .success {
    color: green;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  .error {
    color: red;
  }
</style>
