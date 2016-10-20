module History exposing (..)

import Native.History

import Modal
import Uri exposing ( Uri )
import Task exposing (Task)


type alias HistoryState =
    { modal: Maybe Modal.Modal
    , url: Uri
    }



pushState : HistoryState -> Cmd msg
pushState hist =
    let
        a = Native.History.pushState hist
    in
        Cmd.none



replaceState : HistoryState -> Cmd msg
replaceState hist =
    let
        a = Native.History.replaceState hist
    in
        Cmd.none



-- This argument is just ignored
getState : a -> HistoryState
getState a =
    Native.History.getState a
