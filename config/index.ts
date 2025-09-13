export interface StarknetDomain {
  name: string;
  version: string;
  chainId: string;
  revision: string;
}

export interface EndpointConfig {
  chainRpcUrl: string;
  apiBaseUrl: string;
  streamUrl: string;
  onboardingUrl: string;
  signingDomain: string;
  collateralAssetContract: string;
  assetOperationsContract: string;
  collateralAssetOnChainId: string;
  collateralDecimals: number;
  collateralAssetId: string;
  starknetDomain: StarknetDomain;
}

export const TRADING_API_URL_DEV = 'http://api.testnet.extended.exchange/api/v1';
export const STREAM_API_URL_DEV = 'wss://api.testnet.extended.exchange/stream.extended.exchange/v1';

export const BTC_USD_MARKET = 'BTC-USD';
export const SOL_USD_MARKET = 'SOL-USD';
export const ADA_USD_MARKET = 'ADA-USD';
export const ETH_USD_MARKET = 'ETH-USD';

export const DEFAULT_REQUEST_TIMEOUT_SECONDS = 500;
export const SDK_VERSION = '1.0.0';
export const USER_AGENT = `X10TypeScriptTradingClient/${SDK_VERSION}`;

export const TESTNET_CONFIG: EndpointConfig = {
  chainRpcUrl: 'https://rpc.sepolia.org',
  apiBaseUrl: 'https://api.starknet.sepolia.extended.exchange/api/v1',
  streamUrl: 'wss://starknet.sepolia.extended.exchange/stream.extended.exchange/v1',
  onboardingUrl: 'https://api.starknet.sepolia.extended.exchange',
  signingDomain: 'starknet.sepolia.extended.exchange',
  collateralAssetContract: '',
  assetOperationsContract: '',
  collateralAssetOnChainId: '',
  collateralDecimals: 6,
  starknetDomain: {
    name: 'Perpetuals',
    version: 'v0',
    chainId: 'SN_SEPOLIA',
    revision: '1',
  },
  collateralAssetId: '0x1',
};

export const MAINNET_CONFIG: EndpointConfig = {
  chainRpcUrl: 'https://cloudflare-eth.com',
  apiBaseUrl: 'https://api.extended.exchange/api/v1',
  streamUrl: 'wss://api.extended.exchange/stream.extended.exchange/v1',
  onboardingUrl: 'https://api.extended.exchange',
  signingDomain: 'extended.exchange',
  collateralAssetContract: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  assetOperationsContract: '0x1cE5D7f52A8aBd23551e91248151CA5A13353C65',
  collateralAssetOnChainId: '0x2893294412a4c8f915f75892b395ebbf6859ec246ec365c3b1f56f47c3a0a5d',
  collateralDecimals: 6,
  collateralAssetId: '0x1',
  starknetDomain: {
    name: 'Perpetuals',
    version: 'v0',
    chainId: 'SN_MAINNET',
    revision: '1',
  },
};

export const MAINNET_CONFIG_LEGACY_SIGNING_DOMAIN: EndpointConfig = {
  ...MAINNET_CONFIG,
  signingDomain: 'x10.exchange',
};

export const STARKNET_MAINNET_CONFIG: EndpointConfig = {
  chainRpcUrl: '',
  apiBaseUrl: 'https://api.starknet.extended.exchange/api/v1',
  streamUrl: 'wss://api.starknet.extended.exchange/stream.extended.exchange/v1',
  onboardingUrl: 'https://api.starknet.extended.exchange',
  signingDomain: 'extended.exchange',
  collateralAssetContract: '',
  assetOperationsContract: '',
  collateralAssetOnChainId: '0x1',
  collateralDecimals: 6,
  starknetDomain: {
    name: 'Perpetuals',
    version: 'v0',
    chainId: 'SN_MAIN',
    revision: '1',
  },
  collateralAssetId: '0x1',
};