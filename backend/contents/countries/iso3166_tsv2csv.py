#!/usr/bin/env python
import csv

with open('iso3166.tsv', 'rb') as csvfile:
    with open('iso3166.csv', 'wb') as csv_out:
        countries = csv.reader(csvfile, delimiter='\t')
        countries_out = csv.writer(csv_out, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
        for country in countries:
            countries_out.writerow(country)

            
