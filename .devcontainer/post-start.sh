#!/usr/bin/env bash
# post-start: runs after each container start (postStartCommand in devcontainer.json).
# Naming matches post-create.sh; extend with more steps as needed (e.g. source scripts from .devcontainer/utils/).

main() {
  remove_ephemeral_env_file_if_present
}

# When initializeCommand + runArgs inject secrets via .env.development, remove the file
# after start so it is not left on disk and tooling that assumes absence does not break.
remove_ephemeral_env_file_if_present() {
  local env_file=".env.development"
  if [[ -f "$env_file" ]]; then
    rm -f "$env_file"
  fi
}

main "$@"
