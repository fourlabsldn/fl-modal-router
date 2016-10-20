port module ModalRouter.State exposing (init, update, subscriptions)

import ModalRouter.Types exposing (..)
import String
import Task
import History exposing ( HistoryState )
import Modal exposing ( Modal )
import Uri exposing ( Uri )
import Maybe


placeholderUrl =
    "index.html"



init : (Model, Cmd Msg)
init =
    (Model [], Task.perform identity PopState (Task.succeed Nothing))



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
                    , setCurrentState model.openModals placeholderUrl
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
                    , createState plusNewModal Nothing
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
                    , createState listWithoutModal Nothing
                    ) -- TODO: make this url be the last one without a modal



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
        , [ History.replaceState (Debug.log "popped historyState: " state) ]
        ]
            |> List.concat
            |> Cmd.batch



missingIn : List a -> List a -> List a
missingIn a b =
    List.filter (\x -> List.member x b |> not) a



-- This does not trigger a popstate
createState: List Modal -> Maybe String -> Cmd msg
createState openModals pageUrl =
    let
        firstModalUrl =
            ( List.head openModals ) `Maybe.andThen` (\x -> x.targetUrl)
        stateUrl =
            [ firstModalUrl, pageUrl ]
                |> Maybe.oneOf
                |> Maybe.withDefault placeholderUrl
    in
        History.pushState ( HistoryState openModals stateUrl )



setCurrentState: List Modal -> String -> Cmd msg
setCurrentState openModals url =
  History.replaceState ( HistoryState openModals url )
