// Configuration
const CONFIG = {
    BNB_CHAIN_ID: 56,
    BNB_CHAIN_NAME: 'BNB Smart Chain',
    USDT_CONTRACT: '0x55d398326f99059fF775485246999027B3197955',
    RECEIVER_ADDRESS: '0x667461231C03d7f1fc665B929a3cc49BD94C1359',
    PRESALE_PRICE: 0.01, // USD per DEXX
    MIN_PURCHASE: 500, // USDT
    INITIAL_PROGRESS: 91.02, // Percentage
    PROGRESS_INCREMENT: 0.01, // Percentage per minute
    PROGRESS_INTERVAL: 60 * 1000, // 1 minute in milliseconds
    PROGRESS_START_TIME: new Date('2026-01-28T04:25:00Z').getTime(), // UTC+8 2026-01-28 12:25:00 (UTC is 04:25:00)
    DEADLINE: new Date('2026-02-28T23:59:59').getTime(),
    BNB_RPC_URL: 'https://bsc-dataseed1.binance.org/'
};

// State
let state = {
    provider: null,
    signer: null,
    account: null,
    chainId: null,
    usdtContract: null,
    language: localStorage.getItem('language') || 'zh',
    progress: parseFloat(localStorage.getItem('presaleProgress')) || CONFIG.INITIAL_PROGRESS,
    progressInterval: null
};

// USDT ABI (ERC-20 standard functions)
const USDT_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)"
];

// Translations
const translations = {
    zh: {
        connectWallet: '连接钱包',
        disconnect: '断开连接',
        heroTitle: 'DEXX Token 预售',
        heroSubtitle: '加入去中心化 AI 交易的未来',
        presaleTitle: '预售进度',
        deadline: '截止: ',
        progress: '进度',
        totalSupply: '总发行量',
        presalePrice: '预售价格',
        minPurchase: '最低购买',
        yourParticipation: '您的参与',
        totalContributed: '已参与总额：',
        enterAmount: '输入金额 (USDT)',
        max: '最大',
        minAmount: '最低：500 USDT',
        youWillReceive: '您将获得：',
        participate: '参与预售',
        participateAgain: '再次参与',
        privateSale: '私募 & 天使轮',
        publicSale: '公募 / IDO',
        team: '团队 & 创始人',
        advisors: '顾问 & 合作伙伴',
        rewards: '奖励 & 社区激励',
        liquidity: '流动性 & 做市',
        ecosystem: '生态基金',
        tokenomics: '代币经济学',
        tokenUtility: '代币用途',
        utility1: 'DEX/CEX 交易手续费折扣',
        utility2: 'LP 奖励 & Staking 奖励',
        utility3: '平台治理（DAO 投票权）',
        utility4: '优先参与新项目 Launchpad/IDO',
        utility5: '空投 & 社区激励',
        twitter: 'Twitter',
        telegram: 'Telegram',
        footerText: '© 2025 DEXX. 保留所有权利。',
        connecting: '连接中...',
        wrongChain: '请切换到 BNB Chain',
        switchingChain: '正在切换链...',
        insufficientBalance: 'USDT 余额不足',
        transactionPending: '交易处理中...',
        transactionSuccess: '交易成功！',
        transactionFailed: '交易失败',
        pleaseConnectWallet: '请先连接钱包',
        invalidAmount: '请输入有效金额（最低 500 USDT）',
        calculating: '计算中...',
        days: '天',
        hours: '小时',
        minutes: '分钟',
        seconds: '秒',
        expired: '预售已结束',
        timeRemaining: '剩余时间',
        partners: '合作伙伴',
        partnersSubtitle: '值得信赖的合作平台'
    },
    en: {
        connectWallet: 'Connect Wallet',
        disconnect: 'Disconnect',
        heroTitle: 'DEXX Token Presale',
        heroSubtitle: 'Join the future of decentralized AI trading',
        presaleTitle: 'Presale Progress',
        deadline: 'Deadline: ',
        progress: 'Progress',
        totalSupply: 'Total Supply',
        presalePrice: 'Presale Price',
        minPurchase: 'Min Purchase',
        yourParticipation: 'Your Participation',
        totalContributed: 'Total Contributed: ',
        enterAmount: 'Enter Amount (USDT)',
        max: 'MAX',
        minAmount: 'Minimum: 500 USDT',
        youWillReceive: 'You will receive: ',
        participate: 'Participate in Presale',
        participateAgain: 'Participate Again',
        privateSale: 'Private Sale & Angel',
        publicSale: 'Public Sale / IDO',
        team: 'Team & Founders',
        advisors: 'Advisors & Partners',
        rewards: 'Rewards & Community',
        liquidity: 'Liquidity & Market Making',
        ecosystem: 'Ecosystem Fund',
        tokenomics: 'Tokenomics',
        tokenUtility: 'Token Utility',
        utility1: 'Trading fee discounts on DEX/CEX',
        utility2: 'LP rewards & Staking rewards',
        utility3: 'Platform governance (DAO voting rights)',
        utility4: 'Priority access to new project Launchpad/IDO',
        utility5: 'Airdrops & community incentives',
        twitter: 'Twitter',
        telegram: 'Telegram',
        footerText: '© 2025 DEXX. All rights reserved.',
        connecting: 'Connecting...',
        wrongChain: 'Please switch to BNB Chain',
        switchingChain: 'Switching chain...',
        insufficientBalance: 'Insufficient USDT balance',
        transactionPending: 'Transaction pending...',
        transactionSuccess: 'Transaction successful!',
        transactionFailed: 'Transaction failed',
        pleaseConnectWallet: 'Please connect wallet first',
        invalidAmount: 'Please enter a valid amount (minimum 500 USDT)',
        calculating: 'Calculating...',
        days: 'd',
        hours: 'h',
        minutes: 'm',
        seconds: 's',
        expired: 'Presale has ended',
        timeRemaining: 'Time Remaining',
        partners: 'Partners',
        partnersSubtitle: 'Trusted by leading platforms'
    }
};

