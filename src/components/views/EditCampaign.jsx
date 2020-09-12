import React, { Component } from 'react';
import { Prompt } from 'react-router-dom';
import PropTypes from 'prop-types';
import 'react-input-token/lib/style.css';
import { Form, Input } from 'formsy-react-components';
import Loader from '../Loader';
import QuillFormsy from '../QuillFormsy';
import SelectUsers from '../SelectUsers';

import FormsyImageUploader from '../FormsyImageUploader';
import GoBackButton from '../GoBackButton';
import { isOwner, history } from '../../lib/helpers';
import { authenticateIfPossible, checkProfile } from '../../lib/middleware';
import LoaderButton from '../LoaderButton';
import User from '../../models/User';
import Campaign from '../../models/Campaign';

import { connect } from 'react-redux'
import { selectCurrentUser } from '../../redux/reducers/currentUserSlice';
import { campaignReviewers } from '../../redux/reducers/usersRolesSlice';
import { saveCampaign } from '../../redux/reducers/campaignsSlice'
import { CAMPAIGN_REVIEWER_ROLE } from '../../constants/Role';

/**
 * View to create or edit a Campaign
 *
 * @param isNew    If set, component will load an empty model.
 *                 Otherwise component expects an id param and will load a campaign object
 * @param id       URL parameter which is an id of a campaign object
 */
class EditCampaign extends Component {
  constructor(props) {
    super(props);

    const campaign = new Campaign({
      managerAddress: props.user && props.user.address,
      status: Campaign.PENDING
    });

    this.state = {
      isLoading: false,
      isSaving: false,
      formIsValid: false,
      campaign: campaign,
      isBlocking: false,
    };

    this.form = React.createRef();

    this.submit = this.submit.bind(this);
    this.setImage = this.setImage.bind(this);
  }

