module ModalRouter.Types exposing (..)



type Msg
    = PopState (Maybe HistoryState)
    | ModalOpen ModalInfo
    | ModalClose ModalInfo -- this string is just to comply with the subscription of onModalClose



type alias ModalInfo =
    { modalSelector: String
    , targetUrl: Maybe String
    }



type alias HistoryState =
    { modal: Maybe ModalInfo
    , url: String
    }



type alias Model =
    { openModals: List ModalInfo
    }
