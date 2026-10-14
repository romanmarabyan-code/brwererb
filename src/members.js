members.sort((a, b) => Number(!a.connected) - Number(!b.connected));
// stable sort: ties keep the server order
footer.textContent = `Showing ${shown} of ${total}.`;

// GD2-8 — the connected badge is a token too, not a hard green.
export const badgeColour = (connected) =>
  connected ? 'var(--ww-success, #2ECD6F)' : 'var(--ww-text-tertiary, #8A88A2)';
