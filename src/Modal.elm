module Modal exposing (..)

import Native.Modal



type alias Modal =
    { selector: String
    , targetUrl: Maybe String
    }



open : Modal -> Cmd a
open modal =
    Native.Modal.open modal.selector



close : Modal -> Cmd a
close modal =
    Native.Modal.close modal.selector



getOpen : a -> Cmd a
getOpen a =
    Native.Modal.getOpen a
