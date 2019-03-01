export default function matches( node, selector ) {
  // Most modern browsers support the ".matches" method. However, IE9+ uses a
  // non-standard method name. As such, we can fall-back to the IE version when
  // the standard one doesn't exist and that should cover all the modern
  // browsers that are in use.
  // --
  // READ MORE: https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
  var nativeMatches = ( node.matches || node.webkitMatchesSelector || node.msMatchesSelector );

  // CAUTION: If an invalid pseudo-selector is used in Firefox or IE, the
  // browser will throw a SyntaxError, "is not a valid selector". It will do
  // the same for .querySelector() as well, just an FYI.
  try {
      return( nativeMatches.call( node, selector ) );
  } catch ( error ) {
      // In the case of an error, we're going to assume it's a pseudo-selector
      // issue and NOT a general support issue (since we don't care about
      // really old browsers).
      return( false );
  }
}
