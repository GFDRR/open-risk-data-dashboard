#!/bin/bash
IFS='
'
rm -f taxonomy-categories.psv taxonomy-subcategories.psv
touch taxonomy-categories.psv
touch taxonomy-subcategories.psv
for f in $(ls tax-*.txt); do
    fout="$(basename $f .txt)"
    fout="$(echo "$fout" | cut -c 5-)"
    category="$(echo "${fout^}" | sed 's/-\(.\)/ \U\1/g')"
    is_first=false
    echo "$category" >> taxonomy-categories.psv
    for line in $(cat $f); do
        id="$(echo "$line" | cut -d ' ' -f 1)"
        body="$(echo "$line" | cut -d ' ' -f 2-)"
        if [ -z "$body" ]; then
            echo "WARNING body is empty, skip"
            continue
        fi
        #    echo "$id"
        echo "$id" | grep -q "^[0-9]\+\.\$"
        if [ $? -eq 0 ]; then
            if [ "$is_first" == "true" ]; then
                echo "$category|$prefix" >> taxonomy-subcategories.psv
            fi
            prefix="$body"
            is_first=true
        else
            echo "$category|$prefix - $body" >> taxonomy-subcategories.psv
            is_first=false
        fi
    done
    if [ "$is_first" == "true" ]; then
        echo "$category|$prefix" >> taxonomy-subcategories.psv
    fi
done

echo
echo "NOTE:"
echo
echo "   open a new terminal, add '|<weight>' to each line of taxonomy-categories.psv,"
echo "   then, on this terminal, press enter"
echo
read a
