#!/usr/bin/env bash
set -euo pipefail

: "${NAMECHEAP_API_USER:?must be set}"
: "${NAMECHEAP_API_KEY:?must be set}"
: "${NAMECHEAP_IP:?must be set}"
: "${NAMECHEAP_SUBDOMAIN:?must be set}"

SLD="andresmoralescomco"
TLD="co"

API_BASE="https://api.namecheap.com/xml.response"

BACKUP_FILE="/tmp/${SLD}.${TLD}.zone.$(date +%s).xml"

# 1. Backup current zone (read-only; safe even before any apply)
echo "Backing up current zone to ${BACKUP_FILE}..."
curl -fsS -o "${BACKUP_FILE}" \
  "${API_BASE}?ApiUser=${NAMECHEAP_API_USER}&ApiKey=${NAMECHEAP_API_KEY}&UserName=${NAMECHEAP_API_USER}&Command=namecheap.domains.dns.getHosts&ClientIp=${NAMECHEAP_IP}&SLD=${SLD}&TLD=${TLD}"

ZONE=$(cat "${BACKUP_FILE}")

# 2. Parse existing records into "Name Type Address TTL" lines
mapfile -t RECORDS < <(echo "$ZONE" | grep -oP '<host[^/]*/>' | sed -E 's|.*Name="([^"]*)".*Type="([^"]*)".*Address="([^"]*)".*TTL="([^"]*)".*|\1 \2 \3 \4|')

N=${#RECORDS[@]}
NEW_IDX=$((N + 1))

# 3. Build PARAMS: preserve ALL existing records, append the new A record
PARAMS=(
  "ApiUser=${NAMECHEAP_API_USER}"
  "ApiKey=${NAMECHEAP_API_KEY}"
  "UserName=${NAMECHEAP_API_USER}"
  "Command=namecheap.domains.dns.setHosts"
  "ClientIp=${NAMECHEAP_IP}"
  "SLD=${SLD}"
  "TLD=${TLD}"
)

for i in "${!RECORDS[@]}"; do
  idx=$((i + 1))
  read -r NAME TYPE ADDR TTL <<< "${RECORDS[$i]}"
  PARAMS+=(
    "HostName${idx}=${NAME}"
    "RecordType${idx}=${TYPE}"
    "Address${idx}=${ADDR}"
    "TTL${idx}=${TTL}"
  )
done

PARAMS+=(
  "HostName${NEW_IDX}=${NAMECHEAP_SUBDOMAIN}"
  "RecordType${NEW_IDX}=A"
  "Address${NEW_IDX}=${NAMECHEAP_IP}"
  "TTL${NEW_IDX}=300"
)

# 4. Dry-run gate
echo "DRY-RUN: would set zone for ${SLD}.${TLD} with ${N} existing record(s) + 1 new A record:"
for i in "${!RECORDS[@]}"; do
  echo "  [$((i+1))] ${RECORDS[$i]}"
done
echo "  [${NEW_IDX}] ${NAMECHEAP_SUBDOMAIN} A ${NAMECHEAP_IP} 300  (NEW)"
echo "Zone backup: ${BACKUP_FILE}"

if [ "${NAMECHEAP_APPLY:-false}" != "true" ]; then
  echo "Set NAMECHEAP_APPLY=true to actually call setHosts."
  exit 0
fi

# 5. Apply
QUERY=$(IFS='&'; echo "${PARAMS[*]}")
RESPONSE=$(curl -fsS "${API_BASE}?${QUERY}")
echo "${RESPONSE}"
echo "DNS update issued for ${NAMECHEAP_SUBDOMAIN}.andresmorales.com.co → ${NAMECHEAP_IP}"
