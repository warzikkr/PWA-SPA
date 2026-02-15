#!/bin/bash
# Creates auth users via Supabase signUp API, then links them in public.users
# Run from project root: bash supabase/create-users.sh

API="https://oiwosdouppdgivcqgqua.supabase.co"
ANON="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pd29zZG91cHBkZ2l2Y3FncXVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNTY1NzUsImV4cCI6MjA4NjczMjU3NX0.tiJ9YdaPrOkxXFgF-Np5JYMksVsvoBEKlN1_e8rkIRg"

signup() {
  local email=$1 pass=$2
  echo "Creating $email ..."
  result=$(curl -s -X POST "$API/auth/v1/signup" \
    -H "apikey: $ANON" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$pass\"}")
  uid=$(echo "$result" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
  if [ -z "$uid" ]; then
    echo "  FAILED: $result"
    return 1
  fi
  echo "  OK: auth_uid=$uid"
  echo "$uid"
}

echo "=== Creating auth users ==="
ADMIN_UID=$(signup "admin@spa.local" "admin123")
RECEP_UID=$(signup "reception@spa.local" "reception123")
ANNA_UID=$(signup "anna@spa.local" "anna1234")
MARIA_UID=$(signup "maria@spa.local" "maria1234")

# Extract just the UUID (last line of each output)
ADMIN_UID=$(echo "$ADMIN_UID" | tail -1)
RECEP_UID=$(echo "$RECEP_UID" | tail -1)
ANNA_UID=$(echo "$ANNA_UID" | tail -1)
MARIA_UID=$(echo "$MARIA_UID" | tail -1)

echo ""
echo "=== Linking to public.users ==="
echo "Run this SQL in Supabase SQL Editor:"
echo ""
cat <<EOF
INSERT INTO public.users (full_name, username, role, therapist_id, enabled, auth_uid) VALUES
  ('Admin',      'admin',     'admin',     NULL,   true, '$ADMIN_UID'),
  ('Front Desk', 'reception', 'reception', NULL,   true, '$RECEP_UID'),
  ('Anna K.',    'anna',      'therapist', 'th_1', true, '$ANNA_UID'),
  ('Maria S.',   'maria',     'therapist', 'th_2', true, '$MARIA_UID');
EOF