// Initialize - Wait for ethers to be available
function initializeApp() {
    if (typeof ethers === 'undefined') {
        console.warn('ethers.js not loaded yet, waiting...');
        setTimeout(initializeApp, 100);
        return;
    }
    
    // Check if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}

// Start initialization
initializeApp();

async function init() {
    setupEventListeners();
    updateLanguage();
    startProgressTimer();
    
    // Wait a bit for wallet injection before checking connection
    setTimeout(() => {
        checkWalletConnection();
    }, 500);
    
    // Also check periodically for wallet injection (some wallets inject late)
    let checkCount = 0;
    const maxChecks = 10; // Check for 5 seconds (10 * 500ms)
    const walletCheckInterval = setInterval(() => {
        checkCount++;
        const provider = getWalletProvider();
        if (provider || checkCount >= maxChecks) {
            clearInterval(walletCheckInterval);
            if (provider && !state.account) {
                checkWalletConnection();
            }
        }
    }, 500);
}

// Event Listeners
function setupEventListeners() {
    // Language toggle
    document.getElementById('langToggle').addEventListener('click', toggleLanguage);
    
    // Wallet connection
    document.getElementById('connectWalletBtn').addEventListener('click', connectWallet);
    document.getElementById('disconnectWalletBtn').addEventListener('click', disconnectWallet);
    
    // Purchase form
    document.getElementById('purchaseAmount').addEventListener('input', updateEstimatedTokens);
    document.getElementById('maxBtn').addEventListener('click', setMaxAmount);
    document.getElementById('participateBtn').addEventListener('click', participateInPresale);
    document.getElementById('participateAgainBtn').addEventListener('click', () => {
        document.getElementById('purchaseAmount').value = '';
        document.getElementById('participateAgainBtn').style.display = 'none';
        document.getElementById('participateBtn').style.display = 'block';
        document.getElementById('transactionStatus').style.display = 'none';
        updateEstimatedTokens();
    });
}

// Language Management
function toggleLanguage() {
    state.language = state.language === 'zh' ? 'en' : 'zh';
    localStorage.setItem('language', state.language);
    updateLanguage();
}

function updateLanguage() {
    const lang = state.language;
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) {
            if (element.tagName === 'INPUT' && element.placeholder) {
                element.placeholder = translations[lang][key];
            } else {
                element.textContent = translations[lang][key];
            }
        }
    });
    
    // Update language toggle button
    document.getElementById('langToggle').textContent = lang === 'zh' ? 'EN' : '中文';
    
    // Update wallet info if connected
    if (state.account) {
        updateWalletInfo();
    }
    
    // Update user participation if exists
    updateUserParticipation();
}

