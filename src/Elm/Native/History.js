const _user$project$Native_History = {
  pushState: (state) => {
    const histState = HistoryState(state);
    window.history.pushState(histState, 'modal-router-state', histState.url)
  },
  replaceState: (state) => {
    const histState = HistoryState(state);
    window.history.replaceState(histState, 'modal-router-state', histState.url)
  },
  getState: () => HistoryState(window.history.state),
};
