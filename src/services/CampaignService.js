import { LPPCampaign } from 'lpp-campaign';
import { paramsForServer } from 'feathers-hooks-common';
import Milestone from 'models/Milestone';
import getNetwork from '../lib/blockchain/getNetwork';
import getWeb3 from '../lib/blockchain/getWeb3';
import extraGas from '../lib/blockchain/extraGas';
import { feathersClient } from '../lib/feathersClient';
import Campaign from '../models/Campaign';
import Donation from '../models/Donation';
import ErrorPopup from '../components/ErrorPopup';
import CampaignCache from './cache/CampaignCache';
import CrowdfundingContractApi from '../lib/blockchain/CrowdfundingContractApi';

const campaigns = feathersClient.service('campaigns');
const campaignCache = new CampaignCache();
const crowdfundingContractApi = new CrowdfundingContractApi();

class CampaignService {



  /**
   * Get a Campaign defined by ID
   *
   * @param id   ID of the Campaign to be retrieved
   */
  static get(id) {
    return new Promise((resolve, reject) => {
      campaigns
        .find({ query: { _id: id } })
        .then(resp => {
          resolve(new Campaign(resp.data[0]));
        })
        .catch(reject);
    });
  }

  /**
   * Get Campaigns
   *
   * @param $limit    Amount of records to be loaded
   * @param $skip     Amounds of record to be skipped
   * @param onSuccess Callback function once response is obtained successfylly
   * @param onError   Callback function if error is encountered
   */
  static async getCampaigns($limit = 100, $skip = 0, onSuccess = () => {}, onError = () => {}) {
    var cacheData = campaignCache.getData();
    if(cacheData != null) {
      // Los datos permanecen cacheados, por lo se retornan sin utilizar el API.
      onSuccess(cacheData.campaigns, cacheData.total);
    } else {
      // Los datos no están cacheados, por lo se utiliza el API.
      let campaigns = await crowdfundingContractApi.getCampaigns();
      let total = campaigns.length;
      campaignCache.setData(campaigns, total);
      onSuccess(campaigns, total);
    }    
  }

  /**
   * Get Campaign milestones listener
   *
   * @param id        ID of the Campaign which donations should be retrieved
   * @param $limit    Amount of records to be loaded
   * @param $skip     Amounds of record to be skipped
   * @param onSuccess Callback function once response is obtained successfully
   * @param onError   Callback function if error is encountered
   */
  static getMilestones(id, $limit = 100, $skip = 0, onSuccess = () => {}, onError = () => {}) {
    return feathersClient
      .service('milestones')
      .find({
        query: {
          campaignId: id,
          status: {
            $nin: [Milestone.CANCELED, Milestone.PROPOSED, Milestone.REJECTED, Milestone.PENDING],
          },
          $sort: { createdAt: 1 },
          $limit,
          $skip,
        },
      })
      .then(resp => onSuccess(resp.data.map(m => new Milestone(m)), resp.total))
      .catch(onError);
  }

  /**
   * Get Campaign donations
   *
   * @param id        ID of the Campaign which donations should be retrieved
   * @param $limit    Amount of records to be loaded
   * @param $skip     Amounds of records to be skipped
   * @param onSuccess Callback function once response is obtained successfully
   * @param onError   Callback function if error is encountered
   */
  static getDonations(id, $limit = 100, $skip = 0, onSuccess = () => {}, onError = () => {}) {
    return feathersClient
      .service('donations')
      .find(
        paramsForServer({
          query: {
            status: { $ne: Donation.FAILED },
            $or: [{ intendedProjectTypeId: id }, { ownerTypeId: id }],
            ownerTypeId: id,
            isReturn: false,
            $sort: { createdAt: -1 },
            $limit,
            $skip,
          },
          schema: 'includeTypeAndGiverDetails',
        }),
      )
      .then(resp => onSuccess(resp.data.map(d => new Donation(d)), resp.total))
      .catch(onError);
  }

