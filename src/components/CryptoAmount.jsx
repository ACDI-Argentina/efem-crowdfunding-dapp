
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';
import config from '../configuration';
import Web3Utils from '../utils/Web3Utils';

/**
 * Presenta una cantidad de dinero crypto.
 * 
 */
class CryptoAmount extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        let amountConfig = config.tokens[this.props.tokenAddress];
        let amount = Web3Utils.weiToEther(this.props.amount).toFixed(amountConfig.showDecimals);
        let symbol = amountConfig.symbol;
        return (
            <spam>
                {amount}{' '}{symbol}
            </spam>
        );
    }
}

CryptoAmount.propTypes = {
    /**
     * Cantidad de crypto medida en Wei
     */
    amount: PropTypes.instanceOf(BigNumber).isRequired,
    tokenAddress: PropTypes.string.isRequired,
};

CryptoAmount.defaultProps = {
    tokenAddress: config.nativeToken.address
};

export default CryptoAmount;