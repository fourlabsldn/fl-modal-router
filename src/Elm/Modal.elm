module Modal exposing (..)

import Native.Modal



type alias Modal =
    { selector: String
    , targetUrl: Maybe String
    }



open : Modal -> Cmd a
open modal =
    Native.Modal.open modal
        |> always Cmd.none



close : Modal -> Cmd a
close modal =
    Native.Modal.close modal.selector
        |> always Cmd.none



getOpen : a -> List String
getOpen a =
    Native.Modal.getOpen ()
