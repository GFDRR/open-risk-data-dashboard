#!/bin/bash

usage () {
    cat <<EOF

USAGE
    $0 <filename_prefix>

    Where filenames are in the form:
        <filename_prefix>__<capitalized_category_name>.csv

EXAMPLE 
    if you want to process this set of files:

        OpenDataDashboard_levels_v6__Basic_Data.csv
        OpenDataDashboard_levels_v6__Exposure.csv
        OpenDataDashboard_levels_v6__Hazard.csv
        OpenDataDashboard_levels_v6__Risk.csv
        OpenDataDashboard_levels_v6__Vulnerability.csv

    call:
        $0 OpenDataDashboard_levels_v6
    
EOF
    exit $1
}

if [ $# -eq 0 -o "$1" = "-h" -o "$1" = "--help" ]; then
    if [ $# -eq 0 ]; then
        usage 1
    else
        usage 0
    fi
fi


IFS='
'
rm -f levels.csv
touch levels.csv
for f in $(ls ${1}__*.csv); do
    name="$(echo "$f" | sed 's/.*__//g;s/\.csv$//g' | tr '_' ' ')"
    fname="$(echo "$name" | tr 'A-Z' 'a-z' | tr ' ' '_')"
    cat "$f" | tail -n +3 | grep -v '^[0-9]*,*$' | sed "s/^/$name,/g;s/$/,10/g" >> kd-datasets.csv
done