  /**
   * Subscribe to count of new donations. Initial resp will always be 0. Any new donations
   * that come in while subscribed, the onSuccess will be called with the # of newDonations
   * since initial subscribe
   *
   * @param id        ID of the Campaign which donations should be retrieved
   * @param onSuccess Callback function once response is obtained successfully
   * @param onError   Callback function if error is encountered
   */
  static subscribeNewDonations(id, onSuccess, onError) {
    let initalTotal;
    return feathersClient
      .service('donations')
      .watch()
      .find(
        paramsForServer({
          query: {
            status: { $ne: Donation.FAILED },
            $or: [{ intendedProjectTypeId: id }, { ownerTypeId: id }],
            ownerTypeId: id,
            isReturn: false,
            $sort: { createdAt: -1 },
            $limit: 0,
          },
          schema: 'includeTypeAndGiverDetails',
        }),
      )
      .subscribe(resp => {
        if (initalTotal === undefined) {
          initalTotal = resp.total;
          onSuccess(0);
        } else {
          onSuccess(resp.total - initalTotal);
        }
      }, onError);
  }

  /**
   * Get the user's Campaigns
   *
   * @param userAddress Address of the user whose Campaign list should be retrieved
   * @param skipPages     Amount of pages to skip
   * @param itemsPerPage  Items to retreive
   * @param onSuccess   Callback function once response is obtained successfully
   * @param onError     Callback function if error is encountered
   */
  static getUserCampaigns(userAddress, skipPages, itemsPerPage, onSuccess, onError) {
    return campaigns
      .watch({ listStrategy: 'always' })
      .find({
        query: {
          $or: [{ ownerAddress: userAddress }, { reviewerAddress: userAddress }],
          $sort: {
            createdAt: -1,
          },
          $limit: itemsPerPage,
          $skip: skipPages * itemsPerPage,
        },
      })
      .subscribe(resp => {
        const newResp = Object.assign({}, resp, {
          data: resp.data.map(c => new Campaign(c)),
        });
        onSuccess(newResp);
      }, onError);
  }

  /**
   * Almacena la nueva campaign de manera local y en un storage remoto.
   *
   * @param campaign    Campaign object to be saved
   * @param onSaveLocal invocado una vez que la campaign ha sido almacenada localmente.
   * @param onSaveRemote invocado una vez que la campaign ha sido almacenada remotamente.
   */
  static async save(campaign, onSaveLocal = () => {}, onSaveRemote = () => {}) {

    await crowdfundingContractApi.saveCampaign(
      campaign,
      // Guardado local
      function(campaign) {
        campaignCache.save(campaign);
        onSaveLocal(campaign);
      },
      // Confirmación de guardado Remoto
      function(campaign) {
        campaignCache.updateByTxHash(campaign);
        onSaveRemote(campaign);
      },
      function(error) {
        ErrorPopup(`Something went wrong with saving the Campaing`);
      });
  }

  /**
   * Cancel Campaign in the blockchain and update it in feathers
   * TODO: Handle error states properly
   *
   * @param campaign    Campaign to be cancelled
   * @param from        Address of the user cancelling the Campaign
   * @param afterCreate Callback to be triggered after the Campaign is cancelled in feathers
   * @param afterMined  Callback to be triggered after the transaction is mined
   */
  static cancel(campaign, from, afterCreate = () => {}, afterMined = () => {}) {
    let txHash;
    let etherScanUrl;
    Promise.all([getNetwork(), getWeb3()])
      .then(([network, web3]) => {
        const lppCampaign = new LPPCampaign(web3, campaign.pluginAddress);
        etherScanUrl = network.etherscan;

        lppCampaign
          .cancelCampaign({ from, $extraGas: extraGas() })
          .once('transactionHash', hash => {
            txHash = hash;
            campaigns
              .patch(campaign.id, {
                status: Campaign.CANCELED,
                mined: false,
                // txHash, // TODO create a transaction entry
              })
              .then(afterCreate(`${etherScanUrl}tx/${txHash}`))
              .catch(err => {
                ErrorPopup('Something went wrong with updating campaign', err);
              });
          })
          .then(() => afterMined(`${etherScanUrl}tx/${txHash}`))
          .catch(err => {
            if (txHash && err.message && err.message.includes('unknown transaction')) return; // bug in web3 seems to constantly fail due to this error, but the tx is correct
            ErrorPopup(
              'Something went wrong with cancelling your campaign',
              `${etherScanUrl}tx/${txHash} => ${JSON.stringify(err, null, 2)}`,
            );
          });
      })
      .catch(err => {
        ErrorPopup(
          'Something went wrong with cancelling your campaign',
          `${etherScanUrl}tx/${txHash} => ${JSON.stringify(err, null, 2)}`,
        );
      });
  }
}

export default CampaignService;
