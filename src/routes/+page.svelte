<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { getAllocation, markClaimed, type AllocationRow } from '$lib/getAllocation.js';
  import { CheckCircle, Wallet } from 'phosphor-svelte';

  // State variables
  let walletAddress: string | null = null;
  let allocation: AllocationRow | null = null;
  let loading = false;
  let message = '';
  let claiming = false;

  // Connect to Phantom wallet
  async function connectWallet() {
    if (!browser) {
      message = 'Please use a browser that supports Phantom wallet.';
      return;
    }

    try {
      // @ts-ignore - Phantom wallet global
      const provider = window?.solana;
      
      if (!provider || !provider.isPhantom) {
        message = 'Please install Phantom Wallet to continue.';
        window.open('https://phantom.app/', '_blank');
        return;
      }

      loading = true;
      message = '';
      
      const response = await provider.connect();
      walletAddress = response.publicKey.toString();
      
      // Fetch allocation data immediately after connection
      await fetchAllocation();
      
    } catch (error) {
      console.error('Wallet connection failed:', error);
      message = 'Failed to connect wallet. Please try again.';
    } finally {
      loading = false;
    }
  }

  // Fetch allocation data for connected wallet
  async function fetchAllocation() {
    if (!walletAddress) return;

    try {
      loading = true;
      message = '';
      
      const data = await getAllocation(walletAddress);
      allocation = data;
      
      if (!data) {
        message = 'This wallet is not eligible for a token claim.';
      }
    } catch (error) {
      console.error('Error fetching allocation:', error);
      message = 'Error checking allocation. Please try again.';
    } finally {
      loading = false;
    }
  }

  // Handle claim action
  async function handleClaim() {
    if (!walletAddress || !allocation) return;

    try {
      claiming = true;
      message = '';
      
      await markClaimed(walletAddress);
      
      // Update local state
      allocation = {
        ...allocation,
        claimed: true,
        claimed_at: new Date().toISOString()
      };
      
      message = 'Successfully claimed your tokens!';
      
    } catch (error) {
      console.error('Error claiming tokens:', error);
      message = 'Error processing claim. Please try again.';
    } finally {
      claiming = false;
    }
  }

  // Disconnect wallet
  function disconnectWallet() {
    walletAddress = null;
    allocation = null;
    message = '';
  }

  // Format date for display
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
</script>

<svelte:head>
  <title>Flur Token Claim Site</title>
  <meta name="description" content="Claim your allocated Flur tokens - For The 9000 who believed" />
</svelte:head>