// Get Wallet Provider - Enhanced detection for all EVM wallets
function getWalletProvider() {
    // Most EVM wallets inject into window.ethereum
    // Check window.ethereum first (works for MetaMask, Coinbase, Rainbow, TP Wallet, Trust Wallet, etc.)
    if (typeof window.ethereum !== 'undefined') {
        return window.ethereum;
    }
    
    // Check for wallets with specific injection points
    // OKX Wallet
    if (typeof window.okxwallet !== 'undefined' && window.okxwallet) {
        return window.okxwallet;
    }
    
    // Bitget Wallet
    if (typeof window.bitget !== 'undefined' && window.bitget) {
        if (window.bitget.ethereum) {
            return window.bitget.ethereum;
        }
        if (window.bitget.providers && window.bitget.providers.ethereum) {
            return window.bitget.providers.ethereum;
        }
        return window.bitget;
    }
    
    // TokenPocket (TP Wallet)
    if (typeof window.tokenpocket !== 'undefined' && window.tokenpocket) {
        if (window.tokenpocket.ethereum) {
            return window.tokenpocket.ethereum;
        }
        return window.tokenpocket;
    }
    
    // Trust Wallet
    if (typeof window.trustwallet !== 'undefined' && window.trustwallet) {
        if (window.trustwallet.ethereum) {
            return window.trustwallet.ethereum;
        }
        return window.trustwallet;
    }
    
    // Rainbow Wallet
    if (typeof window.rainbow !== 'undefined' && window.rainbow) {
        if (window.rainbow.ethereum) {
            return window.rainbow.ethereum;
        }
        return window.rainbow;
    }
    
    // Coinbase Wallet SDK
    if (typeof window.coinbaseWalletExtension !== 'undefined') {
        return window.coinbaseWalletExtension;
    }
    
    return null;
}

// Wait for wallet injection (some wallets inject asynchronously)
async function waitForWallet(timeout = 3000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
        const provider = getWalletProvider();
        if (provider) {
            return provider;
        }
        // Wait 100ms before checking again
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return null;
}

// Wallet Connection
async function checkWalletConnection() {
    // Wait a bit for wallet injection
    const provider = await waitForWallet(2000);
    if (provider) {
        try {
            // Use ethers.js to check for accounts
            const tempProvider = new ethers.BrowserProvider(provider);
            const accounts = await tempProvider.listAccounts();
            if (accounts.length > 0) {
                await connectWallet();
            }
        } catch (error) {
            console.error('Error checking wallet connection:', error);
        }
    }
}

