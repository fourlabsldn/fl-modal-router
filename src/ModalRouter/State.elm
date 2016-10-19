port module ModalRouter.State exposing (init, update, subscriptions)

import ModalRouter.Types exposing (..)
import String
import Native.History
import Native.Modal
import Maybe


placeholderUrl =
    "placeholderUrl"



init : (Model, Cmd Msg)
init =
    (Model [], Cmd.none)



-- SUBSCRIPTIONS
-- These are basically our events sent from JavaScript



port onPopState : (Maybe HistoryState -> msg) -> Sub msg
port onModalOpen : (ModalInfo -> msg) -> Sub msg
port onModalClose : (ModalInfo -> msg) -> Sub msg



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
                    ( model , setCurrentState Nothing placeholderUrl )

                Just s ->
                  ( model , applyState s )

        ModalOpen modal ->
            let
                modalRegisteredAsOpen =
                    List.member modal model.openModals
            in
                if modalRegisteredAsOpen then
                    ( model , Cmd.none )

                else
                    ( { model | openModals = (modal :: model.openModals) }
                    , createState ( Just modal ) Nothing
                    )

        ModalClose modal ->
            let
                modalRegisteredAsClosed =
                    List.member modal model.openModals
                        |> not

                listWithoutModal =
                    List.filter (\n -> n /= modal ) model.openModals
            in
                if modalRegisteredAsClosed then
                    ( model, Cmd.none )

                else
                    ( { model | openModals = listWithoutModal }
                    , createState ( List.head listWithoutModal ) Nothing
                    ) -- TODO: make this url be the last one without a modal



applyState: HistoryState -> Cmd Msg
applyState state =
  Cmd.batch
    [ Native.History.replaceState state state.url state.url
    , case state.modal of
        Nothing ->
          Cmd.none

        Just modal ->
          Native.Modal.open modal.modalSelector
    ]



modalUrlToPageUrl: String -> String
modalUrlToPageUrl modalUrl = modalUrl



-- This does not trigger a popstate
createState: Maybe ModalInfo -> Maybe String -> Cmd msg
createState modal url =
    let
        stateUrl =
            [ modal `Maybe.andThen` (\x -> x.targetUrl)
            , url
            ]
                |> Maybe.oneOf
                |> Maybe.withDefault placeholderUrl
    in
        Native.History.pushState ( HistoryState modal stateUrl )



setCurrentState: Maybe ModalInfo -> String -> Cmd msg
setCurrentState modal url =
  Native.History.replaceState ( HistoryState modal url )
