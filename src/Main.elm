port module Spelling exposing (..)

import Html exposing (..)
import Html.App as App
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import String


main =
  App.program
    { init = init
    , view = view
    , update = update
    , subscriptions = subscriptions
    }


-- MODEL

type alias Model =
  { message : String
  }

init : (Model, Cmd Msg)
init =
  (Model "", Cmd.none)


-- UPDATE

type Msg
  = PopState String
  | ModalOpen String
  | ModalClose String

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    PopState eventMsg ->
      ( Model ("Popstate invoked: " ++ eventMsg), Cmd.none )

    ModalOpen eventMsg ->
      ( Model ("Modal was open: " ++ eventMsg), Cmd.none )

    ModalClose eventMsg ->
      ( Model ("Modal was closed: " ++ eventMsg), Cmd.none )

--

-- SUBSCRIPTIONS
port popstate : (String -> msg) -> Sub msg
port modalOpen : (String -> msg) -> Sub msg
port modalClose : (String -> msg) -> Sub msg

subscriptions : Model -> Sub Msg
subscriptions model =
   Sub.batch
        [ popstate PopState
        , modalOpen ModalOpen
        , modalClose ModalClose
        ]


-- VIEW

view : Model -> Html Msg
view model =
  div []
    [ text model.message
    ]