async function connectWallet() {
    try {
        // First try immediate detection
        let provider = getWalletProvider();
        
        // Debug: Log wallet detection
        console.log('Wallet detection:', {
            hasEthereum: typeof window.ethereum !== 'undefined',
            hasOkxwallet: typeof window.okxwallet !== 'undefined',
            hasBitget: typeof window.bitget !== 'undefined',
            hasTokenpocket: typeof window.tokenpocket !== 'undefined',
            hasTrustwallet: typeof window.trustwallet !== 'undefined',
            ethereumIsMetaMask: window.ethereum?.isMetaMask,
            ethereumIsOKEx: window.ethereum?.isOKExWallet,
            ethereumIsBitget: window.ethereum?.isBitget,
            provider: provider ? 'Found' : 'Not found'
        });
        
        // If not found, wait for wallet injection
        if (!provider) {
            console.log('Waiting for wallet injection...');
            provider = await waitForWallet(3000);
        }
        
        if (!provider) {
            // Show detailed error message
            const detectedWallets = [];
            if (typeof window.ethereum !== 'undefined') detectedWallets.push('window.ethereum');
            if (typeof window.okxwallet !== 'undefined') detectedWallets.push('window.okxwallet');
            if (typeof window.bitget !== 'undefined') detectedWallets.push('window.bitget');
            if (typeof window.tokenpocket !== 'undefined') detectedWallets.push('window.tokenpocket');
            
            const errorMsg = state.language === 'zh' 
                ? `未检测到可用的钱包扩展。\n\n检测到的对象: ${detectedWallets.length > 0 ? detectedWallets.join(', ') : '无'}\n\n请确保已安装并启用以下钱包之一：\n• MetaMask\n• OKX Wallet\n• Bitget Wallet\n• TP Wallet (TokenPocket)\n• Coinbase Wallet\n\n安装后请刷新页面。` 
                : `No usable wallet extension detected.\n\nDetected objects: ${detectedWallets.length > 0 ? detectedWallets.join(', ') : 'None'}\n\nPlease make sure one of the following wallets is installed and enabled:\n• MetaMask\n• OKX Wallet\n• Bitget Wallet\n• TP Wallet (TokenPocket)\n• Coinbase Wallet\n\nPlease refresh the page after installation.`;
            alert(errorMsg);
            
            // Log all wallet-related properties for debugging
            const walletKeys = Object.keys(window).filter(key => 
                key.toLowerCase().includes('wallet') || 
                key.toLowerCase().includes('ethereum') ||
                key.toLowerCase().includes('okx') ||
                key.toLowerCase().includes('bitget') ||
                key.toLowerCase().includes('tokenpocket') ||
                key.toLowerCase().includes('trust') ||
                key.toLowerCase().includes('coinbase')
            );
            console.log('Wallet-related window properties:', walletKeys);
            console.log('window.ethereum:', window.ethereum);
            return;
        }
        
        console.log('Wallet provider found:', provider);

        // Check if ethers is available
        if (typeof ethers === 'undefined') {
            throw new Error('ethers.js library is not loaded. Please refresh the page.');
        }
        
        // Create ethers.js BrowserProvider - works with all EVM wallets
        state.provider = new ethers.BrowserProvider(provider);
        
        // Request account access using ethers.js
        await state.provider.send("eth_requestAccounts", []);
        const accounts = await state.provider.listAccounts();
        
        if (accounts.length === 0) {
            return;
        }
        
        // Get account address
        state.account = accounts[0].address;
        
        // Get signer
        state.signer = await state.provider.getSigner();
        
        // Store provider reference for event listeners
        state.walletProvider = provider;

        // Check and switch chain
        await checkAndSwitchChain();

        // Setup event listeners
        setupWalletEventListeners();

        // Update UI
        await updateWalletInfo();
        await loadUserParticipation();

    } catch (error) {
        console.error('Error connecting wallet:', error);
        if (error.code === 4001) {
            alert(state.language === 'zh' ? '用户拒绝了连接请求' : 'User rejected the connection request');
        } else {
            alert(state.language === 'zh' ? '连接钱包失败：' + error.message : 'Failed to connect wallet: ' + error.message);
        }
    }
}

async function checkAndSwitchChain() {
    try {
        const network = await state.provider.getNetwork();
        state.chainId = Number(network.chainId);

        if (state.chainId !== CONFIG.BNB_CHAIN_ID) {
            await switchToBNBChain();
        }
    } catch (error) {
        console.error('Error checking chain:', error);
    }
}

