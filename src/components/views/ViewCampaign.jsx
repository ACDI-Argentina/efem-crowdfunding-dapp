import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import classNames from "classnames"
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'
import ReactHtmlParser from 'react-html-parser'
import Loader from '../Loader'
import MilestoneCard from '../MilestoneCard'
import GoBackButton from '../GoBackButton'
import { isOwner } from '../../lib/helpers'
import Donate from '../Donate'
import TransferCampaign from '../TransferCampaign'
import Campaign from '../../models/Campaign'
import CommunityButton from '../CommunityButton'
import DonationList from '../DonationList'
import DonationsBalance from '../DonationsBalance'
import User from '../../models/User'
import ErrorBoundary from '../ErrorBoundary'
import { connect } from 'react-redux'
import { selectCampaign,
  selectCascadeDonationsByCampaign,
  selectCascadeFiatAmountTargetByCampaign } from '../../redux/reducers/campaignsSlice'
import { selectMilestonesByCampaign } from '../../redux/reducers/milestonesSlice'
import ProfileCardMini from '../ProfileCardMini'
import CampaignCardMini from '../CampaignCardMini'
import { withTranslation } from 'react-i18next'
import EditCampaignButton from '../EditCampaignButton'
import Header from "components/Header/Header.js"
import Footer from "components/Footer/Footer.js"
import Parallax from "components/Parallax/Parallax.js"
import MainMenu from 'components/MainMenu'
import GridContainer from "components/Grid/GridContainer.js"
import GridItem from "components/Grid/GridItem.js"
import { withStyles } from '@material-ui/core/styles'
import styles from "assets/jss/material-kit-react/views/campaignView.js"
import Typography from '@material-ui/core/Typography'
import { Avatar, Box } from '@material-ui/core'
import OnlyCorrectNetwork from 'components/OnlyCorrectNetwork'

/**
 * The Campaign detail view mapped to /campaign/id
 *
 * @param currentUser  Currently logged in user information
 * @param history      Browser history object
 */
