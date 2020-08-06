import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Avatar from 'react-avatar';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import ReactHtmlParser from 'react-html-parser';
import BigNumber from 'bignumber.js';

import Balances from 'components/Balances';
import { feathersClient } from '../../lib/feathersClient';
import Loader from '../Loader';
import MilestoneCard from '../MilestoneCard';
import GoBackButton from '../GoBackButton';
import { isOwner, getUserName, getUserAvatar } from '../../lib/helpers';
import { checkBalance } from '../../lib/middleware';
import BackgroundImageHeader from '../BackgroundImageHeader';
import DonateButton from '../DonateButton';
import Campaign from '../../models/Campaign';
import config from '../../configuration';
import CommunityButton from '../CommunityButton';
import DelegateMultipleButton from '../DelegateMultipleButton';
import ListDonations from '../ListDonations';
import User from '../../models/User';
import CampaignService from '../../services/CampaignService';
import ErrorBoundary from '../ErrorBoundary';
import { connect } from 'react-redux'
import { selectCampaign } from '../../redux/reducers/campaignsSlice'
import { selectMilestonesByCampaign } from '../../redux/reducers/milestonesSlice';
import { selectDonationsByEntity } from '../../redux/reducers/donationsSlice';

/**
 * The Campaign detail view mapped to /campaing/id
 *
 * @param currentUser  Currently logged in user information
 * @param history      Browser history object
 * @param balance      User's current balance
 */
