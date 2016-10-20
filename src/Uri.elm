module Uri exposing (..)

import Native.Uri



type alias Uri
    = String



encodeUri : String -> String
encodeUri str =
    Native.Uri.encodeUri str



encodeUriComponent : String -> String
encodeUriComponent str =
    Native.Uri.encodeUriComponent str
