#!/bin/bash
IFS='
'
SP="    "
echo "country_mapping = {"
for i in $(tail -n +2 "$1"); do
    name_rd="$(echo "$i" | csvtool format '%(2)' -)"
    name_th="$(echo "$i" | csvtool format '%(4)' -)"
    if [ "$name_rd" == "" -o "$name_th" == "" ]; then
        continue
    fi
    if [ "$name_rd" != "$name_th" ]; then
        echo "${SP}\"$name_rd\": \"$name_th\","
    fi
done
echo "}"
