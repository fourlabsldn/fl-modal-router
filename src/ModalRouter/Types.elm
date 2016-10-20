module ModalRouter.Types exposing (..)

import Modal exposing ( Modal )
import History exposing ( HistoryState )
import Uri exposing ( Uri )



type Msg
    = PopState (Maybe HistoryState)
    | ModalOpen Modal
    | ModalClose String -- this string is just to comply with the subscription of onModalClose



type alias Model =
    { openModals: List Modal
    , initialUrl : Uri
    }
