#!/bin/bash
echo "delete from ordd_api_optin where user_id = (select id from auth_user where username = '$1');"
echo "delete from ordd_api_profile where user_id = (select id from auth_user where username = '$1');"
echo "delete from authtoken_token where user_id = (select id from auth_user where username = '$1');"
echo "delete from auth_user where username = '$1';"

