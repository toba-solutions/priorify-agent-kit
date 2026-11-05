#!/usr/bin/env bash
# Priorify.app posture collector: read-only, Ubuntu/Debian. Prints exactly one JSON
# object in the snapshot contract of report_component_posture and nothing else.
# Usage: bash collect-posture.sh [hostname ...]   (hostnames get a TLS expiry probe)
# It never changes anything. sudo is tried non-interactively (sudo -n) and skipped
# when unavailable; whatever cannot be read is left out or reported as "unknown".
set -u
export LC_ALL=C PATH="$PATH:/usr/sbin:/sbin"  # ufw, nft, iptables and sshd live in sbin
[ "${1:-}" = "--" ] && shift

have() { command -v "$1" >/dev/null 2>&1; }
priv() { if [ "$(id -u)" = 0 ]; then "$@"; elif have sudo; then sudo -n "$@"; else return 1; fi; }
esc() { local s=${1//\\/\\\\}; s=${s//\"/\\\"}; s=$(printf '%s' "$s" | tr -d '\000-\037'); printf '"%s"' "$s"; }
join() { local IFS=,; printf '%s' "$*"; }
limit() { if have timeout; then timeout 10 "$@"; else "$@"; fi; }
isodate() { date -u -d "$1" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -j -f "%b %e %T %Y %Z" "$1" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null; }

sections=()
add() { [ -n "$2" ] && sections+=("\"$1\":$2"); }

# Operating system and kernel
os_id="" os=() kernel=()
if [ -r /etc/os-release ]; then
  os_id=$(. /etc/os-release; printf '%s' "${ID:-}")
  name=$(. /etc/os-release; printf '%s' "${NAME:-}")
  ver=$(. /etc/os-release; printf '%s' "${VERSION_ID:-}")
  [ -n "$name" ] && os+=("\"name\":$(esc "${name:0:100}")")
  [ -n "$ver" ] && os+=("\"version\":$(esc "${ver:0:100}")")
fi
[ ${#os[@]} -gt 0 ] && add os "{$(join "${os[@]}")}"
kernel+=("\"running\":$(esc "$(uname -r)")")
if have dpkg-query; then
  newest=$(dpkg-query -W -f '${db:Status-Abbrev} ${Package}\n' 'linux-image-*' 2>/dev/null |
    awk '$1=="ii" && $2 ~ /^linux-image-[0-9]/ {sub(/^linux-image-/,"",$2); print $2}' | sort -V | tail -n1)
  [ -n "$newest" ] && kernel+=("\"installed\":$(esc "$newest")")
fi
add kernel "{$(join "${kernel[@]}")}"

# Patching (apt systems only)
if have apt-get && have dpkg-query; then
  patch=()
  # Counts only when package lists exist; without them apt cannot know what is pending.
  if compgen -G '/var/lib/apt/lists/*_Packages*' >/dev/null && sim=$(apt-get -s -o Debug::NoLocking=1 upgrade 2>/dev/null); then
    patch+=("\"security_updates_pending\":$(printf '%s\n' "$sim" | grep '^Inst ' | grep -c -- '-security')")
    patch+=("\"updates_pending\":$(printf '%s\n' "$sim" | grep -c '^Inst ')")
  fi
  rr=false; [ -e /var/run/reboot-required ] && rr=true; patch+=("\"reboot_required\":$rr")
  ua=false; grep -qs 'Unattended-Upgrade *"1"' /etc/apt/apt.conf.d/20auto-upgrades && ua=true; patch+=("\"unattended_upgrades\":$ua")
  add patching "{$(join "${patch[@]}")}"
fi

# Access: SSH settings, firewall, public ports
access=() ports=() port22=0
if sshd_t=$(priv sshd -T 2>/dev/null) && [ -n "$sshd_t" ]; then
  pw=$(printf '%s\n' "$sshd_t" | awk '$1=="passwordauthentication"{print $2}')
  root=$(printf '%s\n' "$sshd_t" | awk '$1=="permitrootlogin"{print $2}')
  [ "$pw" = yes ] && access+=('"ssh_password_login":true') || access+=('"ssh_password_login":false')
  case "$root" in
    yes) access+=('"ssh_root_login":true') ;;
    prohibit-password|without-password)
      if priv test -s /root/.ssh/authorized_keys 2>/dev/null; then access+=('"ssh_root_login":true')
      else access+=('"ssh_root_login":false'); fi ;;
    *) access+=('"ssh_root_login":false') ;;
  esac
fi
listen=""
if have ss; then listen=$(priv ss -tulpnH 2>/dev/null || ss -tulpnH 2>/dev/null); fi
if [ -n "$listen" ]; then
  seen=" "
  while read -r proto laddr proc; do
    port=${laddr##*:}
    case "$port" in ''|*[!0-9]*) continue ;; esac
    case " $seen " in *" $port/$proto "*) continue ;; esac
    [ ${#ports[@]} -ge 100 ] && break
    seen="$seen $port/$proto"
    [ "$port" = 22 ] && [ "$proto" = tcp ] && port22=1
    svc=$(printf '%s' "$proc" | sed -n 's/.*(("\([^"]*\)".*/\1/p')
    entry="\"port\":$port,\"protocol\":\"$proto\""
    [ -n "$svc" ] && entry="$entry,\"service\":$(esc "${svc:0:40}")"
    ports+=("{$entry}")
  done < <(printf '%s\n' "$listen" | awk '$5 ~ /^(0\.0\.0\.0|\[::\]|\*):[0-9]+$/ {print $1, $5, $7}')
  pj=""; [ ${#ports[@]} -gt 0 ] && pj=$(join "${ports[@]}"); access+=("\"public_ports\":[$pj]")
fi
firewall=unknown ufw_out=""
if have ufw && ufw_out=$(priv ufw status 2>/dev/null); then
  if printf '%s' "$ufw_out" | grep -q 'Status: active'; then firewall=ufw; else firewall=none; fi
fi
# An input chain that drops or rejects anything counts as a firewall; an empty accept-all chain does not.
inputfw='/^[[:space:]]*chain /{i=0} /hook input/{i=1} i && /policy drop|[[:space:]](drop|reject)([[:space:]]|$)/{f=1} END{exit !f}'
if [ "$firewall" != ufw ] && have nft && nft_out=$(priv nft list ruleset 2>/dev/null); then
  if printf '%s\n' "$nft_out" | awk "$inputfw"; then firewall=nftables; else firewall=none; fi
fi
if [ "$firewall" != ufw ] && [ "$firewall" != nftables ] && have iptables && ipt=$(priv iptables -S INPUT 2>/dev/null); then
  if printf '%s\n' "$ipt" | grep -Eq '^-P INPUT DROP|-j (DROP|REJECT)'; then firewall=iptables; else firewall=none; fi
fi
access+=("\"firewall\":\"$firewall\"")
reach=unknown
if [ -n "$listen" ]; then
  if [ $port22 = 0 ]; then reach=restricted
  elif [ "$firewall" = none ]; then reach=internet
  elif [ "$firewall" = ufw ]; then
    # internet unless every SSH allow rule names a source other than Anywhere
    ssh_rules=$(printf '%s\n' "$ufw_out" | awk '$1 ~ /^(22|22\/tcp|OpenSSH)$/ && /ALLOW|LIMIT/')
    if [ -n "$ssh_rules" ] && ! printf '%s\n' "$ssh_rules" | grep -q Anywhere; then reach=restricted; else reach=internet; fi
  fi
fi
access+=("\"ssh_reachable_from\":\"$reach\"")
if have getent; then
  sudoers=$(getent group sudo 2>/dev/null | cut -d: -f4)
  if [ -n "$sudoers" ]; then access+=("\"sudo_user_count\":$(printf '%s' "$sudoers" | tr ',' '\n' | grep -c .)"); fi
fi
have who && access+=("\"logged_in_count\":$(who 2>/dev/null | grep -c .)")
add access "{$(join "${access[@]}")}"

# Attacks
attacks=()
if have journalctl && [ -d /run/systemd/system ] && jl=$(priv journalctl -q -u ssh -u sshd --since "24 hours ago" --no-pager 2>/dev/null); then
  attacks+=("\"failed_ssh_logins_24h\":$(printf '%s\n' "$jl" | grep -c 'Failed password')")
elif have lastb && [ -e /var/log/btmp ] && lb=$(priv lastb -s -1days 2>/dev/null); then
  attacks+=("\"failed_ssh_logins_24h\":$(printf '%s\n' "$lb" | grep -v '^btmp begins' | grep -c .)")
fi
if have fail2ban-client && f2b=$(priv fail2ban-client status sshd 2>/dev/null); then
  banned=$(printf '%s\n' "$f2b" | sed -n 's/.*Currently banned:[[:space:]]*\([0-9]*\).*/\1/p')
  [ -n "$banned" ] && attacks+=("\"banned_now\":$banned")
fi
[ ${#attacks[@]} -gt 0 ] && add attacks "{$(join "${attacks[@]}")}"

# Resources
res=()
[ -r /proc/loadavg ] && res+=("\"load_1m\":$(cut -d' ' -f1 /proc/loadavg)")
have nproc && res+=("\"cores\":$(nproc)")
[ -r /proc/uptime ] && res+=("\"uptime_seconds\":$(cut -d' ' -f1 /proc/uptime)")
if have free; then mem=$(free -b 2>/dev/null | awk '/^Mem:/ && $2>0 {printf "%.0f %.1f", $2, ($2-$7)*100/$2}')
else mem=$(awk '/^MemTotal:/{t=$2} /^MemAvailable:/{a=$2} END{if (t>0) printf "%.0f %.1f", t*1024, (t-a)*100/t}' /proc/meminfo 2>/dev/null); fi
[ -n "$mem" ] && res+=("\"memory_total_bytes\":${mem% *}" "\"memory_percent\":${mem#* }")
disks=()
while read -r mount pct size; do
  [ ${#disks[@]} -ge 20 ] && break
  disks+=("{\"mount\":$(esc "${mount:0:200}"),\"percent\":${pct%\%},\"total_bytes\":$size}")
done < <(df -B1 --output=target,pcent,size -x tmpfs -x devtmpfs -x squashfs -x overlay -x efivarfs 2>/dev/null |
  awk 'NR>1 && $2 ~ /^[0-9]+%$/ && $3 ~ /^[0-9]+$/')
[ ${#disks[@]} -gt 0 ] && res+=("\"disks\":[$(join "${disks[@]}")]")
[ ${#res[@]} -gt 0 ] && add resources "{$(join "${res[@]}")}"

# Containers
dk=()
if have docker; then
  dps=$(docker ps --format '{{.Names}}|{{.Image}}|{{.Ports}}' 2>/dev/null || priv docker ps --format '{{.Names}}|{{.Image}}|{{.Ports}}' 2>/dev/null)
  while IFS='|' read -r cname image cports; do
    [ -z "$cname" ] && continue
    [ ${#dk[@]} -ge 100 ] && break
    entry="\"name\":$(esc "${cname:0:200}")"
    repo=$image tag=""
    case "${image##*/}" in *@*) repo=${image%%@*} ;; *:*) repo=${image%:*}; tag=${image##*:} ;; esac
    entry="$entry,\"image\":$(esc "${repo:0:200}")"
    [ -n "$tag" ] && entry="$entry,\"tag\":$(esc "${tag:0:100}")"
    created=$(docker image inspect --format '{{.Created}}' "$image" 2>/dev/null || priv docker image inspect --format '{{.Created}}' "$image" 2>/dev/null)
    created=$(printf '%s' "$created" | sed -n 's/^\([0-9-]*T[0-9:]*\).*/\1Z/p')
    [ -n "$created" ] && entry="$entry,\"image_created_at\":\"$created\""
    pp=$(printf '%s' "$cports" | grep -o ':[0-9]*->' | sed 's/[^0-9]//g' | sort -un | head -n 100 | paste -sd, -)
    [ -n "$pp" ] && entry="$entry,\"published_ports\":[$pp]"
    dk+=("{$entry}")
  done <<< "$dps"
fi
[ ${#dk[@]} -gt 0 ] && add containers "[$(join "${dk[@]}")]"

# Inventory (installed packages)
case "$os_id" in ubuntu|debian)
  if have dpkg-query; then
    inv=$(dpkg-query -W -f '${db:Status-Abbrev} ${Package} ${Version}\n' 2>/dev/null | awk -v eco="$os_id" '
      $1=="ii" && n<5000 { n++; gsub(/["\\]/, "", $2); gsub(/["\\]/, "", $3)
        printf "%s{\"ecosystem\":\"%s\",\"name\":\"%s\",\"version\":\"%s\"}", (n>1 ? "," : ""), eco, substr($2,1,200), substr($3,1,100) }')
    [ -n "$inv" ] && add inventory "[$inv]"
  fi ;;
esac

# Domains: TLS expiry of each hostname passed as an argument. A hostname whose
# probe fails (or without openssl) is still listed, without an expiry, so
# Priorify.app knows it was not measured and keeps its certificate finding open.
doms=()
for host in "$@"; do
  [ ${#doms[@]} -ge 50 ] && break
  case "$host" in ''|*[!A-Za-z0-9.-]*) continue ;; esac
  entry="\"hostname\":$(esc "$host")"
  if have openssl; then
    cert=$(limit openssl s_client -connect "$host:443" -servername "$host" </dev/null 2>/dev/null | openssl x509 -noout -enddate -issuer 2>/dev/null)
    end=$(printf '%s\n' "$cert" | sed -n 's/^notAfter=//p')
    expires=""; [ -n "$end" ] && expires=$(isodate "$end")
    if [ -n "$expires" ]; then
      entry="$entry,\"tls_expires_at\":\"$expires\""
      issuer=$(printf '%s\n' "$cert" | sed -n 's/^issuer= *//p')
      [ -n "$issuer" ] && entry="$entry,\"tls_issuer\":$(esc "${issuer:0:200}")"
    fi
  fi
  doms+=("{$entry}")
done
[ ${#doms[@]} -gt 0 ] && add domains "[$(join "${doms[@]}")]"

json="{$(join "${sections[@]}")}"
if have jq && printf '%s' "$json" | jq -c . 2>/dev/null; then exit 0; fi
if have python3 && printf '%s' "$json" | python3 -I -c 'import json,sys; print(json.dumps(json.load(sys.stdin), separators=(",", ":")))' 2>/dev/null; then exit 0; fi
printf '%s\n' "$json"
