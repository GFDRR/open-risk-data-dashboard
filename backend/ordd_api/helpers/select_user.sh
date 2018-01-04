#!/bin/bash
echo "select * from auth_user as u, ordd_api_profile as p WHERE u.username = '$1' AND u.id = p.user_id;"