  componentDidMount() {

    this.mounted = true;

    this.checkUser().then(() => {
      const isEditingCampaign = !this.props.isNew;

      if (isEditingCampaign) {
        const campaign = this.props.campaign;
        this.setState({ campaign, isLoading: false })
      } else {
        this.setState({ isLoading: false });
      }
    }).catch(err => {
      if (err === 'noBalance') {
        // handle no balance error
      }
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.currentUser !== this.props.currentUser) {
      this.checkUser().then(() => {
        if (!this.props.isNew && !isOwner(this.state.campaign.managerddress, this.props.currentUser))
          history.goBack();
      });
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  setImage(image) {
    const { campaign } = this.state;
    campaign.image = image;
    this.setState({ campaign });
  }

  checkUser() {
    if (!this.props.currentUser) { 
      history.push('/');
      return Promise.reject("Not allowed. No user logged in");
    }

    if(!this.props.isCampaignManager){
      history.push('/');
      return Promise.reject("Not allowed. User is not campaign manager");
    }


    return authenticateIfPossible(this.props.currentUser)
      .then(() => checkProfile(this.props.currentUser));
  }

  submit() {
    //Esto tiene que comprobar aunque sea que se hayan cargado los requeridos
    const afterSave = campaign => {
      //React.toast.success('Your Campaign has been saved!');
      history.push(`/`);
    };

    this.setState({ isSaving: true, isBlocking: false }, () => {
        // Save the campaign
        this.props.saveCampaign(this.state.campaign);
        afterSave(this.state.campaign);
      },
    );
  }

  toggleFormValid(state) {
    this.setState({ formIsValid: state });
  }

  triggerRouteBlocking() {
    const form = this.form.current.formsyForm;
    // we only block routing if the form state is not submitted
    this.setState({ isBlocking: form && (!form.state.formSubmitted || form.state.isSubmitting) });
  }

  render() {
    const { isNew } = this.props;
    const { isLoading, isSaving, campaign, formIsValid, isBlocking } = this.state;

    return (
      <div id="edit-campaign-view">
        <div className="container-fluid page-layout edit-view">
          <div>
            <div className="col-md-8 m-auto">
              {isLoading && <Loader className="fixed" />}

              {!isLoading && (
                <div>
                  <GoBackButton history={history} />

                  <div className="form-header">
                    {isNew && <h3>Start a new campaign!</h3>}

                    {!isNew && <h3>Edit campaign {campaign.title}</h3>}
                    <p>
                      <i className="fa fa-question-circle" />A campaign solves a specific cause by
                      executing a project via its Milestones. Funds raised by a campaign need to be
                      delegated to its Milestones in order to be paid out.
                    </p>
                  </div>

                  <Form
                    onSubmit={this.submit}
                    ref={this.form}
                    mapping={inputs => {
                      campaign.title = inputs.title;
                      campaign.description = inputs.description;
                      campaign.url = inputs.url;
                      campaign.reviewerAddress = inputs.reviewerAddress;
                      //campaign.summary = getTruncatedText(inputs.description, 100);
                    }}
                    onValid={() => this.toggleFormValid(true)}
                    onInvalid={() => this.toggleFormValid(false)}
                    onChange={e => this.triggerRouteBlocking(e)}
                    layout="vertical"
                  >
                    <Prompt
                      when={isBlocking}
                      message={() =>
                        `You have unsaved changes. Are you sure you want to navigate from this page?`
                      }
                    />

                    <Input
                      name="title"
                      id="title-input"
                      label="What are you working on?"
                      type="text"
                      value={campaign.title}
                      placeholder="E.g. Installing 1000 solar panels."
                      help="Describe your campaign in 1 sentence."
                      validations="minLength:3"
                      validationErrors={{
                        minLength: 'Please provide at least 3 characters.',
                      }}
                      required
                      autoFocus
                    />

                    <QuillFormsy
                      name="description"
                      label="Explain how you are going to do this successfully."
                      helpText="Make it as extensive as necessary.
                      Your goal is to build trust, so that people donate Bitcoin to your campaign."
                      value={campaign.description}
                      placeholder="Describe how you're going to execute your campaign successfully..."
                      validations="minLength:20"
                      help="Describe your campaign."
                      validationErrors={{
                        minLength: 'Please provide at least 10 characters.',
                      }}
                      required
                    />

                    <div className="form-group">
                      <FormsyImageUploader
                        setImage={this.setImage}
                        previewImage={campaign.imageCidUrl}
                        isRequired={isNew}
                      />
                    </div>

                    <div className="form-group">
                      <Input
                        name="url"
                        id="url"
                        label="Url to join your Community"
                        type="text"
                        value={campaign.url}
                        placeholder="https://slack.giveth.com"
                        help="Where can people join your Community? The dapp redirects people there."
                        validations="isUrl"
                        validationErrors={{ isUrl: 'Please provide a url.' }}
                      />
                    </div>

                    <div className="form-group">
                      {
                        <SelectUsers
                          roles={[CAMPAIGN_REVIEWER_ROLE]}
                          id="reviewer-select"
                          name="reviewerAddress"
                          label="Select a reviewer"
                          helpText="This person or smart contract will be reviewing your Campaign to increase trust for Givers."
                          value={campaign.reviewerAddress}
                          cta="--- Select a reviewer ---"
                          validations="isEtherAddress"
                          validationErrors={{
                            isEtherAddress: 'Please select a reviewer.',
                          }}
                          required
                        />
                      }
                    </div>

                    <div className="form-group row">
                      <div className="col-md-6">
                        <GoBackButton history={history} />
                      </div>
                      <div className="col-md-6">
                        <LoaderButton
                          className="btn btn-success pull-right"
                          formNoValidate
                          type="submit"
                          disabled={isSaving || !formIsValid}
                          isLoading={isSaving}
                          loadingText="Saving..."
                        >
                          {isNew ? 'Create' : 'Update'} Campaign
                        </LoaderButton>
                      </div>
                    </div>
                  </Form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

EditCampaign.propTypes = {
  currentUser: PropTypes.instanceOf(User),
  isNew: PropTypes.bool,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }).isRequired,
  }).isRequired,
  isCampaignManager: PropTypes.bool,
};

EditCampaign.defaultProps = {
  currentUser: undefined,
  isNew: false,
};


const mapStateToProps = (state, props) => {
  const campaignId = parseInt(props.match.params.id);
  return {
    user: selectCurrentUser(state),
    isCampaignManager: selectCurrentUser(state).isCampaignManager(),
    reviewers: campaignReviewers(state),    
    campaign: selectCampaign(state, campaignId)
  };
};

const mapDispatchToProps = { saveCampaign }

export default connect(mapStateToProps,mapDispatchToProps)(EditCampaign)