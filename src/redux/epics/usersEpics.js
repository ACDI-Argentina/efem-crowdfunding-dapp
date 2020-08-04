import { ofType } from 'redux-observable';
import { map, mergeMap } from 'rxjs/operators'
import CrowdfundingContractApi from '../../lib/blockchain/CrowdfundingContractApi';
import { Observable } from 'rxjs';

const crowdfundingContractApi = new CrowdfundingContractApi();

export const setUserEpic = action$ => action$.pipe(
  ofType('user/setUser'),
  mergeMap(action => {
    const user = action.payload;
    if(user.address){
      return crowdfundingContractApi.getRoles(user.address);
    } else {
      return [];
    }
  }), 
  map(roles => ({ type: 'user/setRoles', payload: roles }))
)



