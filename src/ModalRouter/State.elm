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

        currentOpenModals =
            []

        initialModel =
            Model currentOpenModals currentUrl sessionId
    in
        -- When the page is first loaded we replace the current state for one
        -- generated using the current sessionId
        ( initialModel
        , replaceState initialModel
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
                    ( model, replaceState model )

                Just s ->
                    ( { model | openModals = s.openModals }
                    , conformWindowToState s model
                    )

        ModalOpen modal ->
            let
                modalRegisteredAsOpen =
                    isModalOpen model.openModals modal.selector

                modelPlusModal =
                    { model | openModals = modal :: model.openModals }
            in
                if modalRegisteredAsOpen then
                    ( model , Cmd.none )

                else
                    ( modelPlusModal, pushState modelPlusModal )

        ModalClose selector ->
            let
                modalRegisteredAsClosed =
                    isModalOpen model.openModals selector
                        |> not

                listWithoutModal =
                    List.filter (\n -> n.selector /= selector ) model.openModals

                modelMinusModal =
                    { model | openModals = listWithoutModal }
            in
                if modalRegisteredAsClosed then
                    ( model, Cmd.none )

                else
                    ( modelMinusModal, pushState modelMinusModal )



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



toHistoryState : Model -> HistoryState
toHistoryState { openModals, initialUrl, sessionId } =
    -- The page URL is always the url of the last modal open.
    -- If no modal is open, the page URL is the initial one
    let
        stateUrl =
            List.head openModals
                |> (flip Maybe.andThen) (\x -> x.targetUrl)
                |> Maybe.withDefault initialUrl
    in
        HistoryState openModals stateUrl sessionId



pushState : Model -> Cmd Msg
pushState model =
    History.pushState <| toHistoryState model



replaceState : Model -> Cmd Msg
replaceState model =
    History.replaceState <| toHistoryState model
