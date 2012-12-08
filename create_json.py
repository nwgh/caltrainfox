#!/usr/bin/env python

import csv
import json

with file('raw_data/trips.txt') as f:
    csv_trips = list(csv.reader(f))[1:]

with file('raw_data/stop_times.txt') as f:
    csv_times = list(csv.reader(f))[1:]

with file('raw_data/stops.txt') as f:
    csv_stops = list(csv.reader(f))[1:]

# This sorts the stops by latitude. South ends up first, so we have to
# reverse the list to get them ordered north->south
csv_stops.sort(key=lambda x: float(x[3]))
csv_stops.reverse()

stops = {}
for i, stop in enumerate(csv_stops):
    if not stop:
        continue
    name = stop[0]
    zone = int(stop[5])
    stops[name] = {'id': i, 'zone': zone}

trips = {}
for trip in csv_trips:
    if not trip:
        continue
    name = trip[0]
    train = trip[0][:3]
    southbound = bool(int(trip[4]))
    trips[name] = {'train': train, 'southbound': southbound}

times = {}
for time in csv_times:
    if not time:
        continue
    tripid = time[0]
    hh, mm, _ = time[1].split(':')
    tstamp = (int(hh) * 100) + int(mm)
    stopname = time[3]
    stationid = stops[stopname]['id']
    if tripid not in times:
        times[tripid] = []
    stop = {'time': tstamp, 'station': stationid}
    times[tripid].append(stop)

wd_nb = []
wd_sb = []
we_nb = []
we_sb = []
for tripid, tripinfo in trips.iteritems():
    timepoints = times[tripid]
    trip_stops = [-1] * len(stops)
    for timepoint in timepoints:
        trip_stops[timepoint['station']] = timepoint['time']

    trip = {'train': tripinfo['train'], 'stops': trip_stops}

    is_weekday = trip['train'][0] in ('1', '2', '3')

    if tripinfo['southbound']:
        if is_weekday:
            wd_sb.append(trip)
        else:
            we_sb.append(trip)
    else:
        if is_weekday:
            wd_nb.append(trip)
        else:
            we_nb.append(trip)


def train_key(trip):
    train = trip['train']
    # We only want to order on the last 2 digits of the train
    return int(train[1:])

wd_nb.sort(key=train_key)
wd_sb.sort(key=train_key)
we_nb.sort(key=train_key)
we_sb.sort(key=train_key)

with file('stops.js', 'w') as f:
    f.write('CaltrainFox.wd_nb = %s;\n' % (json.dumps(wd_nb),))
    f.write('CaltrainFox.wd_sb = %s;\n' % (json.dumps(wd_sb),))
    f.write('CaltrainFox.we_nb = %s;\n' % (json.dumps(we_nb),))
    f.write('CaltrainFox.we_sb = %s;\n' % (json.dumps(we_sb),))

stations = []
for stopname, stopinfo in stops.iteritems():
    # We want to get rid of the " Caltrain" from each station name, as it's
    # redundant.
    stations.append({'station_name': stopname[:-9],
                     'station_id': stopinfo['id'],
                     'zone': stopinfo['zone']})

stations.sort(key=lambda x: x['station_id'])

with file('stations.js', 'w') as f:
    f.write('CaltrainFox.stations = %s;\n' % (json.dumps(stations),))
