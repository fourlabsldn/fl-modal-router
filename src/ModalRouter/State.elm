port module ModalRouter.State exposing (init, update, subscriptions)

import ModalRouter.Types exposing (..)
import String
import Task
import History exposing ( HistoryState )
import Modal exposing ( Modal )
import Uri exposing ( Uri )
import Maybe



init : Int -> (Model, Cmd Msg)
init sessionId =
    let
        currentUrl =
            Uri.getCurrent ()
    in
        ( Model [] currentUrl sessionId
        , Task.perform identity PopState (Task.succeed Nothing)
        )



-- SUBSCRIPTIONS
-- These are basically our events sent from JavaScript



port onPopState : (Maybe HistoryState -> msg) -> Sub msg
port onModalOpen : (Modal -> msg) -> Sub msg
port onModalClose : (String -> msg) -> Sub msg -- the string is the modal selector



subscriptions : Model -> Sub Msg
subscriptions model =
   Sub.batch
        [ onPopState PopState
        , onModalOpen ModalOpen
        , onModalClose ModalClose
        ]



-- UPDATE



update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        PopState state ->
            case state of
                Nothing ->
                    ( model
                    , setCurrentState model.openModals model.initialUrl
                    )

                Just s ->
                    ( { model | openModals = s.openModals }
                    , conformWindowToState s model
                    )

        ModalOpen modal ->
            let
                modalRegisteredAsOpen =
                    isModalOpen model.openModals modal.selector

                plusNewModal =
                    modal :: model.openModals
            in
                if modalRegisteredAsOpen then
                    ( model , Cmd.none )

                else
                    ( { model | openModals = plusNewModal }
                    , createState plusNewModal model.initialUrl
                    )

        ModalClose selector ->
            let
                modalRegisteredAsClosed =
                    isModalOpen model.openModals selector
                        |> not

                listWithoutModal =
                    List.filter (\n -> n.selector /= selector ) model.openModals
            in
                if modalRegisteredAsClosed then
                    ( model, Cmd.none )

                else
                    ( { model | openModals = listWithoutModal }
                    , createState listWithoutModal model.initialUrl
                    )



isModalOpen : (List Modal) -> String -> Bool
isModalOpen openModals selector =
    openModals
        |> List.map (\m -> m.selector)
        |> List.member selector



conformWindowToState: HistoryState -> Model -> Cmd Msg
conformWindowToState state model =
    let
        modalsToOpen = state.openModals `missingIn` model.openModals
        modalsToClose = model.openModals `missingIn` state.openModals
    in
        [ List.map Modal.open modalsToOpen
        , List.map Modal.close modalsToClose
        , [ History.replaceState state ]
        ]
            |> List.concat
            |> Cmd.batch



missingIn : List a -> List a -> List a
missingIn a b =
    List.filter (\x -> List.member x b |> not) a



-- This does not trigger a popstate
createState: List Modal -> String -> Cmd msg
createState openModals defaultUrl =
    let
        stateUrl =
            List.head openModals
                |> (flip Maybe.andThen) (\x -> x.targetUrl)
                |> Maybe.withDefault defaultUrl
    in
        History.pushState ( HistoryState openModals stateUrl )



setCurrentState: List Modal -> String -> Cmd msg
setCurrentState openModals url =
  History.replaceState ( HistoryState openModals url )
