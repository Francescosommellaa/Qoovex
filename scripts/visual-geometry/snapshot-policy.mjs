export const VISUAL_UPDATE_ATTESTATION = "I_ACKNOWLEDGE_INTENTIONAL_VISUAL_CHANGE";

export function hasSnapshotUpdateArgument(argv = []) {
  return argv.some(
    (argument) =>
      argument === "-u" ||
      argument === "--update-snapshots" ||
      argument.startsWith("--update-snapshots="),
  );
}

export function assertSnapshotUpdateAllowed({
  ci = false,
  attestation,
  argv = [],
  runnerOwnsUpdate = false,
}) {
  if (ci) throw new Error("snapshot baseline updates are forbidden in CI");
  if (hasSnapshotUpdateArgument(argv) && !runnerOwnsUpdate) {
    throw new Error("the update argument must be owned by the governed runner");
  }
  if (attestation !== VISUAL_UPDATE_ATTESTATION) {
    throw new Error(`snapshot update requires attestation: ${VISUAL_UPDATE_ATTESTATION}`);
  }
  return true;
}

