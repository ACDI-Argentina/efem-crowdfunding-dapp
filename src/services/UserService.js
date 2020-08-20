import { feathersClient } from '../lib/feathersClient';
import ErrorPopup from '../components/ErrorPopup';
import IpfsService from './IpfsService';
import walletApi from '../lib/blockchain/WalletApi';
import crowdfundingContractApi from '../lib/blockchain/CrowdfundingContractApi';
import { Observable } from 'rxjs';
import BigNumber from 'bignumber.js';
import User from '../models/User';
import { ALL_ROLES } from '../constants/Role';

class UserService {

  loadUser(user) {

    return new Observable(async subscriber => {

      try {
        // Se carga la cuenta del usuario desde la wallet
        let address = await walletApi.getAccountAddress();
        user.address = address;
        subscriber.next(user);

        if (address) {

          // Se obtiene el balance del usuario.
          let balance = await walletApi.getBalance(address);
          user.balance = new BigNumber(balance);
          subscriber.next(user);

          feathersClient.service('/users').get(address).then(userdata => {
            const { name, email, avatar, url} = userdata;
            user.registered = true;

            user.name = name;
            user.email = email;
            user.avatar = avatar;
            user.url = url;

            subscriber.next(user);
          }).catch(err => {
            if(err.code === 404){
              subscriber.next({ registered: false });
              return;
            }
            console.log(err);
          });

          // Se cargan los roles del usuario desde el smart constract
          getRoles(address).then(roles => {
            user.roles = roles;
            subscriber.next(user);
          });
         
          authenticateFeathers(user).then(authenticated => {
            user.authenticated = authenticated;
            subscriber.next(user); 
          });

        }
      } catch (e) {
        subscriber.error(e);
      }
    });
  }

  /**
   * Save new user profile to the blockchain or update existing one in feathers
   * Al usuario lo está guardando en mongodb con feathers, no en la blockchain!
   * Lo bueno con ipfs es que podriamos guardar mas datos
   *
   * @param user        User object to be saved
   * @param afterSave   Callback to be triggered after the user is saved in feathers
   */
  save(user) {
    return new Observable(async subscriber => {
      await this._updateAvatar(user);

      try {
        await _uploadUserToIPFS(user);

        await feathersClient.service('/users').patch(user.address, user.toFeathers()); 
        user.isRegistered = true;

        subscriber.next(user);

      } catch (err) {
        err.userMsg = 'There has been a problem creating your user profile. Please refresh the page and try again.';
        subscriber.error(err);
      }
    });
  }

  getUsersRoles(){
    return new Observable(async subscriber => {
        const users = await getUsersWithRoles();
        subscriber.next(users);
    })
  }

  async _updateAvatar(user) {
    if (user._newAvatar) {
      try {
        const avatarUrl = await IpfsService.upload(user._newAvatar);
        user.avatar = IpfsService.resolveUrl(avatarUrl);
        delete user._newAvatar;
      } catch (err) {
        ErrorPopup('Failed to upload avatar', err);
      }
    }
  }
}

async function authenticateFeathers(user) { 
  let authenticated = false;
  if (user) {
    const token = await feathersClient.passport.getJWT();

    if (token) {
      const { userId } = await feathersClient.passport.verifyJWT(token);

      if (user.address === userId) {
        await feathersClient.authenticate(); // authenticate the socket connection
        authenticated = true;
      } else {
        await feathersClient.logout();
      }
    }
  }
  return authenticated;
}

async function _uploadUserToIPFS(user) {
  try {
    user.profileHash = await IpfsService.upload(user.toIpfs());
  } catch (err) {
    ErrorPopup('Failed to upload profile to ipfs');
  }
}

export async function getUser(address) {
    const userdata = await feathersClient.service('/users').get(address);
    return new User({...userdata});
}

async function getRoles(address) {
  try {
      const userRoles = [];
      for (const rol of ALL_ROLES) {
          const canPerform = await crowdfundingContractApi.canPerformRole(address, rol);
          if (canPerform) userRoles.push(rol);
      }
      return userRoles;

  } catch (err) {
      console.log(err)
  }
}

export async function getUsersWithRoles() {
  const usersWithRoles = [];
  const {data: users} = await feathersClient.service("users").find();
  for (const user of users) {
    const roles = await getRoles(user.address);
    usersWithRoles.push(new User({ ...user, roles }));
  }
  return usersWithRoles;
}


const pause = (ms = 3000) => {
  return new Promise((resolve,reject)=> {
    setTimeout(_ => resolve(),ms)
  });
}








export default UserService;
