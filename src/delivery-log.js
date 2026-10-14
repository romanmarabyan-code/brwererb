// GD2-6 — the delivery ids this process has already handled.
//
// GitHub retries a delivery up to three times, and a retry carries the SAME
// X-GitHub-Delivery. Remembering the id is enough to drop the repeat; nothing
// here looks at the payload, and nothing here decides ordering.
//
// Bounded on purpose: a webhook handler runs for weeks, so the log keeps the
// most recent MAX_IDS and evicts the oldest. A Map iterates in insertion order,
// which is what makes the oldest the first key.
export const MAX_IDS = 500;

const handled = new Map();

export const hasSeen = (deliveryId) => handled.has(deliveryId);

export const markSeen = (deliveryId) => {
  handled.set(deliveryId, Date.now());

  while (handled.size > MAX_IDS) {
    handled.delete(handled.keys().next().value);
  }
};

/** Test seam: nothing in the application clears the log. */
export const reset = () => handled.clear();
