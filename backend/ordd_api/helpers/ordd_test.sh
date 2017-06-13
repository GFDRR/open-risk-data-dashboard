#!/bin/bash
set -e

mycurl () {
    ret="$(curl -s -S -w "\nHTTP RET: %http_code" $@)"
    echo "$ret" | tail -n 1 >&2
    echo "$ret" | head -n -1
}

baseurl="http://localhost.localdomain:8000/api/"
passwd="canarino"

token="$(curl -s -S -d "username=admin_user" -d "password=$passwd" -X POST "${baseurl}get-token/")"
token="$(echo "$token" | sed 's/^{"token":"//g;s/".*//g')"
echo "GET TOKEN:            $token ."
echo
profile="$(curl -s -S --header "Authorization: Token $token" "${baseurl}profile")"
echo "GET PROFILE:          $profile ."
echo
# profile="$(echo "$profile" | sed 's/"email":"admin_user@/"password": "colibri","email":"admin_user_mod@/g')"
profile="$(echo "$profile" | sed 's/"email":"admin_user@/"email":"admin_user_mod@/g')"
echo "PUT PROFILE:          $profile ... " | tr -d '\n'
curl -s -S --header "Authorization: Token $token" -H "Content-Type: application/json" -d "$profile" -X PUT "${baseurl}profile" && echo "done."
echo
echo "GET PROFILE:          $profile ."
echo
profile="$(echo "$profile" | sed 's/admin_user_mod@/admin_user@/g')"
echo "PUT PROFILE (revert): $profile ... " | tr -d '\n'
curl -s -S --header "Authorization: Token $token" -H "Content-Type: application/json" -d "$profile" -X PUT "${baseurl}profile" && echo "done."
echo
passwd_new="toporagno"
pass_change="{\"old_password\":\"$passwd\", \"new_password\":\"$passwd_new\"}"
echo "UPDATE PASSWORD: $pass_change ... " | tr -d '\n'
curl -s -S -w "\n%http_code" --header "Authorization: Token $token" -H "Content-Type: application/json" -d "$pass_change" -X PUT "${baseurl}profile/password" && echo "done."
token="$(curl -s -S -d "username=admin_user" -d "password=$passwd_new" -X POST "${baseurl}get-token/")"



userlist="$(curl -s -S --header "Authorization: Token $token" "${baseurl}user/" | sed 's/{/\n{/g')"
echo "USER LIST GET:        $userlist"
echo
user_ist="$(curl -s -S --header "Authorization: Token $token" "${baseurl}user/3")"
echo "USER 3 GET:           $user_ist"
echo
profile3="$(curl -s -S --header "Authorization: Token $token" -H "Content-Type: application/json" -X GET "${baseurl}user/3")"
echo "GET PROFILE3:        $profile3 ."
echo

profile4="$(echo "$profile3" | sed 's/"pk":3,//g;s/"reviewer_user"/"reviewer_user2"/g')"
echo "POST PROFILE4:       $profile4 ... " | tr -d '\n'
curl -s -S --header "Authorization: Token $token" -H "Content-Type: application/json" -d "$profile4" -X POST "${baseurl}user/" && echo "done."
echo
userlist="$(curl -s -S --header "Authorization: Token $token" "${baseurl}user/" | sed 's/{/\n{/g')"
newuser_pk="$(echo "$userlist" | grep '"username":"reviewer_user2"' | sed 's/.*"pk"://g;s/,.*//g')"
echo "NEW PROFILE PK:      $newuser_pk"
echo

newuser_ist="$(curl -s -S --header "Authorization: Token $token" "${baseurl}user/$newuser_pk")"
echo "NEW USER GET:        $newuser_ist"
echo

newuser_ist="$(echo "$newuser_ist" | sed 's/rosa@/munde@/g')"
echo "PUT NEW USER:        $newuser_ist ... " | tr -d '\n'
curl -s -S --header "Authorization: Token $token" -H "Content-Type: application/json" -d "$newuser_ist" -X PUT "${baseurl}user/$newuser_pk" && echo "done."
echo

newuser_ist="$(curl -s -S --header "Authorization: Token $token" "${baseurl}user/$newuser_pk")"
echo "NEW USER MOD GET:    $newuser_ist"
echo

echo "DELETE NEW PROFILE ... " | tr -d '\n'
curl -s -S --header "Authorization: Token $token" -H "Content-Type: application/json" -X DELETE "${baseurl}user/$newuser_pk" && echo "done."
echo

echo "FINISH"


