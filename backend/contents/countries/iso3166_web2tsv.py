#!/usr/bin/env python3
import codecs

with codecs.open('iso3166_web.txt', 'rb', encoding='utf-8') as txtfile:
    with codecs.open('iso3166.tsv', 'wb', encoding='utf-8') as csvfile:
        for i, row in enumerate(txtfile):            
            csvfile.write(row.rstrip('\n'))
            if (i % 5) == 4:
                csvfile.write('\n')
            else:
                csvfile.write('	')
