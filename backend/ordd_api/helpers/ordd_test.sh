#!/bin/bash
set -x
set -e

eecho () {
    echo "$@" | tr -d '\n'
    }

mycurl () {
    if [ "$1" = "--data" ]; then
        shift
        ret="$(curl -s -S -w "\nHTTP_CODE: %{http_code}" "$@")"
    else
        ret="$(curl -s -S -H "Content-Type: application/json" -w "\nHTTP_CODE: %{http_code}" "$@")"
    fi
    echo "$ret" | tail -n 1 >&2
    echo "$ret" | head -n -1
}

ORDD_ADMIN_PASSWORD=${ORDD_ADMIN_PASSWORD:-the_password}

# listen port
ORDD_SERVER_PORT="${ORDD_SERVER_PORT:-8000}"
API_BASEPATH="$(echo $ORDD_CONF__ORDD_API_BASEPATH | sed "s/^[^']*'//g;s/'.*//g")"
if [ -z "$API_BASEPATH" ]; then
    API_BASEPATH="api/"
fi

baseurl="http://localhost.localdomain:${ORDD_SERVER_PORT}/${API_BASEPATH}"
passwd="$ORDD_ADMIN_PASSWORD"
passwd_new="toporagno"

eecho "Try to retrieve token ... "
token="$(mycurl --data -d "username=admin_user" -d "password=$passwd" -X POST "${baseurl}get-token/")"
token="$(echo "$token" | sed 's/^{"token":"//g;s/".*//g')"
echo "RETURN:               [$token] ."
echo

eecho "Get profile ... "
profile="$(mycurl --header "Authorization: Token $token" "${baseurl}profile")"
echo "RETURN:          $profile ."
echo
# profile="$(echo "$profile" | sed 's/"email":"admin_user@/"password": "colibri","email":"admin_user_mod@/g')"
profile="$(echo "$profile" | sed 's/"email":"admin_user@/"email":"admin_user_mod@/g;s/"title":"Dr"/"title":"Dr BIG"/g')"
eecho "PUT PROFILE:          $profile ... "
mycurl -o /dev/null --header "Authorization: Token $token" -d "$profile" -X PUT "${baseurl}profile"

eecho "Get modified profile ... "
profile="$(mycurl --header "Authorization: Token $token" "${baseurl}profile")"
echo "RETURN:          $profile ."
echo

profile="$(echo "$profile" | sed 's/admin_user_mod@/admin_user@/g;s/"title":"Dr BIG"/"title":"Dr"/g')"
eecho "PUT PROFILE (revert): $profile ... "
mycurl -o /dev/null --header "Authorization: Token $token" -d "$profile" -X PUT "${baseurl}profile"

pass_change="{\"old_password\":\"$passwd\", \"new_password\":\"$passwd_new\"}"
eecho "UPDATE PASSWORD: $pass_change ... "
mycurl --header "Authorization: Token $token" -d "$pass_change" -X PUT "${baseurl}profile/password"

eecho "Retrieve token with new password ... "
token="$(mycurl --data -d "username=admin_user" -d "password=$passwd_new" -X POST "${baseurl}get-token/")"
token="$(echo "$token" | sed 's/^{"token":"//g;s/".*//g')"
echo "RETURN (with newpwd)  [$token] ."
echo
pass_change="{\"old_password\":\"$passwd_new\", \"new_password\":\"$passwd\"}"
eecho "REVERT PASSWORD: $pass_change ... "
mycurl --header "Authorization: Token $token" -d "$pass_change" -X PUT "${baseurl}profile/password"

eecho "Retrieve token with reverted password ... "
token="$(mycurl --data -d "username=admin_user" -d "password=$passwd" -X POST "${baseurl}get-token/")"
token="$(echo "$token" | sed 's/^{"token":"//g;s/".*//g')"
echo "RETURN:               [$token] ."
echo
eecho "Retrieve user list ... "
userlist="$(mycurl --header "Authorization: Token $token" "${baseurl}user/" | sed 's/{/\n{/g')"
echo "RETURN:               $userlist"
echo
eecho "Retrieve instance of user 3 ... "
user_ist="$(mycurl --header "Authorization: Token $token" "${baseurl}user/3")"
echo "USER 3 GET:           $user_ist"
echo

profile4="$(echo "$user_ist" | sed 's/"pk":3,//g;s/"reviewer_user"/"reviewer_user2"/g')"
eecho "POST PROFILE4:       [$profile4] ... "
mycurl -o /dev/null --header "Authorization: Token $token" -d "$profile4" -X POST "${baseurl}user/"
echo

eecho "GET USER LISTS AFTER CREATION ... "
userlist="$(mycurl --header "Authorization: Token $token" "${baseurl}user/" | sed 's/{/\n{/g')"
newuser_pk="$(echo "$userlist" | grep '"username":"reviewer_user2"' | sed 's/.*"pk"://g;s/,.*//g')"
echo "NEW PROFILE PK:      $newuser_pk"
echo

eecho "NEW USER GET ... "
newuser_ist="$(mycurl --header "Authorization: Token $token" "${baseurl}user/$newuser_pk")"
echo "RETURN:              $newuser_ist"
echo

newuser_ist="$(echo "$newuser_ist" | sed 's/rosa@/munde@/g;s/"title":"Drs"/"title":"Drs BIG"/g')"
eecho "PUT NEW USER:        $newuser_ist ... "
mycurl -o /dev/null --header "Authorization: Token $token" -d "$newuser_ist" -X PUT "${baseurl}user/$newuser_pk"
echo

eecho "NEW USER MOD GET ..."
newuser_ist="$(mycurl --header "Authorization: Token $token" "${baseurl}user/$newuser_pk")"
echo "RETURN:               $newuser_ist"
echo

eecho "DELETE NEW PROFILE ... "
mycurl --header "Authorization: Token $token" -X DELETE "${baseurl}user/$newuser_pk"
echo

newuser='{"username":"reginald", "password":"gazzaladra","email":"nastasi@openquake.org"}'
eecho "CREATE REGISTRATION [$newuser] ... "
mycurl --header "Authorization: Token $token" -d "$newuser" -X POST "${baseurl}registration"

eecho "GET USER LISTS AFTER CREATION ... "
userlist="$(mycurl --header "Authorization: Token $token" "${baseurl}user/" | sed 's/{/\n{/g')"
newuser_pk="$(echo "$userlist" | grep '"username":"reginald"' | sed 's/.*"pk"://g;s/,.*//g')"
echo "NEW PROFILE PK:      $newuser_pk"
echo

eecho "NEW USER GET ... "
newuser_ist="$(mycurl --header "Authorization: Token $token" "${baseurl}user/$newuser_pk")"
echo "RETURN:              $newuser_ist"
echo

eecho "DELETE NEW PROFILE ... "
mycurl --header "Authorization: Token $token" -X DELETE "${baseurl}user/$newuser_pk"
echo

echo "FINISH"


