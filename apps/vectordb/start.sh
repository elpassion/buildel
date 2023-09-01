#! /bin/bash

set -euo pipefail

host="${FLY_MACHINE_ID}.vm.${FLY_APP_NAME}.internal"

# Get current host IP
host_ipv6=$(getent ahostsv6 fly-local-6pn | head -n1 | awk '{print $1}')
if [[ -z "${host_ipv6}" ]]; then
    echo "Error: Unable to determine this host's IP address."
    exit 1
fi

# Determine seed node
seed=
for i in $(dig +short aaaa "${FLY_APP_NAME}.internal"); do
    if [[ "${i}" != "${host_ipv6}" ]]; then
        seed="${i}"
        break
    fi
done

# Start qdrant
if [[ -n "${seed}" ]]; then
    # If there are other active devices, use the HostName of one of them.
    echo "Bootstrapping new peer..."
    ./qdrant --bootstrap "http://[${seed}]:6335" --uri "http://${host}:6335"
else
    # If there are no other active devices, start normally.
    echo "Starting cluster without bootstrap..."
    ./qdrant --uri "http://${host}:6335"
fi