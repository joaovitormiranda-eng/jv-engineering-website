// URL fragment helpers shared by the page scripts. A malformed percent-escape
// in a fragment (for example a link or address ending in "#%E0") makes
// decodeURIComponent throw; these helpers return null instead, so a bad URL
// can never stop a script half-way through its setup.

// "#estudo-qee" or "estudo-qee" -> "estudo-qee"; malformed -> null.
export function decodeFragment(hash) {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash
  try {
    return decodeURIComponent(raw)
  } catch {
    return null
  }
}

// Element whose id is the decoded fragment, or null.
export function elementForHash(hash) {
  const id = decodeFragment(hash)
  return id ? document.getElementById(id) : null
}
