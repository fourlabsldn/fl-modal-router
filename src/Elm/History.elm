module History exposing (..)

import Native.History

import Modal
import Uri exposing ( Uri )
import Task exposing (Task)


type alias HistoryState =
    { openModals : List Modal.Modal
    , url : Uri
    , sessionId: Int
    }



pushState : HistoryState -> Cmd msg
pushState hist =
    Native.History.pushState hist
        |> always Cmd.none




replaceState : HistoryState -> Cmd msg
replaceState hist =
    Native.History.replaceState hist
        |> always Cmd.none



-- This argument is just ignored
getState : a -> HistoryState
getState a =
    Native.History.getState a
