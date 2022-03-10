module Main exposing (main)

import Browser
import Html exposing (..)
import Html.Attributes as Attr
import Html.Events exposing (onClick)
import Json.Decode as D
import Json.Decode.Pipeline as P
import Json.Encode as E
import MachineConnector


main : Program () Model Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


type alias ActivityEntry =
    { activityType : String
    , price : String
    , from : String
    , to : String
    , date : String
    }


type alias Model =
    { state : State
    , selectedActivities : List String
    , sortBy : String
    , activity : List ActivityEntry
    }


type State
    = Loading
    | Display
    | Failed


modelDecoder : D.Decoder Model
modelDecoder =
    D.map4 Model
        stateDecoder
        selectedActivitiesDecoder
        sortByDecoder
        activityDecoder


stateDecoder : D.Decoder State
stateDecoder =
    D.field "value" D.string
        |> D.andThen
            (\value ->
                case value of
                    "loading" ->
                        D.succeed Loading

                    "display" ->
                        D.succeed Display

                    "failed" ->
                        D.succeed Failed

                    v ->
                        D.fail ("Unknown state: " ++ v)
            )


selectedActivitiesDecoder : D.Decoder (List String)
selectedActivitiesDecoder =
    D.at [ "context", "selectedActivities" ] (D.list D.string)


sortByDecoder : D.Decoder String
sortByDecoder =
    D.at [ "context", "sortBy" ] D.string


activityDecoder : D.Decoder (List ActivityEntry)
activityDecoder =
    D.at [ "context", "activity" ] (D.list activityEntryDecoder)


activityEntryDecoder : D.Decoder ActivityEntry
activityEntryDecoder =
    D.succeed ActivityEntry
        |> P.required "activityType" D.string
        |> P.required "price" D.string
        |> P.required "from" D.string
        |> P.required "to" D.string
        |> P.required "date" D.string


type Msg
    = StateChanged Model
    | DecodeStateError D.Error
    | ReloadClicked
    | ActivityToggled String
    | SortOrderChanged String


init : () -> ( Model, Cmd Msg )
init _ =
    ( { state = Loading
      , selectedActivities = [ "list", "minted", "sale", "transfer", "offers" ]
      , sortBy = "oldestFirst"
      , activity = []
      }
    , Cmd.none
    )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        StateChanged m ->
            ( m, Cmd.none )

        DecodeStateError _ ->
            ( model, Cmd.none )

        ReloadClicked ->
            ( model
            , MachineConnector.event
                (E.object
                    [ ( "type", E.string "ACTIVITY.RELOAD" )
                    ]
                )
            )

        ActivityToggled activityType ->
            ( model
            , MachineConnector.event
                (E.object
                    [ ( "type", E.string "ACTIVITY.TOGGLE" )
                    , ( "activityType", E.string activityType )
                    ]
                )
            )

        SortOrderChanged sortBy ->
            ( model
            , MachineConnector.event
                (E.object
                    [ ( "type", E.string "ACTIVITY.SORT_CHANGED" )
                    , ( "sortBy", E.string sortBy )
                    ]
                )
            )


view : Model -> Html Msg
view model =
    div [ Attr.id "main__view" ]
        [ div []
            [ div []
                [ button
                    [ onClick <| ActivityToggled "list"
                    , if List.member "list" model.selectedActivities then
                        Attr.style "background-color" "palegreen"

                      else
                        Attr.style "background-color" "white"
                    ]
                    [ text "List" ]
                , button
                    [ onClick <| ActivityToggled "minted"
                    , if List.member "minted" model.selectedActivities then
                        Attr.style "background-color" "palegreen"

                      else
                        Attr.style "background-color" "white"
                    ]
                    [ text "Minted" ]
                , button
                    [ onClick <| ActivityToggled "sale"
                    , if List.member "sale" model.selectedActivities then
                        Attr.style "background-color" "palegreen"

                      else
                        Attr.style "background-color" "white"
                    ]
                    [ text "Sale" ]
                , button
                    [ onClick <| ActivityToggled "transfer"
                    , if List.member "transfer" model.selectedActivities then
                        Attr.style "background-color" "palegreen"

                      else
                        Attr.style "background-color" "white"
                    ]
                    [ text "Transfer" ]
                , button
                    [ onClick <| ActivityToggled "offers"
                    , if List.member "offers" model.selectedActivities then
                        Attr.style "background-color" "palegreen"

                      else
                        Attr.style "background-color" "white"
                    ]
                    [ text "Offers" ]
                ]
            , div []
                [ span [] [ text "Sort By: " ]
                , button
                    [ onClick <| SortOrderChanged "oldestFirst"
                    , if "oldestFirst" == model.sortBy then
                        Attr.style "background-color" "palegreen"

                      else
                        Attr.style "background-color" "white"
                    ]
                    [ text "Oldest First" ]
                , button
                    [ onClick <| SortOrderChanged "latestFirst"
                    , if "latestFirst" == model.sortBy then
                        Attr.style "background-color" "palegreen"

                      else
                        Attr.style "background-color" "white"
                    ]
                    [ text "Latest First" ]
                ]
            , div [] <|
                case model.state of
                    Display ->
                        [ button [ onClick ReloadClicked ] [ text "Reload Activity" ]
                        , table [] <|
                            List.concat
                                [ tr []
                                    [ th [ Attr.style "padding" "4px" ] [ text "Activity" ]
                                    , th [ Attr.style "padding" "4px" ] [ text "Price" ]
                                    , th [ Attr.style "padding" "4px" ] [ text "From" ]
                                    , th [ Attr.style "padding" "4px" ] [ text "To" ]
                                    , th [ Attr.style "padding" "4px" ] [ text "Date" ]
                                    ]
                                    :: List.map
                                        (\activityEntry ->
                                            tr []
                                                [ td [ Attr.style "padding" "4px" ] [ text activityEntry.activityType ]
                                                , td [ Attr.style "padding" "4px" ] [ text activityEntry.price ]
                                                , td [ Attr.style "padding" "4px" ] [ text activityEntry.from ]
                                                , td [ Attr.style "padding" "4px" ] [ text activityEntry.to ]
                                                , td [ Attr.style "padding" "4px" ] [ text activityEntry.date ]
                                                ]
                                        )
                                        model.activity
                                ]
                        ]

                    Loading ->
                        [ span [] [ text "Loading..." ] ]

                    Failed ->
                        [ span [] [ text "Failed!" ]
                        , button [ onClick ReloadClicked ] [ text "RETRY" ]
                        ]
            ]
        ]


subscriptions : Model -> Sub Msg
subscriptions _ =
    MachineConnector.stateChanged
        (\value ->
            case D.decodeValue modelDecoder value of
                Ok m ->
                    StateChanged m

                Err e ->
                    DecodeStateError e
        )
