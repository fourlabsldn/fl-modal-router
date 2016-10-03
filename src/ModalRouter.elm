port module ModalRouter exposing (..)
import Html exposing (..)
import Html.App as App
import String
import Native.History as History
import Native.Modal as Modal

placeholderUrl =
  "placeholderUrl"


-- MODEL
type alias ModalInfo =
  { modalSelector: String
  , targetUrl: Maybe String
  }

type alias HistoryState =
  { modal: Maybe ModalInfo
  , url: String
  }

type alias Model =
  {}

init : (Model, Cmd Msg)
init =
  (Model, Cmd.none)


-- SUBSCRIPTIONS
-- These are basically our events sent from JavaScript

port onPopState : (Maybe HistoryState -> msg) -> Sub msg
port onModalOpen : (ModalInfo -> msg) -> Sub msg
port onModalClose : (String -> msg) -> Sub msg

subscriptions : Model -> Sub Msg
subscriptions model =
   Sub.batch
        [ onPopState PopState
        , onModalOpen ModalOpen
        , onModalClose ModalClose
        ]

-- UPDATE


applyState: HistoryState -> Cmd Msg
applyState state =
  Cmd.batch
    [ History.replaceState state state.url state.url
    , case state.modal of
        Nothing ->
          Cmd.none

        Just modal ->
          openModal modal.modalSelector -- This should actually open the modal propperly
                                        -- taking into consideration the load URL
    ]


modalUrlToPageUrl: String -> String
modalUrlToPageUrl modalUrl = modalUrl


createStateWithoutModal: String -> Cmd msg
createStateWithoutModal url =
  pushHistoryState ( HistoryState Nothing url )


createStateWithModal: ModalInfo -> Cmd msg
createStateWithModal modal =
    let
      url = case modal.targetUrl of
          Nothing ->
            placeholderUrl

          Just targetUrl ->
            modalUrlToPageUrl targetUrl
    in
      pushHistoryState ( HistoryState (Just modal) url )


setCurrentState: String -> Cmd msg
setCurrentState url =
  replaceHistoryState ( HistoryState Nothing url )


type Msg
  = PopState (Maybe HistoryState)
  | ModalOpen ModalInfo
  | ModalClose ModalInfo -- this string is just to comply with the subscription of onModalClose


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    PopState state ->
      case state of
        Nothing ->
          ( Model , setCurrentState placeholderUrl ) -- FIXME this should be replacestate

        Just s ->
          ( Model , applyState s )

    ModalOpen modal ->
      ( Model , createStateWithModal modal )

    ModalClose url->
      ( Model , createStateWithoutModal placeholderUrl ) -- TODO: deal with this


-- VIEW
-- I'm not really using this part as our app doesn't do anything with a view


view : Model -> Html Msg
view model = div [] []


-- MAIN


main =
  App.program
    { init = init
    , view = view
    , update = update
    , subscriptions = subscriptions
    }
