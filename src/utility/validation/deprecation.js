// internal functions to formalize API deprecation

export function createDeprecationMessage(message = '') {
  return [
    '[One Service Worker]: Deprecation Notice - %s is marked for deprecation and will not be accessible in the next major release.',
    message,
  ]
    .join('\n')
    .trim();
}

export function deprecationNotice(deprecatedMember, message) {
  // assumes any deprecated items to be functions for the time being
  return function warnOnDeprecation(...args) {
    console.warn(createDeprecationMessage(message), deprecatedMember.name);
    return deprecatedMember(...args);
  };
}