class ViewCampaign extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      isLoadingMilestones: false,
      milestones: props.milestones,
      milestonesLoaded: 0,
      milestonesTotal: 0,
      milestonesPerBatch: 50
    };
  }

  componentDidMount() {
    this.setState({
      campaign: this.props.campaign,
      milestones: this.props.milestones,
      isLoading: false
    });
  }

  /*componentDidMount() {
    this.props.fetchDonationsByIds(this.props.campaign.donationIds);
  }*/

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    /*if (JSON.stringify(this.props.campaign.donationIds) !== JSON.stringify(prevProps.campaign.donationIds)) {
      this.props.fetchDonationsByIds(this.props.campaign.donationIds);
    }*/
  }

  /*removeMilestone(id) {
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
  }*/

  render() {
    const { isLoading, isLoadingMilestones, milestonesLoaded, milestonesTotal } = this.state;
    const { classes, campaign, milestones, cascadeDonationIds, cascadeFiatAmountTarget, history, currentUser, t } = this.props;
    const { ...rest } = this.props;

    if (!isLoading && !campaign) return <p>Unable to find a campaign</p>;
    return (
      <ErrorBoundary>
        <div id="view-campaign-view">
          {isLoading && <Loader className="fixed" />}

          {!isLoading && (
            <div>
              <Header
                color="white"
                brand="Give4Forest"
                rightLinks={<MainMenu />}
                fixed
                changeColorOnScroll={{
                  height: 0,
                  color: "white"
                }}
                {...rest}
              />

              <Parallax medium>
                <div className={classes.container}>
                  <GridContainer justify="center" className={classes.headerContainer}>
                    <GridItem xs={12} sm={12} md={12}>
                      <Box display="flex" flexGrow={1} alignItems="center">
                        <Box>
                          <Avatar alt={campaign.title} className={classes.avatar} src={campaign.imageCidUrl} />
                        </Box>
                        <Box m={2} flexGrow={1}>
                          <h6 className={classes.entityType}>{t('campaign')}</h6>
                          <h3 className={classes.entityName}>{campaign.title}</h3>
                        </Box>
                        <Box>
                          <Donate
                            entityId={campaign.id}
                            entityCard={<CampaignCardMini campaign={campaign} />}
                            title={t('donateCampaignTitle')}
                            description={t('donateCampaignDescription')}
                            enabled={campaign.canReceiveFunds}>
                          </Donate>
                          <TransferCampaign campaign={campaign}></TransferCampaign>
                          <EditCampaignButton 
                            currentUser={currentUser}
                            campaign={campaign}
                            title={t('donateCampaignTitle')}
                            >
                          </EditCampaignButton>
                          {campaign.url && (
                            <span style={{ paddingLeft: '10px' }}>
                              <CommunityButton className="btn btn-secondary" url={campaign.url}>
                                Join our community
                              </CommunityButton>
                            </span>
                          )}
                        </Box>
                      </Box>
                    </GridItem>
                  </GridContainer>
                </div>
              </Parallax>

              <div className={classNames(classes.main, classes.mainRaised)}>
                <div>
                  <div className={classes.container}>

                    <GridContainer justify="center">
                      <GridItem xs={12} sm={12} md={8}>
                        <GoBackButton to="/" title={t("campaigns")} />

                        <ProfileCardMini address={campaign.managerAddress} />

                        <div className="card content-card ">
                          <div className="card-body content">
                            {ReactHtmlParser(campaign.description)}
                            {campaign.beneficiaries && (
                              <p>
                                  {t('campaignBeneficiariesLabel')}: {campaign.beneficiaries}
                              </p>
                            )}
                            {/*campaign.categories.length > 0 && (
                              <p>
                                  {t('campaignCategoriesLabel')}: {campaign.categories.join(', ')}
                              </p>
                            )*/}
                          </div>
                        </div>
                      </GridItem>
                    </GridContainer>

                    <GridContainer justify="center">
                      <GridItem xs={12} sm={12} md={8}>

                        <div className="milestone-header spacer-bottom-50 card-view">

                        <Box display="flex">
                            <Box my={2} flexGrow={1}>
                              <Typography variant="h5">
                                {t('milestones')}
                              </Typography>
                            </Box>
                            <Box my={2}>
                              {isOwner(campaign.managerAddress, currentUser) && (
                                <OnlyCorrectNetwork>
                                  <div>
                                    <Link
                                      className="btn btn-primary btn-sm pull-right"
                                      to={`/campaigns/${campaign.id}/milestones/new`}>
                                      Add Milestone
                                    </Link>
                                  </div>
                                </OnlyCorrectNetwork>                                
                              )}
                            </Box>
                          </Box>
                          
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
                                  key={m.clientId}
                                  history={history}
                                  removeMilestone={() => this.removeMilestone(m.clientId)}
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
                      </GridItem>
                    </GridContainer>

                    <GridContainer justify="center" className="spacer-bottom-50">
                      <GridItem xs={12} sm={12} md={8}>
	                      <DonationList donationIds={campaign.budgetDonationIds}></DonationList>
                      </GridItem>
                    </GridContainer>

                    <GridContainer justify="center" className="spacer-bottom-50">
                      <GridItem xs={12} sm={12} md={8}>
	                      <DonationsBalance donationIds={cascadeDonationIds} fiatTarget={cascadeFiatAmountTarget}></DonationsBalance>
                      </GridItem>
                    </GridContainer>

                    <GridContainer justify="center">
                      <GridItem xs={12} sm={12} md={8}>
                        <h4>Campaign Reviewer</h4>
                        <ProfileCardMini address={campaign.reviewerAddress} />
                      </GridItem>
                    </GridContainer>

                  </div>
                </div>
              </div>
            </div>
          )}
          <Footer />
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
  }).isRequired
};

ViewCampaign.defaultProps = {
  currentUser: undefined,
  campaign: new Campaign(),
  milestones: [],
  //donations: []
};

const mapStateToProps = (state, ownProps) => {
  const campaignId = parseInt(ownProps.match.params.id);
  return {
    campaign: selectCampaign(state, campaignId),
    milestones: selectMilestonesByCampaign(state, campaignId),
    cascadeDonationIds: selectCascadeDonationsByCampaign(state, campaignId),
    cascadeFiatAmountTarget: selectCascadeFiatAmountTargetByCampaign(state, campaignId)
  }
}

const mapDispatchToProps = { }

export default connect(mapStateToProps, mapDispatchToProps)(
  (withStyles(styles)(withTranslation() (ViewCampaign)))
)
