#!/usr/bin/env python3
import sys
import csv
import codecs

iso_countries = []
with codecs.open('iso3166.csv', 'rb', encoding='utf-8') as csvfile:
    countries = csv.reader(csvfile, delimiter=',')
    for country in countries:
        iso_countries.append(country)

iso_diff = iso_countries[:]

with codecs.open('ordd_countries_list.csv', 'rb', encoding='utf-8') as csvfile:
    with codecs.open('ordd_countries_list_iso3166.csv', 'wb', encoding='utf-8') as csv_out:
        countries = csv.reader(csvfile, delimiter=',')
        countries_out = csv.writer(csv_out, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
        is_first = True
        for country in countries:
            print ("XXX", country[1])
            if is_first:
                is_first = False
                continue
            for i, v in enumerate(iso_countries):
                if v[0] == country[1]:
                    iso_diff.remove(v)
                    country.insert(0, v[2])
                    print("FOUND country: [%s]" % country[1])
                    break
                elif v[0].startswith(country[1] + ','):
                    print("FOUND2 country: [%s] ISO: [%s]" % (country[1], v[0]))
                    iso_diff.remove(v)
                    country.insert(0, v[2])
                    break
                else:
                    if '(' in v[0]:
                        v_sub = v[0][0:v[0].index('(') - 1]
                        v_in = v[0][v[0].index('(') + 1:v[0].rindex(')')]
                        # print "[%s] => [%s]" % (v[0], v_sub)
                        if country[1] == v_sub:
                            print("FOUND4 country: [%s] ISO: [%s]" % (country[1], v[0]))
                            iso_diff.remove(v)
                            country.insert(0, v[2])
                            break

                        # print "XXX [%s]" % (v_in + ' ' + v_sub)

                        if country[1] == (v_in + ' ' + v_sub):
                            print("FOUND5 country: [%s] ISO: [%s]" % (country[1], v[0]))
                            iso_diff.remove(v)
                            country.insert(0, v[2])
                            break

                    v_parts = v[0].split(',')
                    if len(v_parts) > 1:
                        # print "XX [%s]" % v_parts[1][1:]
                        if (v_parts[1][1:] + ' ' + v_parts[0]) == country[1]:
                            print("FOUND3 country: [%s] ISO: [%s]" % (country[1], v[0]))
                            iso_diff.remove(v)
                            country.insert(0, v[2])
                            break
            else:
                print("NOT FOUND country: [%s]" % country[1])

            countries_out.writerow(country)

print("ISO Countries not found:")
for df in iso_diff:
    print(df[0])
            
sys.exit(0)

    
