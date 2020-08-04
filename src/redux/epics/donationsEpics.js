import { ofType } from 'redux-observable';
import { map, mergeMap } from 'rxjs/operators'
import CrowdfundingContractApi from '../../lib/blockchain/CrowdfundingContractApi';

const crowdfundingContractApi = new CrowdfundingContractApi();

/**
 * Epic que reacciona a la acción de obtención de donaciones locales,
 * busca las donaciones en el smart contract y envía la acción de
 * resetear las donaciones locales.
 * 
 * @param action$ de Redux.
 */
export const fetchDonationsEpic = action$ => action$.pipe(
  ofType('donations/fetchDonations'),
  mergeMap(action => crowdfundingContractApi.getDonations()),
  map(donations => ({
    type: 'donations/resetDonations',
    payload: donations
  }))
)

/**
 * Epic que reacciona a la acción de almacenamiento de donación local,
 * almacena la donación en el smart contract y envía la acción de
 * actualizar la donación local.
 * 
 * @param action$ de Redux.
 */
export const addDonationEpic = action$ => action$.pipe(
  ofType('donations/addDonation'),
  mergeMap(action => crowdfundingContractApi.saveDonation(action.payload)),
  map(campaign => ({
    type: 'donations/updateDonationByClientId',
    payload: campaign
  }))
)