<main class="container">
  <div class="header">
    <h1>🐱 Flur Token Claim</h1>
    <p>For The 9000 who believed. For The Few who stayed loyal. Connect your Phantom wallet to claim your $FLUR tokens.</p>
  </div>

  <!-- Token Info Section matching main site -->
  <div class="token-info">
    <div class="token-label">CAT-20 ID</div>
    <div class="token-symbol">$FLUR</div>
    <div class="token-value">028ae179783cd237f475ca1a58d5c8b3ecec3884862d337971fc168d5e92c16e_0</div>
  </div>

  <div class="card">
    {#if !walletAddress}
      <!-- Wallet Connection -->
      <div class="connect-section">
        <Wallet size={48} weight="duotone" />
        <h2>Connect Your Phantom Wallet</h2>
        <p>Are you one of The 9000? Connect your wallet to see if you're eligible for $FLUR token claims. Only those who believed from the beginning can claim their share of Flur's legacy.</p>
        
        <button 
          class="connect-btn" 
          on:click={connectWallet}
          disabled={loading}
        >
          {#if loading}
            <span class="spinner"></span>
            Connecting...
          {:else}
            <Wallet size={20} weight="bold" />
            Connect Phantom Wallet
          {/if}
        </button>
        
        {#if message}
          <p class="message error">{message}</p>
        {/if}
      </div>
    {:else}
      <!-- Connected Wallet View -->
      <div class="wallet-section">
        <div class="wallet-info">
          <h2>Wallet Connected</h2>
          <p class="address">{walletAddress}</p>
          <button class="disconnect-btn" on:click={disconnectWallet}>
            Disconnect
          </button>
        </div>

        {#if loading}
          <div class="loading-section">
            <span class="spinner"></span>
            <p>Checking if you're one of The 9000...</p>
          </div>
        {:else if allocation}
          <!-- Allocation Found -->
          <div class="allocation-section">
            {#if allocation.claimed}
              <!-- Already Claimed -->
              <div class="claimed-status">
                <CheckCircle size={48} weight="fill" color="#4caf50" />
                <h3>Tokens Already Claimed</h3>
                <p>You've already claimed your $FLUR tokens on {formatDate(allocation.claimed_at || '')}. Thank you for being one of The 9000 who believed in Flur from the beginning!</p>
                <div class="allocation-details">
                  <p><strong>Allocation:</strong> {allocation.allocation_amount.toLocaleString()} tokens</p>
                  <p><strong>Qualified for:</strong> {allocation.tokens_qualified_for}</p>
                </div>
              </div>
            {:else}
              <!-- Available to Claim -->
              <div class="claim-section">
                <h3>🎉 Welcome, Fellow Believer!</h3>
                <p>You are one of The 9000! Your loyalty to $FLUR has been rewarded. Claim your tokens and join Flur on his journey to greatness.</p>
                
                <div class="allocation-details">
                  <div class="detail-item">
                    <span class="label">Allocation Amount:</span>
                    <span class="value">{allocation.allocation_amount.toLocaleString()} tokens</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Qualified For:</span>
                    <span class="value">{allocation.tokens_qualified_for}</span>
                  </div>
                </div>

                <button 
                  class="claim-btn"
                  on:click={handleClaim}
                  disabled={claiming}
                >
                  {#if claiming}
                    <span class="spinner"></span>
                    Claiming Your $FLUR...
                  {:else}
                    <CheckCircle size={20} weight="bold" />
                    Claim Your $FLUR
                  {/if}
                </button>
              </div>
            {/if}
          </div>
        {:else}
          <!-- No Allocation -->
          <div class="no-allocation">
            <h3>Wallet Not Eligible</h3>
            <p>This wallet is not among The 9000 who believed in $FLUR from the beginning. Only the original minters and loyal holders are eligible for this claim.</p>
          </div>
        {/if}

        {#if message}
          <p class="message {allocation && !allocation.claimed ? 'success' : 'error'}">{message}</p>
        {/if}
      </div>
    {/if}
  </div>
</main>

<style>
  /* Import Gloria Hallelujah font to match main site */
  @import url('https://fonts.googleapis.com/css2?family=Gloria+Hallelujah&display=swap');

  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Gloria Hallelujah', cursive;
    background-color: #e9e9de;
    color: #333;
    min-height: 100vh;
  }

  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .header {
    text-align: center;
    margin-bottom: 40px;
    color: #333;
  }

  .header h1 {
    font-size: 2.5rem;
    margin: 0 0 10px 0;
    font-family: 'Gloria Hallelujah', cursive;
    color: #333;
  }

  .header p {
    font-size: 1.1rem;
    margin: 0;
    color: #555;
  }

  .card {
    background-color: #f4f4f4;
    border-radius: 12px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    margin-bottom: 20px;
  }

  .connect-section,
  .wallet-section {
    padding: 40px;
    text-align: center;
  }

  .connect-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .connect-section h2 {
    margin: 0;
    color: #333;
    font-size: 1.5rem;
    font-family: 'Gloria Hallelujah', cursive;
  }

  .connect-section p {
    color: #555;
    margin: 0;
    font-size: 1rem;
    line-height: 1.5;
  }

  .connect-btn {
    background: #666;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 15px 30px;
    font-size: 1rem;
    font-family: 'Gloria Hallelujah', cursive;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: all 0.2s;
    margin-top: 15px;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
  }

  .connect-btn:hover:not(:disabled) {
    background: #555;
    transform: translateY(-2px);
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  }

  .connect-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  .wallet-info {
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #ddd;
  }

  .wallet-info h2 {
    margin: 0 0 10px 0;
    color: #333;
    font-family: 'Gloria Hallelujah', cursive;
    font-size: 1.5rem;
  }

  .address {
    font-family: monospace;
    font-size: 0.9rem;
    color: #333;
    background: #e9e9de;
    padding: 15px;
    border-radius: 8px;
    margin: 15px 0;
    word-break: break-all;
    border: 1px solid #ddd;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
  }

  .disconnect-btn {
    background: #d32f2f;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 8px 16px;
    font-size: 0.9rem;
    font-family: 'Gloria Hallelujah', cursive;
    cursor: pointer;
    transition: background 0.2s;
  }

  .disconnect-btn:hover {
    background: #b71c1c;
  }

  .loading-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 40px;
  }

  .claimed-status {
    text-align: center;
    padding: 20px;
  }

  .claimed-status h3 {
    color: #4caf50;
    margin: 20px 0 10px 0;
    font-family: 'Gloria Hallelujah', cursive;
    font-size: 1.5rem;
  }

  .claim-section {
    text-align: center;
    padding: 20px;
  }

  .claim-section h3 {
    color: #4caf50;
    margin: 0 0 10px 0;
    font-size: 1.8rem;
    font-family: 'Gloria Hallelujah', cursive;
  }

  .allocation-details {
    background: #e9e9de;
    border-radius: 8px;
    padding: 20px;
    margin: 20px 0;
    text-align: left;
    border: 1px solid #ddd;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    padding: 5px 0;
  }

  .detail-item:last-child {
    margin-bottom: 0;
  }

  .label {
    color: #555;
    font-weight: bold;
    font-size: 1rem;
  }

  .value {
    color: #333;
    font-weight: bold;
    font-size: 1rem;
  }

  .claim-btn {
    background: #4caf50;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 15px 30px;
    font-size: 1rem;
    font-family: 'Gloria Hallelujah', cursive;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: all 0.2s;
    margin: 20px auto 0;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
  }

  .claim-btn:hover:not(:disabled) {
    background: #45a049;
    transform: translateY(-2px);
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  }

  .claim-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  .no-allocation {
    text-align: center;
    padding: 40px;
    color: #555;
  }

  .no-allocation h3 {
    font-family: 'Gloria Hallelujah', cursive;
    font-size: 1.5rem;
    color: #333;
    margin-bottom: 10px;
  }

  .message {
    margin-top: 20px;
    padding: 15px;
    border-radius: 8px;
    font-family: 'Gloria Hallelujah', cursive;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
  }

  .message.success {
    background: #e8f5e8;
    color: #2e7d2e;
    border: 1px solid #4caf50;
  }

  .message.error {
    background: #fdeaea;
    color: #d32f2f;
    border: 1px solid #f44336;
  }

  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Token info section matching main site */
  .token-info {
    background-color: #f4f4f4;
    padding: 20px;
    margin: 20px auto;
    border-radius: 8px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #ddd;
    display: grid;
    grid-template-columns: auto auto 1fr;
    column-gap: 20px;
    align-items: center;
    max-width: 100%;
  }

  .token-label,
  .token-symbol,
  .token-value {
    display: flex;
    align-items: center;
    padding-left: 10px;
    text-align: left;
  }

  .token-label {
    font-weight: bold;
    color: #333;
    padding-left: 0;
  }

  .token-symbol {
    font-weight: bold;
    color: #666;
    border-left: 2px solid #ddd;
  }

  .token-value {
    font-family: monospace;
    color: #555;
    word-break: break-all;
    border-left: 2px solid #ddd;
    font-size: 0.9rem;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .container {
      padding: 15px;
    }
    
    .header h1 {
      font-size: 2rem;
    }
    
    .connect-section,
    .wallet-section {
      padding: 30px 20px;
    }
    
    .allocation-details {
      padding: 15px;
    }
    
    .detail-item {
      flex-direction: column;
      gap: 5px;
      align-items: flex-start;
    }

    .token-info {
      grid-template-columns: 1fr;
      text-align: center;
      row-gap: 10px;
    }

    .token-label,
    .token-symbol,
    .token-value {
      border-left: none;
      padding-left: 0;
      justify-content: center;
    }

    .token-value {
      word-break: break-all;
      font-size: 0.8rem;
    }
  }
</style>