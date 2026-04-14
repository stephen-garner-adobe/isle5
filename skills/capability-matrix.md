# Capability Matrix

Draft capability map for the consolidated skill system.

| Name | Reads code | Writes code | Runs lint/build | Runs Cypress or visual checks | Edits docs/contracts | Compares upstream | Emits findings | Produces remediation plan |
|------|------------|-------------|-----------------|-------------------------------|----------------------|-------------------|----------------|---------------------------|
| `implementation-auditor` | yes | yes | no | no | no | no | yes | no |
| `commerce-integration-auditor` | yes | yes | no | no | no | no | yes | no |
| `verification-auditor` | yes | limited | yes | yes, when requested/available | no | no | yes | no |
| `authoring-contract-auditor` | yes | limited | no | no | yes | no | yes | no |
| `upstream-drift-reviewer` | yes | no | no | no | no | yes | yes | no |
| `assess` | yes | no | optional via delegates | optional via delegates | no | optional | yes | yes |
| `execute-remediation` | yes | yes | yes via delegates | yes via delegates | yes via delegates | optional | yes | yes |

## Notes

- `limited` means the skill may update its owned surface but should not become the default owner of adjacent domains.
- Verification should be evidence-based. If execution is skipped, findings should be marked accordingly.
