#!/usr/bin/env python
import sys
from ordd_api import __version__


def usage(exit_code):
    print("Usage:\n  sys.args[0] <FE_VERS>\n")
    sys.exit(exit_code)

#
#  MAIN
#
if __name__ == '__main__':
    if len(sys.argv) != 2:
        usage(1)

    be_vers = __version__.split('.')
    be_vers_l = len(be_vers)
    fe_vers = sys.argv[1].split('.')
    fe_vers_l = len(fe_vers)

    if be_vers_l < 3 or fe_vers_l < 3:
        print('At least one of backend version and frontend'
              ' version are not in the form x.y.z[.www]')
        sys.exit(2)

    if fe_vers[0] != be_vers[0]:
        sys.exit(1)

    if fe_vers[1] == 'x':
        sys.exit(0)

    if fe_vers[1] > be_vers[1]:
        sys.exit(1)

    if fe_vers[2] == 'x':
        sys.exit(0)

    if fe_vers[2] > be_vers[2]:
        sys.exit(1)

    # if 3 parts versions the check finish here
    if fe_vers_l <= 3:
        sys.exit(0)

    if fe_vers[3] == 'x':
        sys.exit(0)

    if fe_vers[3] > be_vers[3]:
        sys.exit(1)

    sys.exit(0)
