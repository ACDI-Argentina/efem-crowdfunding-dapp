import React, { Component, createContext } from 'react';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';

import getWeb3 from '../lib/blockchain/getWeb3';
import pollEvery from '../lib/pollEvery';
import config from '../configuration';

import { connect } from 'react-redux'
import { initCurrentUser } from '../redux/reducers/currentUserSlice';

import Web3Utils from "../utils/Web3Utils";

const POLL_DELAY_ACCOUNT = 1000;
const POLL_DELAY_NETWORK = 2000;

const Context = createContext();
const { Provider, Consumer } = Context;

const getAccount = async web3 => {
  try {
    const addrs = await web3.eth.getAccounts();
    if (addrs.length > 0) return addrs[0];
  } catch (e) {
    // ignore
  }
  return undefined;
};

const pollAccount = pollEvery((web3, { onAccount = () => {}, onBalance = () => {} } = {}) => {
  let lastAccount = -1;
  let lastBalance = new BigNumber(-1);
  return {
    request: async () => {
      try {
        const account = await getAccount(web3);
        if (!account) {
          throw new Error('no account');
        }
        const balance = await web3.eth.getBalance(account);
        return {
          account,
          balance: new BigNumber(balance),
        };
      } catch (e) {
        return {
          balance: new BigNumber(0),
        };
      }
    },
    onResult: ({ account, balance }) => {
      if (account !== lastAccount) {
        lastAccount = account;
        onAccount(account);
      }
      if (!balance.eq(lastBalance)) {
        lastBalance = balance;
        onBalance(balance);
      }
    },
  };
}, POLL_DELAY_ACCOUNT);

const fetchNetwork = async web3 => ({
  networkId: await web3.eth.net.getId(),
  networkType: await web3.eth.net.getNetworkType(),
});

const getNetworkState = (networkId, networkType) => ({
  isCorrectNetwork: networkId === config.nodeId,
  currentNetwork: networkType,
});

const pollNetwork = pollEvery((web3, { onNetwork = () => {} } = {}) => {
  let lastNetworkId;
  return {
    request: () => fetchNetwork(web3),
    onResult: ({ networkId, networkType }) => {
      if (networkId !== lastNetworkId) {
        lastNetworkId = networkId;
        onNetwork(networkId, networkType);
      }
    },
  };
}, POLL_DELAY_NETWORK);

class Web3Provider extends Component {
  constructor() {
    super();

    this.state = {
      account: undefined,
      balance: new BigNumber(0),
      currentNetwork: undefined,
      validProvider: false,
      isCorrectNetwork: false,
      isEnabled: false,
      setupTimeout: false,
    };

    this.enableTimedout = false;

    this.enableProvider = this.enableProvider.bind(this);
  }


 
  componentDidUpdate(prevProps,prevState) {

    const currentAccount = this.state.account;
    const prevAccount = prevState.account;

    if (Web3Utils.areDistinctAccounts(currentAccount, prevAccount)) {
      console.log("Load user with account:", currentAccount);
      this.props.initCurrentUser();
    }
  }


  componentWillMount() { //Necesita algo del DOM o lo podemos poner en el DidMount?
    getWeb3().then(web3 => {
      this.setState({validProvider: !web3.defaultNode,});

      pollNetwork(web3, {
        onNetwork: (networkId, networkType) => {
          this.setState(getNetworkState(networkId, networkType));
        },
      });

      if (!web3.defaultNode) {
        pollAccount(web3, {
          onAccount: async account => {
            // TODO: find a way for non metamask providers to check they are allowed
            const isEnabled = web3.currentProvider._metamask
              ? await web3.currentProvider._metamask.isApproved()
              : true;
            this.setState({
              account,
              isEnabled,
            });
          },
          onBalance: balance => {
            this.setState({
              balance,
            });
          },
        });
      }
    });

    this.enableProvider();
  }

  showErrorOnProvider() {
    React.swal({
      title: 'Web3 Connection Error',
      icon: "warning",
      text: "Unable to connect to the web3 provider. Please check if your MetaMask or other wallet is " +
        "connected to a valid network. If so try and restart your browser or open the DApp in " +
        "private window."
    });
    this.setState({ setupTimeout: true }, () => this.props.onLoaded());
  }


  async enableProvider() {
    // we set this timeout b/c if the provider is connected to an invalid network,
    // any rpc calls will hang
    const timeout = setTimeout(() => this.showErrorOnProvider(), 5000);

    const web3 = await getWeb3();
    clearTimeout(timeout);
    this.props.onLoaded();

    const { networkId, networkType } = await fetchNetwork(web3);
    this.setState(getNetworkState(networkId, networkType), _ => {
      if(!this.state.isCorrectNetwork){
        this.showErrorOnProvider();
      }
    });

    // clear timeout here b/c we have successfully made an rpc call thus we are
    // successfully connected to a network
    clearTimeout(timeout);

    if (web3.isEnabled) {
      const account = await getAccount(web3);
      this.setState({
        isEnabled: true,
        account: account
      },
        () => this.props.onLoaded(),
      );
      return;
    }

    let isEnabled = false;
    let account;
    let balance;

    const timeoutId = setTimeout(async () => {
      const currentProviderMetamask = web3.currentProvider._metamask;

      const isEnabled = currentProviderMetamask ? await web3.currentProvider._metamask.isApproved() : false;
      
      this.setState({ isEnabled: isEnabled },() => this.props.onLoaded());
      this.enableTimedout = true;
    }, 5000);

    try {
      const accounts = await web3.enable(this.enableTimedout);
      clearTimeout(timeoutId);
      isEnabled = true;
      account = accounts.length ? accounts[0] : undefined;
      if (account) {
        balance = new BigNumber(await web3.eth.getBalance(account));
      }
    } catch (e) {
      // ignore
    }

    this.setState({ isEnabled, account, balance }, () => this.props.onLoaded({ isEnabled, account, balance }));
  }

  render() {
    const {
      account,
      balance,
      currentNetwork,
      validProvider,
      isCorrectNetwork,
      isEnabled,
      setupTimeout,
    } = this.state;

    return (
      <Provider
        value={{
          state: {
            failedToLoad: setupTimeout,
            account,
            balance,
            currentNetwork,
            validProvider,
            isCorrectNetwork,
            isEnabled,
          },
          actions: {
            enableProvider: this.enableProvider,
          },
        }}
      >
        {this.props.children}
      </Provider>
    );
  }
}

Web3Provider.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  onLoaded: PropTypes.func.isRequired,
};

Web3Provider.defaultProps = {};

export { Consumer };

export default connect(null, { initCurrentUser })(Web3Provider);


