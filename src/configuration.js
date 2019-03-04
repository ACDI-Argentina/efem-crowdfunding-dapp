const {
  REACT_APP_ENVIRONMENT = 'localhost', // optional
  REACT_APP_DECIMALS = 8, // optional
  REACT_APP_FEATHERJS_CONNECTION_URL,
  REACT_APP_NODE_CONNECTION_URL,
  REACT_APP_LIQUIDPLEDGING_ADDRESS,
  REACT_APP_CAMPAIGN_FACTORY_ADDRESS,
  REACT_APP_CAPPED_MILESTONE_FACTORY_ADDRESS,
  REACT_APP_TOKEN_ADDRESSES,
  REACT_APP_BLOCKEXPLORER,
  REACT_APP_BUGS_EMAIL = 'bugs@giveth.io',
  REACT_APP_NETWORK_NAME,
  REACT_APP_NATIVE_TOKEN_NAME,
  REACT_APP_NODE_ID,
} = process.env;

const configurations = {
  localhost: {
    title: 'localhost',
    liquidPledgingAddress: '0x46579394802b5e4d2C0647436BFcc71A2d9E8478',
    lppCampaignFactoryAddress: '0xe3155F7A49897e7860476b5A625B258ebe43cA98',
    lppCappedMilestoneFactoryAddress: '0x1b6E4a9eB8264E46784a782c87e3529E203425Ca',
    nodeConnection: 'http://localhost:8545',
    networkName: 'ganache',
    nodeId: 88,
    etherscan: 'https://explorer.testnet.rsk.co/', // this won't work, only here so we can see links during development
    feathersConnection: 'http://localhost:3030',
    ipfsGateway: 'http://localhost:8080/ipfs/',
    sendErrors: false,
    analytics: {
      ga_UA: 'UA-103956937-3',
      useGoogleAnalytics: true,
      useHotjar: false,
    },
    nativeTokenName: 'ETH',
  },
  rsk_testnet: {
    title: 'RSK Testnet',
    liquidPledgingAddress: '0xD508e76d8bAEE8C17b4863853529a40b516B6cC6',
    lppCampaignFactoryAddress: '0xee0702b32772A3C08F67Dc3F4A7dfd080Fc767BE',
    lppCappedMilestoneFactoryAddress: '0xc15477be9bd65db3E94AC3Ab6C88683AA8460c27',
    nodeConnection: 'https://node.giveth.site',
    networkName: 'rsk_testnet',
    nodeId: 31,
    etherscan: 'https://explorer.testnet.rsk.co/',
    feathersConnection: 'https://feathers.dapp.giveth.site',
    ipfsGateway: 'https://feathers.b4h.world',
    sendErrors: false,
    analytics: {
      ga_UA: 'UA-103956937-3',
      useGoogleAnalytics: false,
      useHotjar: false,
    },
    nativeTokenName: 'BTC',
  },
  rsk_mainnet: {
    title: 'RSK MainNet',
    liquidPledgingAddress: '0x86Fd7661114Ca0Cf959337CB7DAFbBE93dB248d2',
    lppCampaignFactoryAddress: '0xB874E4B1F4DBEEBCBdB8150EA8c71c3E96FCb40E',
    lppCappedMilestoneFactoryAddress: '0x95655dC505233d40e2c5A1d4590d142C8a721cb4',
    nodeConnection: 'https://node.b4h.world',
    networkName: 'rsk_mainnet',
    nodeId: 30,
    etherscan: 'https://explorer.rsk.co/',
    feathersConnection: 'https://feathers.b4h.world',
    ipfsGateway: 'https://ipfs.b4h.world/ipfs/',
    sendErrors: true,
    analytics: {
      ga_UA: 'UA-103956937-3',
      useGoogleAnalytics: false,
      useHotjar: false,
    },
    nativeTokenName: 'BTC',
  },
};

// Unknown environment
if (configurations[REACT_APP_ENVIRONMENT] === undefined)
  throw new Error(
    `There is no configuration object for environment: ${REACT_APP_ENVIRONMENT}. Expected REACT_APP_ENVIRONMENT to be empty or one of: ${Object.keys(
      configurations,
    )}`,
  );

// Create config object based on environment setup
const config = Object.assign({}, configurations[REACT_APP_ENVIRONMENT]);

// Overwrite the environment values with parameters
config.liquidPledgingAddress = REACT_APP_LIQUIDPLEDGING_ADDRESS || config.liquidPledgingAddress;
config.campaignFactoryAddress =
  REACT_APP_CAMPAIGN_FACTORY_ADDRESS || config.lppCampaignFactoryAddress;
config.cappedMilestoneFactoryAddress =
  REACT_APP_CAPPED_MILESTONE_FACTORY_ADDRESS || config.lppCappedMilestoneFactoryAddress;
config.tokenAddresses = REACT_APP_TOKEN_ADDRESSES
  ? JSON.parse(REACT_APP_TOKEN_ADDRESSES)
  : config.tokenAddresses;
config.etherscan = REACT_APP_BLOCKEXPLORER || config.etherscan;
config.feathersConnection = REACT_APP_FEATHERJS_CONNECTION_URL || config.feathersConnection;
config.nodeConnection = REACT_APP_NODE_CONNECTION_URL || config.nodeConnection;
config.decimals = REACT_APP_DECIMALS;
config.bugsEmail = REACT_APP_BUGS_EMAIL;
config.networkName = REACT_APP_NETWORK_NAME || config.networkName;
config.nodeId = (REACT_APP_NODE_ID && Number.parseInt(REACT_APP_NODE_ID, 10)) || config.nodeId;
config.nativeTokenName = REACT_APP_NATIVE_TOKEN_NAME || config.nativeTokenName;

config.sendErrors = ['develop', 'release', 'beta', 'rsk_testnet'].includes(REACT_APP_ENVIRONMENT);

export default config;
