# BirdNames DE workspace

- Use the canonical `birdnamesde` checkout configured for the current workspace, including when a chat starts in another directory. Run edits, tests, Git commands, and publication from that checkout.
- The older `/private/tmp/birdnames-sites-source` directory is a historical copy. Do not use it as the working checkout or copy files between the two directories.
- The user prefers completed app changes to be committed and pushed to `github/main` after relevant checks. Confirm that the GitHub Pages workflow succeeds and the published site serves the new version. Report clearly if publication cannot be completed.
- Keep personal absolute paths out of tracked files; use repository-relative paths or environment variables in examples. Run `python3 scripts/check-personal-paths.py` before committing.
- Keep unrelated local changes out of commits. The GitHub Pages workflow publishes `dist/`.
