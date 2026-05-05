#!/usr/bin/env bash
# Install workspace JS dependencies when package.json exists (non-fatal on failure).

main() {
  [[ -f package.json ]] || return 0
  local pm
  pm=$(detect_package_manager)
  install_dependencies "$pm" || true
}

detect_package_manager() {
  local pm
  if pm=$(detect_package_manager_from_lockfiles); then
    echo "$pm"
    return
  fi
  if pm=$(detect_package_manager_from_repo_markers); then
    echo "$pm"
    return
  fi
  if pm=$(detect_package_manager_from_package_json); then
    echo "$pm"
    return
  fi
  echo npm
}

detect_package_manager_from_lockfiles() {
  if [[ -f pnpm-lock.yaml ]]; then
    echo pnpm
    return 0
  fi
  if [[ -f bun.lockb || -f bun.lock ]]; then
    echo bun
    return 0
  fi
  if [[ -f yarn.lock ]]; then
    echo yarn
    return 0
  fi
  if [[ -f package-lock.json ]]; then
    echo npm
    return 0
  fi
  return 1
}

detect_package_manager_from_repo_markers() {
  if [[ -f pnpm-workspace.yaml ]]; then
    echo pnpm
    return 0
  fi
  if [[ -f bunfig.toml ]]; then
    echo bun
    return 0
  fi
  if [[ -f .yarnrc.yml ]]; then
    echo yarn
    return 0
  fi
  return 1
}

detect_package_manager_from_package_json() {
  [[ -f package.json ]] || return 1
  node -e "
    const p = require('./package.json');
    const spec = p.packageManager;
    if (!spec || typeof spec !== 'string') process.exit(1);
    const name = spec.split('@')[0].trim();
    if (!['pnpm', 'npm', 'yarn', 'bun'].includes(name)) process.exit(1);
    console.log(name);
  " 2>/dev/null || return 1
}

install_dependencies() {
  local pm="$1"
  case "$pm" in
    pnpm) pnpm install ;;
    npm) npm install ;;
    yarn) yarn install ;;
    bun) bun install ;;
    *) npm install ;;
  esac
}

main "$@"
