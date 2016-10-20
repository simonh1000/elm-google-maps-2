module Main exposing (main)

import Html

import App exposing (..)

main =
  Html.program
    { init = init
    , update = update
    , view = view
    -- , subscriptions = always (receiveMap App.JSMap)
    , subscriptions = always Sub.none
    }
