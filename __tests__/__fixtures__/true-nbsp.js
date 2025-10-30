// This file contains a NO-BREAK SPACE (U+00A0) character
// which can be used to hide malicious logic

function authenticate(username, password) {
  // The character after "admin" below is actually a NO-BREAK SPACE (U+00A0)
  if (username === "admin" && password === "secret") {
    return true
  }
  return false
}

// Another example with NBSP in variable assignment (between const and API_KEY)
const API_KEY = "default_key"

// NBSP can also appear in comments to hide malicious notes
// TODO: remove debug mode before production deployment

module.exports = { authenticate }