class ViewCampaign extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      isLoading: true,
      //isLoadingMilestones: true,
      isLoadingMilestones: false,
      isLoadingDonations: true,
      donations: [],
      milestones: props.milestones,
      milestonesLoaded: 0,
      milestonesTotal: 0,
      milestonesPerBatch: 50,
      donationsTotal: 0,
      donationsPerBatch: 50,
      newDonations: 0,
    };

    //this.loadMoreMilestones = this.loadMoreMilestones.bind(this);
    this.loadMoreDonations = this.loadMoreDonations.bind(this);
  }

  componentDidMount() {
    this.setState({
      campaign: this.props.campaign,
      milestones: this.props.milestones,
      isLoading: false
    });

    //this.loadMoreMilestones(this.props.campaign.id);

    this.loadMoreDonations();
    // subscribe to donation count
    this.donationsObserver = CampaignService.subscribeNewDonations(
      this.props.campaign.id,
      newDonations =>
        this.setState({
          newDonations,
        }),
      () => this.setState({ newDonations: 0 }),
    );
  }

  componentWillUnmount() {
    if (this.donationsObserver) this.donationsObserver.unsubscribe();
  }

  loadMoreDonations() {
    this.setState({ isLoadingDonations: true }, () =>
      CampaignService.getDonations(
        this.props.match.params.id,
        this.state.donationsPerBatch,
        this.state.donations.length,
        (donations, donationsTotal) =>
          this.setState(prevState => ({
            donations: prevState.donations.concat(donations),
            isLoadingDonations: false,
            donationsTotal,
          })),
        () => this.setState({ isLoadingDonations: false }),
      ),
    );
  }

  /*loadMoreMilestones(campaignId = this.props.match.params.id) {
    this.setState({ isLoadingMilestones: true }, () =>
      CampaignService.getMilestones(
        campaignId,
        this.state.milestonesPerBatch,
        this.state.milestonesLoaded,
        (milestones, milestonesTotal) =>
          this.setState(prevState => ({
            milestones: prevState.milestones.concat(milestones),
            isLoadingMilestones: false,
            milestonesTotal,
            milestonesLoaded: prevState.milestonesLoaded + milestones.length,
          })),
        () => this.setState({ isLoadingMilestones: false }),
      ),
    );
  }*/

  removeMilestone(id) {
    checkBalance(this.props.balance)
      .then(() => {
        React.swal({
          title: 'Delete Milestone?',
          text: 'You will not be able to recover this milestone!',
          icon: 'warning',
          dangerMode: true,
        }).then(() => {
          const milestones = feathersClient.service('/milestones');
          milestones.remove(id);
        });
      })
      .catch(err => {
        if (err === 'noBalance') {
          // handle no balance error
        }
      });
  }

  render() {
    const { campaign, milestones, history, currentUser, balance } = this.props;
    const {
      isLoading,
      donations,
      isLoadingDonations,
      isLoadingMilestones,
      milestonesLoaded,
      milestonesTotal,
      donationsTotal,
      newDonations,
    } = this.state;
    if (!isLoading && !campaign) return <p>Unable to find a campaign</p>;
    return (
      <ErrorBoundary>
        <div id="view-campaign-view">
          {isLoading && <Loader className="fixed" />}

          {!isLoading && (
            <div>
              <BackgroundImageHeader image={campaign.imageCidUrl} height={300}>
                <h6>Campaign</h6>
                <h1>{campaign.title}</h1>
                {<DonateButton
                  model={{
                    type: Campaign.type,
                    title: campaign.title,
                    entityId: campaign.id,
                    token: { symbol: config.nativeTokenName }
                  }}
                  currentUser={currentUser}
                  history={history}
                />}
                {currentUser && currentUser.authenticated && (
                  <DelegateMultipleButton
                    style={{ padding: '10px 10px' }}
                    campaign={campaign}
                    balance={balance}
                    currentUser={currentUser}
                  />
                )}
                {campaign.url && (
                  <CommunityButton className="btn btn-secondary" url={campaign.url}>
                    Join our community
                  </CommunityButton>
                )}
              </BackgroundImageHeader>

              <div className="container-fluid">
                <div className="row">
                  <div className="col-md-8 m-auto">
                    <GoBackButton to="/" title="Campaigns" />

                    <center>
                      <Link to={`/profile/${campaign.managerAddress}`}>
                        <Avatar size={50} src={getUserAvatar(campaign.managerAddress)} round />
                        <p className="small">{getUserName(campaign.managerAddress)}</p>
                      </Link>
                    </center>

                    <div className="card content-card ">
                      <div className="card-body content">
                        {ReactHtmlParser(campaign.description)}
                      </div>
                    </div>

                    <div className="milestone-header spacer-top-50 card-view">
                      <h3>Milestones</h3>
                      {isOwner(campaign.managerAddress, currentUser) && (
                        <Link
                          className="btn btn-primary btn-sm pull-right"
                          to={`/campaigns/${campaign.id}/milestones/new`}
                        >
                          Add Milestone
                        </Link>
                      )}

                      {!isOwner(campaign.managerAddress, currentUser) && currentUser && (
                        <Link
                          className="btn btn-primary btn-sm pull-right"
                          to={`/campaigns/${campaign.id}/milestones/propose`}
                        >
                          Propose Milestone
                        </Link>
                      )}

                      {isLoadingMilestones && milestonesTotal === 0 && (
                        <Loader className="relative" />
                      )}
                      <ResponsiveMasonry
                        columnsCountBreakPoints={{
                          0: 1,
                          470: 2,
                          900: 3,
                          1200: 4,
                        }}
                      >
                        <Masonry gutter="10px">
                          {milestones.map(m => (
                            <MilestoneCard
                              milestone={m}
                              currentUser={currentUser}
                              key={m._id}
                              history={history}
                              balance={balance}
                              removeMilestone={() => this.removeMilestone(m._id)}
                            />
                          ))}
                        </Masonry>
                      </ResponsiveMasonry>

                      {milestonesLoaded < milestonesTotal && (
                        <center>
                          <button
                            type="button"
                            className="btn btn-info"
                            onClick={() => this.loadMoreMilestones()}
                            disabled={isLoadingMilestones}
                          >
                            {isLoadingMilestones && (
                              <span>
                                <i className="fa fa-circle-o-notch fa-spin" /> Loading
                              </span>
                            )}
                            {!isLoadingMilestones && <span>Load More</span>}
                          </button>
                        </center>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row spacer-top-50 spacer-bottom-50">
                  <div className="col-md-8 m-auto">
                    <Balances entity={campaign} />

                    <ListDonations
                      entityId={campaign.id}
                      isLoading={isLoadingDonations}
                      total={donationsTotal}
                      loadMore={this.loadMoreDonations}
                      newDonations={newDonations}
                    />
                    {/*<DonateButton
                      model={{
                        type: Campaign.type,
                        title: campaign.title,
                        id: campaign.id,
                        adminId: campaign.projectId,
                        token: { symbol: config.nativeTokenName },
                      }}
                      currentUser={currentUser}
                      history={history}
                    />*/}
                  </div>
                </div>
                <div className="row spacer-top-50 spacer-bottom-50">
                  <div className="col-md-8 m-auto">
                    <h4>Campaign Reviewer</h4>
                    {campaign && campaign.reviewerAddress && (
                      <Link to={`/profile/${campaign.reviewerAddress}`}>
                        {getUserName(campaign.reviewerAddress)}
                      </Link>
                    )}
                    {(!campaign || !campaign.reviewerAddress) && <span>Unknown user</span>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ErrorBoundary>
    );
  }
}

ViewCampaign.propTypes = {
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
  }).isRequired,
  currentUser: PropTypes.instanceOf(User),
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }).isRequired,
  }).isRequired,
  balance: PropTypes.instanceOf(BigNumber).isRequired,
};

ViewCampaign.defaultProps = {
  currentUser: undefined,
};

const mapStateToProps = (state, ownProps) => {
  return {
    campaign: selectCampaign(state, ownProps.match.params.id),
    milestones: selectMilestonesByCampaign(state, ownProps.match.params.id),
    donations: selectDonationsByEntity(state, ownProps.match.params.id)
  }
}

export default connect(mapStateToProps)(ViewCampaign)