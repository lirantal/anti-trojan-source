#!/usr/bin/env bash
#
# @file start.sh
# @summary Start the Dev Container for this workspace and attach an interactive shell.
#
# Uses @devcontainers/cli to run `devcontainer up` then `devcontainer exec bash`.
# Host port publishing comes from **runArgs** in devcontainer.json (e.g. `-p` and
# `127.0.0.1::<containerPort>` for dynamic host binding). After `devcontainer up`, this
# script reads that container port from runArgs and prints the mapped URL via `docker port`.
#
# @usage
#   .devcontainer/start.sh [options]
#
# @options
#   --recreate  Remove the existing dev container for this workspace before `up`, so
#               changes to runArgs (or other create-time settings) take effect.
#   --help, -h  Print usage and exit.
#
# @example
#   .devcontainer/start.sh
#   .devcontainer/start.sh --recreate
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_FOLDER="$(cd "$SCRIPT_DIR/.." && pwd)"
CLI_VERSION="0.84.1"

usage() {
  cat <<EOF
Usage: $(basename "$0") [options]

Start the dev container for:
  $WORKSPACE_FOLDER

Then open an interactive bash session inside the container.

Options:
  --recreate    Remove the existing dev container for this workspace before starting,
                so Docker picks up new settings (e.g. runArgs / port mappings).
  --help, -h    Show this help and exit.

Notes:
  Port publishing uses runArgs (Docker -p ...::<containerPort>). The script greps that
  container port from devcontainer.json for the post-up URL hint.
EOF
}

# Container-side TCP port published via runArgs, e.g. "127.0.0.1::3000" (Docker -p host::ctr).
# Requires GNU grep (-P); same as the containerId parse below.
publish_container_port_from_devcontainer_json() {
  local f="$SCRIPT_DIR/devcontainer.json"
  if [ ! -r "$f" ]; then
    return 1
  fi
  sed 's|//.*||' "$f" | grep -oP '"[0-9.]+\:\:\K[0-9]+(?=")' | head -n1
}

RECREATE=false
while [ $# -gt 0 ]; do
  case "$1" in
    --help | -h)
      usage
      exit 0
      ;;
    --recreate)
      RECREATE=true
      shift
      ;;
    *)
      echo "Unknown option: $1" >&2
      echo "Run with --help for usage." >&2
      exit 1
      ;;
  esac
done

echo "Starting devcontainer for: $WORKSPACE_FOLDER"

UP_ARGS=(--workspace-folder "$WORKSPACE_FOLDER")
if [ "$RECREATE" = true ]; then
  UP_ARGS+=(--remove-existing-container)
  echo "Removing existing dev container so create-time settings (e.g. runArgs) apply."
fi

UP_OUTPUT="$(npx --yes "@devcontainers/cli@${CLI_VERSION}" up "${UP_ARGS[@]}")"
echo "$UP_OUTPUT"

CONTAINER_ID="$(echo "$UP_OUTPUT" | grep -oP '"containerId"\s*:\s*"\K[^"]+')" || true
if [ -z "$CONTAINER_ID" ]; then
  CONTAINER_ID="$(docker ps --filter "label=devcontainer.local_folder=$WORKSPACE_FOLDER" --format '{{.ID}}' | head -n1)"
fi

CONTAINER_PORT="$(publish_container_port_from_devcontainer_json || true)"
if [ -n "$CONTAINER_ID" ]; then
  if [ -n "$CONTAINER_PORT" ]; then
    HOST_BINDING="$(docker port "$CONTAINER_ID" "${CONTAINER_PORT}/tcp" 2>/dev/null | head -n1)" || true
    if [ -n "$HOST_BINDING" ]; then
      echo ""
      echo "Dev server available at: http://${HOST_BINDING}"
      echo ""
    else
      echo "Warning: container is running but port ${CONTAINER_PORT}/tcp is not mapped." >&2
    fi
  else
    echo "Warning: could not find a runArgs publish port (expected a quoted string like \"127.0.0.1::<port>\")." >&2
    echo "         Skipping docker port URL hint." >&2
  fi
else
  echo "Warning: could not resolve container ID; skipping port lookup." >&2
fi

echo "Dropping into container shell..."
# Resolve TERM to something the container's terminfo knows about.
# Terminals like kitty, ghostty, alacritty set custom TERM values the container won't have.
# Fall back to xterm-256color (truecolor still works via COLORTERM=truecolor).
if ! infocmp "${TERM:-xterm-256color}" &>/dev/null 2>&1; then
  TERM=xterm-256color
fi
TERM="${TERM:-xterm-256color}" npx --yes @devcontainers/cli@${CLI_VERSION} exec --workspace-folder "$WORKSPACE_FOLDER" -- env TERM="${TERM:-xterm-256color}" COLORTERM=truecolor bash
