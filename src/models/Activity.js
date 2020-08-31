import { nanoid } from '@reduxjs/toolkit'
import Model from './Model';

/**
 * Modelo de actividad de un milestone en la Dapp.
 */
class Activity extends Model {

  constructor(data = {}) {
    super(data);
    const {
      id,
      clientId = nanoid(),
      milestoneId,
      userAddress = '',
      message = '',
      items = []
    } = data;

    this._id = id;
    // ID utilizado solamente del lado cliente
    this._clientId = clientId;
    this._milestoneId = milestoneId;
    this._userAddress = userAddress;
    this._message = message;
    this._items = items;
  }

  /**
   * Obtiene un objeto plano para ser almacenado.
   */
  toStore() {
    return {
      id: this._id,
      clientId: this._clientId,
      milestoneId: this._milestoneId,
      userAddress: this._userAddress,
      message: this._message,
      items: this._items
    };
  }

  /**
   * Obtiene un objeto plano para envíar a IPFS.
   */
  toIpfs() {
    return {
      id: this._id,
      milestoneId: this._milestoneId,
      userAddress: this._userAddress,
      message: this._message,
      items: this._items
    }
  }

  get id() {
    return this._id;
  }

  set id(value) {
    this.checkType(value, ['number'], 'id');
    this._id = value;
  }

  get clientId() {
    return this._clientId;
  }

  set clientId(value) {
    this.checkType(value, ['undefined', 'string'], 'clientId');
    this._clientId = value;
  }

  get userAddress() {
    return this._userAddress;
  }

  set userAddress(value) {
    this.checkType(value, ['string'], 'userAddress');
    this._userAddress = value;
  }

  get milestoneId() {
    return this._milestoneId;
  }

  set milestoneId(value) {
    this.checkType(value, ['number'], 'milestoneId');
    this._milestoneId = value;
  }

  get message() {
    return this._message;
  }
}

export default Activity;