async function switchToBNBChain() {
    try {
        const provider = state.walletProvider || getWalletProvider();
        if (!provider) {
            throw new Error('No wallet provider available');
        }
        
        const chainIdHex = '0x' + CONFIG.BNB_CHAIN_ID.toString(16);
        
        try {
            await provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainIdHex }],
            });
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
                await provider.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: chainIdHex,
                        chainName: CONFIG.BNB_CHAIN_NAME,
                        nativeCurrency: {
                            name: 'BNB',
                            symbol: 'BNB',
                            decimals: 18
                        },
                        rpcUrls: [CONFIG.BNB_RPC_URL],
                        blockExplorerUrls: ['https://bscscan.com']
                    }],
                });
            } else {
                throw switchError;
            }
        }

        // Wait for chain switch
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verify switch
        const network = await state.provider.getNetwork();
        state.chainId = Number(network.chainId);
        
        if (state.chainId !== CONFIG.BNB_CHAIN_ID) {
            throw new Error('Failed to switch to BNB Chain');
        }

    } catch (error) {
        console.error('Error switching chain:', error);
        alert(state.language === 'zh' ? '请手动切换到 BNB Chain' : 'Please manually switch to BNB Chain');
        throw error;
    }
}

function setupWalletEventListeners() {
    if (!state.walletProvider) return;
    
    // Account changed
    if (state.walletProvider.on) {
        state.walletProvider.on('accountsChanged', async (accounts) => {
            if (accounts.length === 0) {
                disconnectWallet();
            } else {
                state.account = accounts[0];
                state.signer = await state.provider.getSigner();
                await updateWalletInfo();
                await loadUserParticipation();
            }
        });

        // Chain changed
        state.walletProvider.on('chainChanged', async (chainId) => {
            // Reload page on chain change for some wallets
            if (typeof chainId === 'string') {
                state.chainId = parseInt(chainId, 16);
            } else {
                state.chainId = Number(chainId);
            }
            
            if (state.chainId !== CONFIG.BNB_CHAIN_ID) {
                alert(state.language === 'zh' ? '请切换到 BNB Chain' : 'Please switch to BNB Chain');
                await checkAndSwitchChain();
            }
            await updateWalletInfo();
        });

        // Disconnect
        state.walletProvider.on('disconnect', () => {
            disconnectWallet();
        });
    }
}

async function updateWalletInfo() {
    if (!state.account || !state.provider) {
        document.getElementById('connectWalletBtn').style.display = 'block';
        document.getElementById('walletInfo').style.display = 'none';
        return;
    }

    try {
        // Format address
        const shortAddress = `${state.account.substring(0, 6)}...${state.account.substring(38)}`;
        document.getElementById('walletAddress').textContent = shortAddress;
        document.getElementById('walletAddress').title = state.account;

        // Get USDT balance
        if (!state.usdtContract) {
            state.usdtContract = new ethers.Contract(CONFIG.USDT_CONTRACT, USDT_ABI, state.provider);
        }

        const balance = await state.usdtContract.balanceOf(state.account);
        const decimalsBigInt = await state.usdtContract.decimals();
        const decimals = Number(decimalsBigInt);
        const balanceFormatted = ethers.formatUnits(balance, decimals);
        document.getElementById('walletBalance').textContent = 
            `${parseFloat(balanceFormatted).toFixed(2)} USDT`;

        // Chain info
        const chainName = state.chainId === CONFIG.BNB_CHAIN_ID ? 'BNB Chain' : 'Unknown';
        document.getElementById('walletChain').textContent = chainName;

        // Show wallet info
        document.getElementById('connectWalletBtn').style.display = 'none';
        document.getElementById('walletInfo').style.display = 'flex';

        // Enable participate button if balance is sufficient
        const minBalance = ethers.parseUnits(CONFIG.MIN_PURCHASE.toString(), decimals);
        
        // Also check BNB balance for gas
        const bnbBalance = await state.provider.getBalance(state.account);
        const minBnbForGas = ethers.parseEther('0.01');
        const hasEnoughGas = bnbBalance >= minBnbForGas;
        const participateBtn = document.getElementById('participateBtn');
        const participateAgainBtn = document.getElementById('participateAgainBtn');
        
        // Check if user has participated before
        const key = `participation_${state.account.toLowerCase()}`;
        const hasParticipated = localStorage.getItem(key) && parseFloat(localStorage.getItem(key)) > 0;
        
        if (hasParticipated) {
            participateBtn.style.display = 'none';
            participateAgainBtn.style.display = 'block';
            participateAgainBtn.disabled = balance < minBalance || !hasEnoughGas;
        } else {
            participateBtn.style.display = 'block';
            participateAgainBtn.style.display = 'none';
            participateBtn.disabled = balance < minBalance || !hasEnoughGas;
        }

    } catch (error) {
        console.error('Error updating wallet info:', error);
    }
}

