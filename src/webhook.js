if (await alreadyLinked(taskId, sha)) return;
await upsertRepositories(installationId, payload.repositories);
