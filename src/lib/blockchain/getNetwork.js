import { Crowdfunding, ExchangeRateProvider} from '@acdi/give4forests-crowdfunding-contract';
import { Crowdfunding, CrowdfundingAbi } from '@acdi/give4forests-crowdfunding-contract';
import getWeb3 from './getWeb3';
import config from '../../configuration';
import { feathersClient } from '../feathersClient';

// The minimum ABI to handle any ERC20 Token balance, decimals and allowance approval
const ERC20ABI = [
  // read balanceOf
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  // read decimals
  // {
  //   constant: true,
  //   inputs: [],
  //   name: 'decimals',
  //   outputs: [{ name: '', type: 'uint8' }],
  //   type: 'function',
  // },
  // set allowance approval
  {
    constant: false,
    inputs: [{ name: '_spender', type: 'address' }, { name: '_amount', type: 'uint256' }],
    name: 'approve',
    outputs: [{ name: 'success', type: 'bool' }],
    type: 'function',
  },
  // read allowance of a specific address
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }, { name: '_spender', type: 'address' }],
    name: 'allowance',
    outputs: [{ name: 'remaining', type: 'uint256' }],
    type: 'function',
  },
];

let network;

export default async () => {


  //console.log("ABI", CrowdfundingAbi);
  if (network) return network;

  const web3 = await getWeb3();

  network = Object.assign({}, config);

  // Definición de Smart Contract de Crowdfunding
  
  network.exrProviderP = crowdfunding.exchangeRateProvider().then(exrAddress => {
    console.log(`%cexchangeRateProviderAddress: ${exrAddress}`,"color:white;font-weight:bold");
    return new ExchangeRateProvider(web3,exrAddress);
  });

  console.log(`%ccrowdfudingAddress: ${network.crowdfundingAddress}`,"color:white;font-weight:bold");
  network.crowdfunding = new Crowdfunding(web3, network.crowdfundingAddress);
  network.crowdfundingRaw = new web3.eth.Contract(CrowdfundingAbi, network.crowdfundingAddress);

  network.tokens = {};
  const { tokenWhitelist } = await feathersClient.service('/whitelist').find();
  if (tokenWhitelist) {
    tokenWhitelist
      .filter(token => web3.utils.isAddress(token.address))
      .forEach(token => {
        network.tokens[token.address] = new web3.eth.Contract(ERC20ABI, token.address);
      });
  }

  return network;
};
