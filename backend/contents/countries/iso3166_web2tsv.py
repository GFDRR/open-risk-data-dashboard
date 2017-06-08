#!/usr/bin/env python

with open('iso3166.web', 'rb') as txtfile:
    with open('iso3166.tsv', 'wb') as csvfile:
        for i, row in enumerate(txtfile):            
            csvfile.write(row.rstrip('\n'))
            if (i % 5) == 4:
                csvfile.write('\n')
            else:
                csvfile.write('	')
