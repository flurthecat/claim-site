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
  <meta name="description" content="Claim your allocated Flur tokens" />
</svelte:head>

<main class="container">
  <div class="header">
    <h1>🏆 Flur Token Claim</h1>
    <p>Connect your Phantom wallet to check your token allocation</p>
  </div>

  <div class="card">
    {#if !walletAddress}
      <!-- Wallet Connection -->
      <div class="connect-section">
        <Wallet size={48} weight="duotone" />
        <h2>Connect Your Wallet</h2>
        <p>Connect your Phantom wallet to check if you're eligible for token claims.</p>
        
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
          <h2>Connected Wallet</h2>
          <p class="address">{walletAddress}</p>
          <button class="disconnect-btn" on:click={disconnectWallet}>
            Disconnect
          </button>
        </div>

        {#if loading}
          <div class="loading-section">
            <span class="spinner"></span>
            <p>Checking allocation...</p>
          </div>
        {:else if allocation}
          <!-- Allocation Found -->
          <div class="allocation-section">
            {#if allocation.claimed}
              <!-- Already Claimed -->
              <div class="claimed-status">
                <CheckCircle size={48} weight="fill" color="#22c55e" />
                <h3>Already Claimed</h3>
                <p>You have already claimed your tokens on {formatDate(allocation.claimed_at || '')}</p>
                <div class="allocation-details">
                  <p><strong>Allocation:</strong> {allocation.allocation_amount.toLocaleString()} tokens</p>
                  <p><strong>Qualified for:</strong> {allocation.tokens_qualified_for}</p>
                </div>
              </div>
            {:else}
              <!-- Available to Claim -->
              <div class="claim-section">
                <h3>🎉 Congratulations!</h3>
                <p>You are eligible to claim tokens</p>
                
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
                    Processing Claim...
                  {:else}
                    <CheckCircle size={20} weight="bold" />
                    Claim Tokens
                  {/if}
                </button>
              </div>
            {/if}
          </div>
        {:else}
          <!-- No Allocation -->
          <div class="no-allocation">
            <h3>No Allocation Found</h3>
            <p>This wallet is not eligible for token claims.</p>
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
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
  }

  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem 1rem;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .header {
    text-align: center;
    margin-bottom: 2rem;
    color: white;
  }

  .header h1 {
    font-size: 2.5rem;
    margin: 0 0 0.5rem 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .header p {
    font-size: 1.1rem;
    opacity: 0.9;
    margin: 0;
  }

  .card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    overflow: hidden;
  }

  .connect-section,
  .wallet-section {
    padding: 2rem;
    text-align: center;
  }

  .connect-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .connect-section h2 {
    margin: 0;
    color: #334155;
    font-size: 1.5rem;
  }

  .connect-section p {
    color: #64748b;
    margin: 0;
  }

  .connect-btn {
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 12px;
    padding: 1rem 2rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s;
    margin-top: 1rem;
  }

  .connect-btn:hover:not(:disabled) {
    background: #5855eb;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  }

  .connect-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  .wallet-info {
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .wallet-info h2 {
    margin: 0 0 0.5rem 0;
    color: #334155;
  }

  .address {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.9rem;
    color: #6366f1;
    background: #f1f5f9;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    margin: 1rem 0;
    word-break: break-all;
  }

  .disconnect-btn {
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  .disconnect-btn:hover {
    background: #dc2626;
  }

  .loading-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
  }

  .claimed-status {
    text-align: center;
    padding: 1rem;
  }

  .claimed-status h3 {
    color: #22c55e;
    margin: 1rem 0 0.5rem 0;
  }

  .claim-section {
    text-align: center;
    padding: 1rem;
  }

  .claim-section h3 {
    color: #059669;
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
  }

  .allocation-details {
    background: #f8fafc;
    border-radius: 12px;
    padding: 1.5rem;
    margin: 1.5rem 0;
    text-align: left;
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  .detail-item:last-child {
    margin-bottom: 0;
  }

  .label {
    color: #64748b;
    font-weight: 500;
  }

  .value {
    color: #334155;
    font-weight: 600;
  }

  .claim-btn {
    background: #22c55e;
    color: white;
    border: none;
    border-radius: 12px;
    padding: 1rem 2rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s;
    margin: 1rem auto 0;
  }

  .claim-btn:hover:not(:disabled) {
    background: #16a34a;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
  }

  .claim-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  .no-allocation {
    text-align: center;
    padding: 2rem;
    color: #64748b;
  }

  .message {
    margin-top: 1rem;
    padding: 1rem;
    border-radius: 8px;
    font-weight: 500;
  }

  .message.success {
    background: #d1fae5;
    color: #065f46;
    border: 1px solid #a7f3d0;
  }

  .message.error {
    background: #fee2e2;
    color: #991b1b;
    border: 1px solid #fca5a5;
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

  @media (max-width: 640px) {
    .container {
      padding: 1rem 0.5rem;
    }
    
    .header h1 {
      font-size: 2rem;
    }
    
    .connect-section,
    .wallet-section {
      padding: 1.5rem;
    }
    
    .allocation-details {
      padding: 1rem;
    }
    
    .detail-item {
      flex-direction: column;
      gap: 0.25rem;
    }
  }
</style>