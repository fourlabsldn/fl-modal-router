port module ModalRouter.State exposing (init, update, subscriptions)

import ModalRouter.Types exposing (..)
import String
import History exposing ( HistoryState )
import Modal exposing ( Modal )
import Uri exposing ( Uri )
import Maybe


placeholderUrl =
    "index.html"



init : (Model, Cmd Msg)
init =
    (Model [], Cmd.none)



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
                    , setCurrentState ( List.head model.openModals ) placeholderUrl
                    )

                Just s ->
                  ( conformModelToState s model , conformWindowToState s )

        ModalOpen modal ->
            let
                modalRegisteredAsOpen =
                    isModalOpen model.openModals modal.selector
            in
                if modalRegisteredAsOpen then
                    ( model , Cmd.none )

                else
                    ( { model | openModals = (modal :: model.openModals) }
                    , createState ( Just modal ) Nothing
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
                    , createState ( List.head listWithoutModal ) Nothing
                    ) -- TODO: make this url be the last one without a modal



isModalOpen : (List Modal) -> String -> Bool
isModalOpen openModals selector =
    openModals
        |> List.map (\m -> m.selector)
        |> List.member selector



conformWindowToState: HistoryState -> Cmd Msg
conformWindowToState state =
  Cmd.batch
    [ History.replaceState (Debug.log "popped historyState: " state)
    , case state.modal of
        Nothing ->
          Cmd.none

        Just modal ->
          Modal.open modal
    ]



conformModelToState : HistoryState -> Model -> Model
conformModelToState state model =
    let
        openModals =
            case state.modal of
                Nothing ->
                    []

                Just modalInfo ->
                    if List.member modalInfo model.openModals
                        then
                            model.openModals
                        else
                            modalInfo :: model.openModals
    in
        { model | openModals = openModals }



-- This does not trigger a popstate
createState: Maybe Modal -> Maybe String -> Cmd msg
createState modal url =
    let
        stateUrl =
            [ modal `Maybe.andThen` (\x -> x.targetUrl)
            , url
            ]
                |> Maybe.oneOf
                |> Maybe.withDefault placeholderUrl
    in
        History.pushState ( HistoryState modal stateUrl )



setCurrentState: Maybe Modal -> String -> Cmd msg
setCurrentState modal url =
  History.replaceState ( HistoryState modal url )
