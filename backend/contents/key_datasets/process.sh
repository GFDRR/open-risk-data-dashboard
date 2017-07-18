#!/bin/bash

usage () {
    cat <<EOF

USAGE
    $0 <filename_prefix>

    Where filenames are in the form:
        <filename_prefix>__<capitalized_category_name>.csv

EXAMPLE 
    if you want to process this set of files:

        OpenDataDashboard_levels_v8__Basic_Data.csv
        OpenDataDashboard_levels_v8__Exposure.csv
        OpenDataDashboard_levels_v8__Hazard.csv
        OpenDataDashboard_levels_v8__Risk.csv
        OpenDataDashboard_levels_v8__Vulnerability.csv
        _or_
        OpenDataDashboard_levels_v8__Combined.csv

    call:
        $0 OpenDataDashboard_levels_v8
    
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
rm -f kd-datasets.csv
for f in $(ls ${1}__*.csv); do
    cat "$f" | tail -n +2 | grep -v '^[0-9]*,*$' | sed "s/$/,10/g" >> kd-datasets.csv
done
