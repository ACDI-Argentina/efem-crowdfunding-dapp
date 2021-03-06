import Web3 from 'web3';
import Web3HttpProvider from 'web3-providers-http';
import config from '../../configuration';

let web3;
export default () =>
  new Promise(async resolve => {
    if (!web3) {

      let web3Wallet;
      let web3Http;
      let isThereWallet = false;
      let walletNetworkId = null;
      let walletIsCorrectNetwork = false;
      
      if (window.ethereum) {
        web3Wallet = new Web3(window.ethereum);
        isThereWallet = true;
        walletNetworkId = await web3Wallet.eth.net.getId();
        console.log('Configuración Web3: Modern Browser Ethereum Provider.');
      }

      if (walletNetworkId === config.network.requiredId) {

        // La wallet está instalada y configurada con la red correcta.
        walletIsCorrectNetwork = true;

      } else {

        // La wallet no está instalada o la red es incorrecta.
        walletIsCorrectNetwork = false;
        
        var web3HttpProvider = new Web3HttpProvider(config.network.nodeUrl, {
          keepAlive: true,
          timeout: config.network.timeout,
        });
        web3Http = new Web3(web3HttpProvider);
        console.log('Configuración Web3: HTTP Provider.', web3HttpProvider);
      }

      if(web3Http) {
        web3 = web3Http;
      } else {
        web3 = web3Wallet;
      }
      web3.isThereWallet = isThereWallet;
      web3.walletNetworkId = walletNetworkId;
      web3.walletIsCorrectNetwork = walletIsCorrectNetwork;
      
      console.log('Configuración Web3', web3);
    }
    resolve(web3);
  });

/*let enablePromise;
function enable(force = false) {
  if (!force && enablePromise) return enablePromise;
  return new Promise((resolve, reject) =>
    this.currentProvider.enable()
      .then(addrs => {
        this.isEnabled = true;
        resolve(addrs);
      })
      .catch(e => {
        enablePromise = false;
        this.isEnabled = false;
        reject(e);
      }),
  );
}*/