#!/bin/bash
IFS='
'
rm -f taxonomy.psv taxonomy-categories.psv
touch taxonomy.psv
touch taxonomy-categories.psv
for f in $(ls tax-*.txt); do
    fout="$(basename $f .txt)"
    fout="$(echo "$fout" | cut -c 5-)"
    category="$(echo "${fout^}" | sed 's/-\(.\)/ \U\1/g')"
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
            prefix="$body"
        else
            echo "$category|$prefix - $body" >> taxonomy.psv
        fi
    done
done
