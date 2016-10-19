module History exposing (..)

import Native.History

import Modal



type alias HistoryState =
    { modal: Maybe Modal.ModalInfo
    , url: String
    }


pushState : HistoryState -> Cmd msg
pushState hist =
    Native.History.pushState hist "modal-router-state" hist.url



replaceState : HistoryState -> Cmd msg
replaceState hist =
    Native.History.replaceState hist "modal-router-state" hist.url



-- This argument is just ignored
getState : a -> HistoryState
getState a =
    Native.History.getState a
