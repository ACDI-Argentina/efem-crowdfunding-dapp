import Transaction from '../../models/Transaction';
import { store } from '../store';
import { addTransaction, updateTransaction } from '../reducers/transactionsSlice';

/**
 * Clase utilitaria para el manejo de transacciones
 * a través de Redux.
 */
class TransactionUtils {

  constructor() { }

  /**
   * Agrega una nueva transacción.
   * 
   * @param data datos de la transacción a agregar.
   */
  addTransaction({
    hash,
    gasEstimated,
    gasPrice,
    createdTitleKey,
    createdSubtitleKey,
    submittedTitleKey
  }) {
    let transaction = new Transaction({
      hash: hash,
      gasEstimated: gasEstimated,
      gasPrice: gasPrice,
      createdTitleKey: createdTitleKey,
      createdSubtitleKey: createdSubtitleKey,
      submittedTitleKey: submittedTitleKey
    });
    store.dispatch(addTransaction(transaction));
    return transaction;
  }

  /**
   * Actualiza una transacción.
   * 
   * @param data datos de la transacción a actualizar.
   */
  updateTransaction(transaction) {
    store.dispatch(updateTransaction(transaction));
  }
}

export default new TransactionUtils();
