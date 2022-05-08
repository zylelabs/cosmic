#!/bin/bash

script_start="deno run --allow-net ./index.ts"
script_start_dev="deno run --watch --allow-net ./index.ts"

app() {
    case $1 in
        run)
            case $2 in
                --dev)
                    $script_start_dev
                ;;

                *)
                    $script_start
                ;;
            esac
        ;;

        *)
            echo "Unknown command"
        ;;
    esac
}

app $1 $2 $3
