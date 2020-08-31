import { createSlice } from '@reduxjs/toolkit';
import Milestone from '../../models/Milestone';

export const milestonesSlice = createSlice({
  name: 'milestones',
  initialState: [],
  reducers: {
    fetchMilestones: (state, action) => {
      // Solo se obtiene el estado actual.
    },
    fetchMilestone: (state, action) => {
      // Solo se obtiene el estado actual.
    },
    resetMilestones: (state, action) => {
      // Se resguardan las Milestones Pendientes.
      var pendings = state.filter(m => m.status.name === Milestone.PENDING.name);
      state.splice(0, state.length);
      for (let i = 0; i < action.payload.length; i++) {
        let milestoneStore = action.payload[i].toStore();
        state.push(milestoneStore);
      }
      pendings.forEach(m => state.push(m));
    },
    addMilestone: (state, action) => {
      let milestoneStore = action.payload.toStore();
      state.push(milestoneStore);
    },
    updateMilestoneById: (state, action) => {
      if (action.payload) {
        let milestoneStore = action.payload.toStore();
        let index = state.findIndex(m => m.id === milestoneStore.id);
        if (index != -1) {
          state[index] = milestoneStore;
        }
      }
    },
    updateMilestoneByClientId: (state, action) => {
      let milestoneStore = action.payload.toStore();
      let index = state.findIndex(m => m.clientId === milestoneStore.clientId);
      if (index != -1) {
        state[index] = milestoneStore;
      }
    },
    deleteMilestoneByClientId: (state, action) => {
      let milestoneStore = action.payload.toStore();
      let index = state.findIndex(m => m.clientId === milestoneStore.clientId);
      if (index != -1) {
        state.splice(index, 1);
      }
    },
    complete: (state, action) => {
      let milestoneStore = action.payload.milestone.toStore();
      let index = state.findIndex(m => m.clientId === milestoneStore.clientId);
      if (index != -1) {
        state[index] = milestoneStore;
      }
    },
    withdraw: (state, action) => {
      let milestoneStore = action.payload.toStore();
      let index = state.findIndex(m => m.clientId === milestoneStore.clientId);
      if (index != -1) {
        state[index] = milestoneStore;
      }
    }
  },
});

export const {
  fetchMilestones,
  resetMilestones,
  addMilestone,
  updateMilestoneByClientId,
  complete,
  withdraw } = milestonesSlice.actions;

export const selectMilestone = (state, id) => {
  let milestoneStore = state.milestones.find(m => m.id === id);
  return new Milestone(milestoneStore);
}
export const selectMilestones = state => {
  return state.milestones.map(function (milestoneStore) {
    return new Milestone(milestoneStore);
  });
}
export const selectMilestonesByCampaign = (state, campaignId) => {
  return state.milestones.filter(m => m.campaignId === campaignId).map(function (milestoneStore) {
    return new Milestone(milestoneStore);
  });
}

export default milestonesSlice.reducer;