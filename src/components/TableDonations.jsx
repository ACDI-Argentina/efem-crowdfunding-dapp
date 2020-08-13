import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import config from '../configuration';
import Loader from './Loader';
import ProfileCard from './ProfileCard';
import Donation from '../models/Donation';
import CryptoAmount from './CryptoAmount';

/**
 * Presenta una tabla de donaciones para una entidad.
 */
class TableDonations extends Component {

  constructor(props) {
    super(props);
    this.state = {
      donations: props.donations
    };
  }

  loadMore() {

  }

  render() {

    const { donations, isLoading, total, useAmountRemainding } = this.props;

    const hasProposedDelegation = donations.some(d => d.intendedProjectId);
    return (
      <div>
        <div>
          <h2 style={{ display: 'inline-block' }}>Donations</h2>
        </div>

        <div className="dashboard-table-view">
          {isLoading && total === 0 && <Loader className="relative" />}
          {donations.length > 0 && (
            <div className="table-container">
              <table className="table table-responsive table-hover" style={{ marginTop: 0 }}>
                <thead>
                  <tr>
                    <th className="td-date">Date</th>
                    <th>Status</th>
                    <th className="td-donations-amount">Amount</th>
                    <th className="td-user">Giver</th>
                    <th className="td-tx-address"></th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map(d => (
                    <tr key={d.clientId}>
                      
                      <td className="td-date">
                        {moment.unix(d.createdAt).format('MM/DD/YYYY hh:mm')}
                      </td>
                      
                      <td>
                        {d.isPending && (
                          <span>
                            <i className="fa fa-circle-o-notch fa-spin" />
                          &nbsp;
                          </span>
                        )}
                        {d.statusDescription}
                      </td>

                      <td className="td-donations-amount">
                        {/*useAmountRemainding ? Web3Utils.weiToEther(d.amountRemainding).toFixed(4) : Web3Utils.weiToEther(d.amount).toFixed(4)*/}
                        <CryptoAmount amount={d.amount} tokenAddress={d.tokenAddress}/>
                      </td>

                      <td className="td-user">
                        <ProfileCard address={d.giverAddress} namePosition="right"/>
                      </td>

                      {config.etherscan ? (
                        <td className="td-tx-address">
                          <a href={`${config.etherscan}address/${d.giverAddress}`}>
                            {d.giverAddress}
                          </a>
                        </td>
                      ) : (
                          <td className="td-tx-address">{d.giverAddress}</td>
                        )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {donations.length < total && (
                <center>
                  <button
                    type="button"
                    className="btn btn-info"
                    onClick={() => this.loadMore}
                    disabled={isLoading}
                  >
                    {isLoading && (
                      <span>
                        <i className="fa fa-circle-o-notch fa-spin" /> Loading
                      </span>
                    )}
                    {!isLoading && <span>Load More</span>}
                  </button>
                </center>
              )}
            </div>
          )}

          {!isLoading && donations.length === 0 && (
            <p>No donations have been made yet. Be the first to donate now!</p>
          )}
        </div>
      </div>
    );
  }
}

TableDonations.propTypes = {
  donations: PropTypes.arrayOf(PropTypes.instanceOf(Donation)).isRequired,
  isLoading: PropTypes.bool.isRequired,
  total: PropTypes.number.isRequired,
  useAmountRemainding: PropTypes.bool,
};

TableDonations.defaultProps = {
  useAmountRemainding: false,
  total: 0,
  isLoading: false
};

export default TableDonations;