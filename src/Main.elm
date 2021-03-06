port module Main exposing (main)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Json.Encode as E exposing (Value)
import Time exposing (Time)
import Task


-- Ports : Outgoing


port loadMap : LatLng -> Cmd msg


port setCenter : Model -> Cmd msg



-- Ports: Incoming


port receiveMap : (Value -> msg) -> Sub msg



-- MODEL


type alias Model =
    { gmap : Value
    , center : LatLng
    }


type alias LatLng =
    { lat : Float
    , lng : Float
    }


init : ( Model, Cmd Msg )
init =
    let
        center =
            LatLng 43 4.5
    in
        ( Model (E.string "to be replaced by google map") center
        , Time.now |> Task.perform Tick
        )



-- UPDATE


type Msg
    = North
    | Tick Time
    | JSMap Value


update : Msg -> Model -> ( Model, Cmd Msg )
update message model =
    case message of
        North ->
            let
                center =
                    model.center

                newCenter =
                    { center | lat = center.lat + 1 }

                newModel =
                    { model | center = newCenter }
            in
                newModel ! [ setCenter newModel ]

        JSMap gmap ->
            { model | gmap = gmap } ! []

        Tick _ ->
            model ! [ loadMap model.center ]



-- VIEW


view : Model -> Html Msg
view model =
    div
        [ style
            [ ( "display", "flex" ) ]
        ]
        [ div []
            [ h3 [] [ text "Elm land" ]
            , button
                [ onClick North ]
                [ text "North" ]
            ]
        , div
            [ style
                [ ( "margin-left", "100px" )
                ]
            ]
            [ h3 [] [ text "Javascript land" ]
            , gmap [ mapStyles ] []
            ]
        ]


mapStyles : Attribute msg
mapStyles =
    style
        [ ( "display", "block" )
        , ( "height", "200px" )
        , ( "width", "200px" )
        ]


gmap : List (Attribute msg) -> List (Html msg) -> Html msg
gmap =
    node "gmap"



-- PROGRAM


main =
    Html.program
        { init = init
        , update = update
        , view = view
        , subscriptions = always (receiveMap JSMap)
        }
