import ModalRouter.State exposing ( init, update, subscriptions )
import ModalRouter.Types exposing ( Model, Msg )
import Html exposing (..)
import Html.App as App



main =
    App.program
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }



view : Model -> Html Msg
view model =
    div [] []