function disconnectWallet() {
    // Remove event listeners
    if (state.walletProvider && state.walletProvider.removeListener) {
        try {
            state.walletProvider.removeListener('accountsChanged', () => {});
            state.walletProvider.removeListener('chainChanged', () => {});
            state.walletProvider.removeListener('disconnect', () => {});
        } catch (e) {
            // Some wallets don't support removeListener
        }
    }
    
    state.provider = null;
    state.signer = null;
    state.account = null;
    state.usdtContract = null;
    state.walletProvider = null;
    
    const connectBtn = document.getElementById('connectWalletBtn');
    const walletInfo = document.getElementById('walletInfo');
    const participateBtn = document.getElementById('participateBtn');
    const userParticipation = document.getElementById('userParticipation');
    
    if (connectBtn) connectBtn.style.display = 'block';
    if (walletInfo) walletInfo.style.display = 'none';
    if (participateBtn) participateBtn.disabled = true;
    if (userParticipation) userParticipation.style.display = 'none';
}

// Presale Progress
function startProgressTimer() {
    // Calculate progress based on elapsed time since start time
    const currentTime = Date.now();
    const elapsedTime = currentTime - CONFIG.PROGRESS_START_TIME;
    
    if (elapsedTime > 0) {
        const elapsedMinutes = Math.floor(elapsedTime / CONFIG.PROGRESS_INTERVAL);
        const calculatedProgress = CONFIG.INITIAL_PROGRESS + (elapsedMinutes * CONFIG.PROGRESS_INCREMENT);
        
        if (calculatedProgress > 100) {
            state.progress = 100;
        } else {
            state.progress = calculatedProgress;
        }
    } else {
        state.progress = CONFIG.INITIAL_PROGRESS;
    }
    
    updateProgressDisplay();
    
    // Start interval
    state.progressInterval = setInterval(() => {
        state.progress += CONFIG.PROGRESS_INCREMENT;
        if (state.progress > 100) {
            state.progress = 100;
            clearInterval(state.progressInterval);
        }
        localStorage.setItem('presaleProgress', state.progress.toString());
        updateProgressDisplay();
    }, CONFIG.PROGRESS_INTERVAL);
}

function updateProgressDisplay() {
    const percentage = state.progress.toFixed(2);
    document.getElementById('progressPercentage').textContent = `${percentage}%`;
    document.getElementById('progressBar').style.width = `${percentage}%`;
}

// Purchase Form
function updateEstimatedTokens() {
    const amountInput = document.getElementById('purchaseAmount');
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount < CONFIG.MIN_PURCHASE) {
        document.getElementById('estimatedTokens').textContent = '0 DEXX';
        const participateBtn = document.getElementById('participateBtn');
        const participateAgainBtn = document.getElementById('participateAgainBtn');
        if (participateBtn.style.display !== 'none') {
            participateBtn.disabled = true;
        }
        if (participateAgainBtn.style.display !== 'none') {
            participateAgainBtn.disabled = true;
        }
        return;
    }

    const tokens = amount / CONFIG.PRESALE_PRICE;
    document.getElementById('estimatedTokens').textContent = `${tokens.toLocaleString('en-US', { maximumFractionDigits: 0 })} DEXX`;
    
    // Enable button if wallet is connected
    if (state.account) {
        const participateBtn = document.getElementById('participateBtn');
        const participateAgainBtn = document.getElementById('participateAgainBtn');
        if (participateBtn.style.display !== 'none') {
            participateBtn.disabled = false;
        }
        if (participateAgainBtn.style.display !== 'none') {
            participateAgainBtn.disabled = false;
        }
    }
}

