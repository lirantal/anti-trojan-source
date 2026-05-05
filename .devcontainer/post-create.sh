#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

main() {
  configure_local_git
  install_apm
  # install_opencode_cli
  install_1password_cli
  install_snyk_cli
  run_deps_install
}

configure_local_git() {
  # Local git prefs only apply inside a repository; skip when there is no .git (avoids postCreate failure).
  if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    git config --local commit.gpgsign false
    git config --local core.pager 'less -R'
  fi
}

install_apm() {
  # Agent Package Manager: https://github.com/microsoft/apm
  curl -sSL https://aka.ms/apm-unix | sh
}

install_opencode_cli() {
  curl -fsSL https://opencode.ai/install | bash
}

install_snyk_cli() {
  # https://docs.snyk.io/snyk-cli/install-the-snyk-cli
  local url
  case "$(uname -m)" in
    aarch64 | arm64) url="https://static.snyk.io/cli/latest/snyk-linux-arm64" ;;
    x86_64 | amd64) url="https://static.snyk.io/cli/latest/snyk-linux" ;;
    *)
      echo "post-create: skipping Snyk CLI (unsupported arch: $(uname -m))" >&2
      return 0
      ;;
  esac
  curl --compressed -fsSL "${url}" -o /tmp/snyk
  chmod +x /tmp/snyk
  sudo mv -f /tmp/snyk /usr/local/bin/snyk
}

install_1password_cli() {
  local op_version="2.32.1"
  curl -fsSL "https://cache.agilebits.com/dist/1P/op2/pkg/v${op_version}/op_linux_arm64_v${op_version}.zip" -o /tmp/op.zip
  python3 -c "import zipfile; zipfile.ZipFile('/tmp/op.zip').extract('op', '/tmp')"
  sudo mv /tmp/op /usr/local/bin/op && chmod +x /usr/local/bin/op && rm /tmp/op.zip
}

run_deps_install() {
  bash "${SCRIPT_DIR}/utils/deps-install.sh"
}

main "$@"
