#!/usr/bin/env bash
# initialize: runs on host before container create/start (initializeCommand).
# Prepares .env.development and, when possible, injects OP_SERVICE_ACCOUNT_TOKEN from 1Password.

set -euo pipefail

WORKSPACE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${WORKSPACE_DIR}/.env.development"
OP_TOKEN_REFERENCE="op://Private/1Password op CLI Service Account for DevContainers/password"

main() {
  ensure_env_file_exists
  maybe_inject_1password_service_account_token
}

ensure_env_file_exists() {
  if [[ ! -f "${ENV_FILE}" ]]; then
    : > "${ENV_FILE}"
  fi
}

maybe_inject_1password_service_account_token() {
  local token

  if ! command -v op >/dev/null 2>&1; then
    echo "initialize.sh: op CLI not found; leaving ${ENV_FILE} unchanged."
    return 0
  fi

  if ! token="$(op read "${OP_TOKEN_REFERENCE}" 2>/dev/null)"; then
    echo "initialize.sh: could not read OP service token from 1Password; leaving ${ENV_FILE} unchanged."
    return 0
  fi

  if [[ -z "${token}" ]]; then
    echo "initialize.sh: OP service token is empty; leaving ${ENV_FILE} unchanged."
    return 0
  fi

  upsert_env_var "OP_SERVICE_ACCOUNT_TOKEN" "${token}"
}

upsert_env_var() {
  local key="$1"
  local value="$2"
  local tmp_file

  tmp_file="$(mktemp)"
  awk -F= -v k="${key}" '$1 != k' "${ENV_FILE}" > "${tmp_file}"
  printf '%s=%s\n' "${key}" "${value}" >> "${tmp_file}"
  mv "${tmp_file}" "${ENV_FILE}"
}

main "$@"