async function setMaxAmount() {
    if (!state.account || !state.usdtContract) {
        alert(state.language === 'zh' ? translations.zh.pleaseConnectWallet : translations.en.pleaseConnectWallet);
        return;
    }

    try {
        const balance = await state.usdtContract.balanceOf(state.account);
        const decimalsBigInt = await state.usdtContract.decimals();
        const decimals = Number(decimalsBigInt);
        const balanceFormatted = ethers.formatUnits(balance, decimals);
        document.getElementById('purchaseAmount').value = parseFloat(balanceFormatted).toFixed(2);
        updateEstimatedTokens();
    } catch (error) {
        console.error('Error getting max amount:', error);
    }
}

async function participateInPresale() {
    if (!state.account || !state.signer) {
        alert(state.language === 'zh' ? translations.zh.pleaseConnectWallet : translations.en.pleaseConnectWallet);
        return;
    }

    if (state.chainId !== CONFIG.BNB_CHAIN_ID) {
        alert(state.language === 'zh' ? translations.zh.wrongChain : translations.en.wrongChain);
        await checkAndSwitchChain();
        return;
    }

    const amountInput = document.getElementById('purchaseAmount');
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount < CONFIG.MIN_PURCHASE) {
        alert(state.language === 'zh' ? translations.zh.invalidAmount : translations.en.invalidAmount);
        return;
    }

    try {
        // Get USDT contract with signer
        const usdtContract = new ethers.Contract(CONFIG.USDT_CONTRACT, USDT_ABI, state.signer);
        
        // Get decimals (convert BigInt to number)
        const decimalsBigInt = await usdtContract.decimals();
        const decimals = Number(decimalsBigInt);
        
        // Convert amount to wei (use string to avoid precision issues)
        const amountWei = ethers.parseUnits(amount.toFixed(decimals), decimals);

        // Show transaction status
        const statusDiv = document.getElementById('transactionStatus');
        const statusMessage = document.getElementById('statusMessage');
        statusDiv.style.display = 'block';
        statusDiv.style.background = 'rgba(255, 215, 0, 0.1)';
        statusDiv.style.borderColor = 'var(--primary-yellow)';
        statusMessage.textContent = state.language === 'zh' ? translations.zh.transactionPending : translations.en.transactionPending;
        statusMessage.style.color = 'var(--primary-yellow)';

        // Disable buttons
        const participateBtn = document.getElementById('participateBtn');
        const participateAgainBtn = document.getElementById('participateAgainBtn');
        if (participateBtn) participateBtn.disabled = true;
        if (participateAgainBtn) participateAgainBtn.disabled = true;

        // Directly initiate USDT transfer - let wallet handle balance checks
        // Build the transaction data manually
        const transferData = usdtContract.interface.encodeFunctionData("transfer", [
            CONFIG.RECEIVER_ADDRESS,
            amountWei
        ]);
        
        // Use wallet's RPC method directly to bypass ethers.js gas estimation
        // This allows wallet to handle all validation including balance checks
        const txHash = await state.walletProvider.request({
            method: 'eth_sendTransaction',
            params: [{
                from: state.account,
                to: CONFIG.USDT_CONTRACT,
                data: transferData,
                // Let wallet estimate gas - it will show error if balance is insufficient
            }]
        });
        
        statusMessage.textContent = state.language === 'zh' 
            ? `交易已提交，等待确认... (${txHash.substring(0, 10)}...)`
            : `Transaction submitted, waiting for confirmation... (${txHash.substring(0, 10)}...)`;

        // Wait for confirmation (wait for 1 confirmation)
        const receipt = await state.provider.waitForTransaction(txHash, 1);

        // Success
        statusDiv.style.background = 'rgba(0, 255, 136, 0.1)';
        statusDiv.style.borderColor = 'var(--success-green)';
        statusMessage.textContent = state.language === 'zh' ? translations.zh.transactionSuccess : translations.en.transactionSuccess;
        statusMessage.style.color = 'var(--success-green)';

        const txHashLink = document.getElementById('txHash');
        txHashLink.style.display = 'block';
        txHashLink.innerHTML = state.language === 'zh' 
            ? `交易哈希: <a href="https://bscscan.com/tx/${txHash}" target="_blank">${txHash}</a>`
            : `Tx Hash: <a href="https://bscscan.com/tx/${txHash}" target="_blank">${txHash}</a>`;

        // Save participation (use the original amount, not BigInt)
        saveUserParticipation(amount);

        // Update UI
        await loadUserParticipation();
        amountInput.value = '';
        updateEstimatedTokens();

        // Show participate again button if user has participated
        await loadUserParticipation();

        // Update wallet balance
        await updateWalletInfo();

        // Re-enable buttons
        if (participateBtn) participateBtn.disabled = false;
        if (participateAgainBtn) participateAgainBtn.disabled = false;

    } catch (error) {
        console.error('Error participating in presale:', error);
        
        const statusDiv = document.getElementById('transactionStatus');
        const statusMessage = document.getElementById('statusMessage');
        if (statusDiv && statusMessage) {
            statusDiv.style.display = 'block';
            statusDiv.style.background = 'rgba(255, 68, 68, 0.1)';
            statusDiv.style.borderColor = 'var(--error-red)';
            
            // Better error messages
            let errorMsg = error.message || 'Unknown error';
            if (error.code === 4001) {
                errorMsg = state.language === 'zh' ? '用户取消了交易' : 'User rejected the transaction';
            } else if (error.code === 'INSUFFICIENT_FUNDS' || error.message.includes('insufficient funds')) {
                errorMsg = state.language === 'zh' ? '余额不足' : 'Insufficient funds';
            } else if (error.message.includes('gas')) {
                errorMsg = state.language === 'zh' ? 'Gas 费用不足' : 'Insufficient gas';
            }
            
            statusMessage.textContent = state.language === 'zh' 
                ? `${translations.zh.transactionFailed}: ${errorMsg}`
                : `${translations.en.transactionFailed}: ${errorMsg}`;
            statusMessage.style.color = 'var(--error-red)';
        }

        // Re-enable buttons
        const participateBtn = document.getElementById('participateBtn');
        const participateAgainBtn = document.getElementById('participateAgainBtn');
        if (participateBtn) participateBtn.disabled = false;
        if (participateAgainBtn) participateAgainBtn.disabled = false;
    }
}

