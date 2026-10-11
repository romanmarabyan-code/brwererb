const eligible = pulls.filter((pull) => !pull.draft);
if (eligible.length === 0) return null;
