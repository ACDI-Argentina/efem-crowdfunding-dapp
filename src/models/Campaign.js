/* eslint-disable import/no-cycle */

import BasicModel from './BasicModel';
import CampaignService from '../services/CampaignService';
import IPFSService from '../services/IPFSService';
import ErrorPopup from '../components/ErrorPopup';
import { cleanIpfsPath } from '../lib/helpers';

/**
 * The DApp Campaign model
 */
class Campaign extends BasicModel {
  static get CANCELED() {
    return 'Canceled';
  }

  static get ACTIVE() {
    return 'Active';
  }

  static get type() {
    return 'campaign';
  }

  // eslint-disable-next-line class-methods-use-this
  get type() {
    return Campaign.type;
  }

  constructor(data) {
    super(data);

    this.communityUrl = data.communityUrl || '';
    this.status = data.status || Campaign.ACTIVE;
    this.reviewerAddress = data.reviewerAddress;
    this.ownerAddress = data.ownerAddress;
    this.commitTime = data.commitTime || 0;
  }

  toIpfs() {
    return {
      title: this.title,
      description: this.description,
      communityUrl: this.communityUrl,
      image: cleanIpfsPath(this.image),
      version: 1,
    };
  }

  toFeathers(txHash) {
    const campaign = {
      id: this.id,
      title: this.title,
      description: this.description,
      communityUrl: this.communityUrl,
      image: cleanIpfsPath(this.image),
      reviewerAddress: this.reviewerAddress,
      status: this.status,
    };
    if (!this.id) campaign.txHash = txHash;
    return campaign;
  }

  get isActive() {
    return this.status === Campaign.ACTIVE;
  }

  get isPending() {
    return this.status === Campaign.PENDING || !this.mined;
  }

  /**
   * Guarda la campaign en la blockchain.
   *
   * @param afterSave callback invocado una vez que la campaign
   * ha sido guardada en la blockchain.
   */
  async save(afterSave) {
    let imageCid = await IPFSService.upload(this.image);
    // Save the new image address and mark it as old
    this.image = imageCid;
    this.newImage = false;
    // Se sube en IPFS un JSON con la información de la Campaign.
    let infoCid = await IPFSService.upload(this.toIpfs());
    this.infoCid = infoCid;
    CampaignService.save(this, afterSave);
    /*if (this.newImage) {
      IPFSService.upload(this.image)
        .then(hash => {
          // Save the new image address and mark it as old
          this.image = hash;
          this.newImage = false;
        })
        .catch(err => ErrorPopup('Failed to upload image', err))
        .finally(() => CampaignService.save(this, afterSave));
    } else {
      CampaignService.save(this, afterSave);
    }*/
  }

  /**
   * Cancel the campaign in feathers and blockchain
   *
   * @param from        Either the owner or reviewer. Whoever is canceling the campaign
   * @param afterCreate Callback function once a transaction is created
   * @param afterMined  Callback function once the transaction is mined and feathers updated
   */
  cancel(from, afterCreate, afterMined) {
    CampaignService.cancel(this, from, afterCreate, afterMined);
  }

  get communityUrl() {
    return this.myCommunityUrl;
  }

  set communityUrl(value) {
    this.checkType(value, ['string'], 'communityUrl');
    this.myCommunityUrl = value;
  }

  get projectId() {
    return this.myProjectId;
  }

  set projectId(value) {
    this.checkType(value, ['number', 'string'], 'projectId');
    this.myProjectId = value;
  }

  get status() {
    return this.myStatus;
  }

  set status(value) {
    this.checkValue(value, [Campaign.PENDING, Campaign.ACTIVE, Campaign.CANCELED], 'status');
    this.myStatus = value;
    if (value === Campaign.PENDING) this.myOrder = 1;
    else if (value === Campaign.ACTIVE) this.myOrder = 2;
    else if (value === Campaign.CANCELED) this.myOrder = 3;
    else this.myOrder = 4;
  }

  get pluginAddress() {
    return this.myPluginAddress;
  }

  set pluginAddress(value) {
    this.checkType(value, ['string'], 'pluginAddress');
    this.myPluginAddress = value;
  }

  get reviewerAddress() {
    return this.myReviewerAddress;
  }

  set reviewerAddress(value) {
    this.checkType(value, ['string', 'undefined'], 'reviewerAddress');
    this.myReviewerAddress = value;
  }

  get commitTime() {
    return this.myCommitTime;
  }

  set commitTime(value) {
    this.checkType(value, ['number'], 'commitTime');
    this.myCommitTime = value;
  }
}

export default Campaign;
