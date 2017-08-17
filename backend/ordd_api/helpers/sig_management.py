#!/usr/bin/env python
#########################################################################
#
# Copyright (c) 2015, GEM Foundation.
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.
#
#########################################################################

import gc
import weakref
from django.db import models
from pprint import pprint

signalnames = ['pre_save', 'post_save', 'pre_delete',
               'post_delete', 'm2m_changed']
signals_store = {}

id_none = id(None)


def id_to_obj(id_):
    if id_ == id_none:
        return None

    for obj in gc.get_objects():
        if id(obj) == id_:
            return obj
            break
    raise Exception("Not found")


def printsignals():
    for signalname in signalnames:
        print("SIGNALNAME: %s" % signalname)
        signaltype = getattr(models.signals, signalname)
        signals = signaltype.receivers[:]
        for signal in signals:
            pprint(signal)


def designals():
    global signals_store

    for signalname in signalnames:
        signaltype = getattr(models.signals, signalname)
        print("RETRIEVE: %s: %d" % (signalname, len(signaltype.receivers)))
        signals_store[signalname] = []
        signals = signaltype.receivers[:]
        for signal in signals:
            uid = receiv_call = None
            sender_ista = sender_call = None
            # first tuple element:
            # - case (id(instance), id(method))
            if not isinstance(signal[0], tuple):
                raise "Malformed signal"

            lookup = signal[0]

            if isinstance(lookup[0], tuple):
                # receiv_ista = id_to_obj(lookup[0][0])
                receiv_call = id_to_obj(lookup[0][1])
            else:
                # - case id(function) or uid
                try:
                    receiv_call = id_to_obj(lookup[0])
                except:
                    uid = lookup[0]

            if isinstance(lookup[1], tuple):
                sender_call = id_to_obj(lookup[1][0])
                sender_ista = id_to_obj(lookup[1][1])
            else:
                sender_ista = id_to_obj(lookup[1])

            # second tuple element
            if (isinstance(signal[1], weakref.ReferenceType)):
                is_weak = True
                receiv_call = signal[1]()
            else:
                is_weak = False
                receiv_call = signal[1]

            signals_store[signalname].append({
                'uid': uid, 'is_weak': is_weak,
                'sender_ista': sender_ista, 'sender_call': sender_call,
                'receiv_call': receiv_call,
                })

            signaltype.disconnect(receiver=receiv_call,
                                  sender=sender_ista, weak=is_weak,
                                  dispatch_uid=uid)
    from pprint import pprint
    pprint(signals_store)


def resignals():
    global signals_store

    for signalname in signalnames:
        signals = signals_store[signalname]
        signaltype = getattr(models.signals, signalname)
        for signal in signals:
            signaltype.connect(signal['receiv_call'],
                               sender=signal['sender_ista'],
                               weak=signal['is_weak'],
                               dispatch_uid=signal['uid'])

