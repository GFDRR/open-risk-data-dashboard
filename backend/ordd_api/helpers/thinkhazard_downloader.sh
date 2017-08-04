#!/bin/bash
# with this script you can download all administrative divisions from ThinkHazard! site.

usage () {
    cat <<EOF
$0 [-n|--no-cache]
  -n|--no-cache  - override cached files if found
EOF
    exit $1
}
while [ $# -gt 0 ]; do
    case $1 in
        -n|--no-cache)
            NO_CACHE=y
            shift
            ;;
        *)
            usage 1
            ;;
    esac
done

CACHE_DIR="$(dirname "$PWD/$0")/../../contents/thinkhazard/cache"
COUNTRIES_FILE="$(dirname "$PWD/$0")/../../contents/thinkhazard/enhanced_countries.txt"
if [ ! -d "$CACHE_DIR" ]; then
    mkdir -p "$CACHE_DIR"
fi

BASE_URL='http://thinkhazard.org/en'
IFS='
'
for name in  in $(grep -v '^#' "$COUNTRIES_FILE"); do
    if [ ! -f "$CACHE_DIR/adm_division_${name}.json" -o "$NO_CACHE" = "y" ]; then
        curl --data-urlencode "q=$name" -o "$CACHE_DIR/adm_division_${name}.json" "${BASE_URL}/administrativedivision"
    fi
done
