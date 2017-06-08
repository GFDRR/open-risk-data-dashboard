#!/usr/bin/env python
import csv
import codecs

with codecs.open('iso3166.tsv', 'rb', encoding='utf-8') as csvfile:
    with codecs.open('iso3166.csv', 'wb', encoding='utf-8') as csv_out:
        countries = csv.reader(csvfile, delimiter='\t')
        countries_out = csv.writer(csv_out, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
        for country in countries:
            countries_out.writerow(country)

            
