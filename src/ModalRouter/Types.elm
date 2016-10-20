module ModalRouter.Types exposing (..)

import Modal exposing ( Modal )
import History exposing ( HistoryState )
import Uri exposing ( Uri )



type Msg
    = PopState (Maybe HistoryState)
    | ModalOpen Modal
    | ModalClose String -- this string is just to comply with the subscription of onModalClose



-- We will use our sessionId to make sure we don't try to enforce states setup
-- in different page-loads. So, every time you refresh your page you loose
-- the non-refresh history capability.
type alias Model =
    { openModals: List Modal
    , initialUrl : Uri
    , sessionId : Int
    }
