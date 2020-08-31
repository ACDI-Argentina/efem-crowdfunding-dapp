import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactHtmlParser, { convertNodeToElement } from 'react-html-parser';
import BigNumber from 'bignumber.js';
import User from 'models/User';
import MilestoneActions from '../MilestoneActions';
import BackgroundImageHeader from '../BackgroundImageHeader';
import DonateButton from '../DonateButton';
import GoBackButton from '../GoBackButton';
import TableDonations from '../TableDonations';
import Loader from '../Loader';
import MilestoneActivities from '../MilestoneActivities';
// import DelegateMultipleButton from '../DelegateMultipleButton';
import Milestone from '../../models/Milestone';
import { connect } from 'react-redux'
import { selectCampaign } from '../../redux/reducers/campaignsSlice'
import { selectMilestone } from '../../redux/reducers/milestonesSlice';
import FiatAmount from '../FiatAmount';
import ProfileCard from '../ProfileCard';
import Campaign from '../../models/Campaign';
import StatusIndicator from '../StatusIndicator';
import { fetchDonationsByIds, selectDonationsByEntity } from '../../redux/reducers/donationsSlice'
import { fetchActivitiesByIds, selectActivitiesByMilestone } from '../../redux/reducers/activitiesSlice'
import { selectUser } from '../../redux/reducers/userSlice';
import DateViewer from '../DateViewer';

class ViewMilestone extends Component {
  constructor(props) {
    super(props);

    this.state = {
      //isLoading: true,
      isLoading: false,
      isLoadingDonations: true,
      donations: [],
      recipient: {},
      campaign: props.campaign,
      milestone: props.milestone,
      donationsTotal: 0,
      donationsPerBatch: 50,
      newDonations: 0,
    };
  }

  componentDidMount() {
    this.props.fetchActivitiesByIds(this.props.milestone.activityIds);
    this.props.fetchDonationsByIds(this.props.milestone.donationIds);
  }
  
  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (JSON.stringify(this.props.milestone.donationIds) !== JSON.stringify(prevProps.milestone.donationIds)) {
      this.props.fetchDonationsByIds(this.props.milestone.donationIds);
    }
  }

  isActiveMilestone() {
    return this.state.milestone.status === 'InProgress';
  }

  renderDescription() {
    return ReactHtmlParser(this.props.milestone.description, {
      transform(node, index) {
        if (node.attribs && node.attribs.class === 'ql-video') {
          return (
            <div className="video-wrapper" key={index}>
              {convertNodeToElement(node, index)}
            </div>
          );
        }
        return undefined;
      },
    });
  }

  render() {
    const { donations, activities, history, user, balance, campaign, milestone } = this.props;
    
    const {
      isLoading,
      
      isLoadingDonations,
      //campaign,
      //milestone,
      recipient,
      donationsTotal,
      newDonations,
    } = this.state;

    return (
      <div id="view-milestone-view">
        {isLoading && <Loader className="fixed" />}

        {!isLoading && (
          <div>
            <BackgroundImageHeader image={milestone.imageCidUrl} height={300}>
              <h6>Milestone</h6>
              <h1>{milestone.title}</h1>

              {!milestone.status === 'InProgress' && <p>This milestone is not active anymore</p>}

              <p>Campaign: {campaign.title} </p>

              <div className="milestone-actions">
                {milestone.id && <DonateButton
                  entityType={Milestone.type}                 
                  entityId={milestone.id}
                  title={milestone.title}
                  enabled={milestone.receiveFunds}
                />}
                {/*this.isActiveMilestone() && (
                  <Fragment>
                    {user && (
                      <DelegateMultipleButton
                        milestone={milestone}
                        campaign={campaign}
                        balance={balance}
                        user={user}
                      />
                    )}
                  </Fragment>
                )*/}

                {/* Milestone actions */}

                {user && (
                  <MilestoneActions milestone={milestone} user={user} balance={balance} />
                )}
              </div>
            </BackgroundImageHeader>

            <div className="container-fluid">
              <div className="row">
                <div className="col-md-8 m-auto">
                  <div>
                    <GoBackButton
                      history={history}
                      styleName="inline"
                      title={`Campaign: ${campaign.title}`}
                    />

                    <ProfileCard address={milestone.managerAddress}/>

                    <div className="card content-card">
                      <div className="card-body content">{this.renderDescription()}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row spacer-top-50">
                <div className="col-md-8 m-auto">
                  <div className="row">
                    <div className="col-md-6">
                      <h4>Details</h4>

                      <div className="card details-card">
                        <div>
                          <span className="label">Reviewer</span>
                          <small className="form-text">
                            This person will review the actual completion of the Milestone
                          </small>
                          <ProfileCard address={milestone.reviewerAddress} namePosition="right"/>
                        </div>
                        

                        <div className="form-group">
                          <span className="label">Recipient</span>
                          <small className="form-text">
                            Where the funds go after successful completion of the Milestone
                          </small>
                          <ProfileCard address={milestone.recipientAddress} namePosition="right"/>
                        </div>

                        {milestone.date && (
                          <div className="form-group">
                            <span className="label">Date of milestone</span>
                            <small className="form-text">
                              This date defines the fiat conversion rate
                            </small>
                            <DateViewer value={milestone.date}/>
                          </div>
                        )}

                        <div className="form-group">
                          <span className="label">Target amount to raise</span>
                          <small className="form-text">
                            The maximum amount that can be donated to this Milestone. Based on the
                            requested amount in fiat.
                          </small>
                          <FiatAmount amount={milestone.fiatAmountTarget}/>
                        </div>

                        <div className="form-group">
                          <span className="label">Amount donated</span>
                          <small className="form-text">
                            The amount currently donated to this Milestone
                          </small>
                          {/*milestone.currentBalance.toString()*/}
                        </div>

                        <div className="form-group">
                          <span className="label">Campaign</span>
                          <small className="form-text">
                            The campaign this milestone belongs to.
                          </small>
                          {campaign.title}
                        </div>

                        <div className="form-group">
                          <span className="label">Status</span>
                          <br />
                          <StatusIndicator status={milestone.status}></StatusIndicator>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <h4>Status updates</h4>
                      <MilestoneActivities activities={activities} milestone={milestone} balance={balance} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="row spacer-top-50 spacer-bottom-50">
                <div className="col-md-8 m-auto">
                  <TableDonations donations={donations}/>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

ViewMilestone.propTypes = {
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
  }).isRequired,
  user: PropTypes.instanceOf(User),
  balance: PropTypes.instanceOf(BigNumber).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      milestoneId: PropTypes.string.isRequired,
    }),
  }).isRequired,
};

ViewMilestone.defaultProps = {
  user: undefined,
  milestone: new Milestone(),
  campaign: new Campaign(),
  donations: []
};

const mapStateToProps = (state, ownProps) => {
  const reduxProps = {
    user: undefined,
    milestone: undefined,
    campaign: undefined,
    donations: []
  }
  reduxProps.user = selectUser(state);
  const milestoneId = parseInt(ownProps.match.params.milestoneId);
  reduxProps.milestone = selectMilestone(state, milestoneId);
  if(reduxProps.milestone) {
    reduxProps.campaign = selectCampaign(state, reduxProps.milestone.campaignId);
  }
  reduxProps.donations = selectDonationsByEntity(state, milestoneId);
  reduxProps.activities = selectActivitiesByMilestone(state, milestoneId);
  return reduxProps;
}

const mapDispatchToProps = { fetchDonationsByIds, fetchActivitiesByIds }

export default connect(mapStateToProps, mapDispatchToProps)(ViewMilestone)