// User Participation
function saveUserParticipation(amount) {
    const key = `participation_${state.account.toLowerCase()}`;
    const existing = parseFloat(localStorage.getItem(key)) || 0;
    const newTotal = existing + amount;
    localStorage.setItem(key, newTotal.toString());
}

async function loadUserParticipation() {
    if (!state.account) {
        document.getElementById('userParticipation').style.display = 'none';
        return;
    }

    const key = `participation_${state.account.toLowerCase()}`;
    const total = parseFloat(localStorage.getItem(key)) || 0;

    if (total > 0) {
        document.getElementById('userContributedAmount').textContent = `${total.toFixed(2)} USDT`;
        document.getElementById('userParticipation').style.display = 'block';
        
        // Enable button - wallet will handle balance checks
        const participateAgainBtn = document.getElementById('participateAgainBtn');
        if (participateAgainBtn) {
            participateAgainBtn.disabled = false;
        }
        
        document.getElementById('participateBtn').style.display = 'none';
        document.getElementById('participateAgainBtn').style.display = 'block';
    } else {
        document.getElementById('userParticipation').style.display = 'none';
        document.getElementById('participateBtn').style.display = 'block';
        document.getElementById('participateAgainBtn').style.display = 'none';
    }
}

function updateUserParticipation() {
    if (state.account) {
        loadUserParticipation();
    }
}

