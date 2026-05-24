# Security Specification & Test-Driven Design (TDD) for Student Suite Workspace

## 1. Data Invariants
- **Authentication**: All writes (create, update, delete) to `/users/{userId}` must be securely gated. A user can only access and write to their own `{userId}` document.
- **Relational Integrity**: The user ID variable `{userId}` in the path must match the authenticated `request.auth.uid`.
- **Validation**: All user profile updates must submit well-structured fields that match type safety limits (strings must have sizes, points must check range, lists must not be poisoned).
- **Immutability**: Once created, `userId` is matching of the folder path and cannot be changed or transferred to another authenticated user.
- **Timestamp Integrity**: `updatedAt` on create/update must align with `request.time`.

## 2. The "Dirty Dozen" Malicious Payloads
These payloads attempt to breach security laws and must receive a synchronous `PERMISSION_DENIED` result:

1. **Identity Spoofing (Save to another user's document)**:
   Authenticated as user `alice_uid`, attempt to set path `/users/bob_uid` to overwrite Bob's credentials.
2. **Unauthenticated Read**:
   Attempt to retrieve list or get `/users/bob_uid`/`/users/alice_uid` with a `null` authentication token.
3. **Privilege Escalation (Injecting fields)**:
   Attempt to create/update `/users/alice_uid` with a ghost field `{ "isAdmin": true }` to bypass potential gates.
4. **Denial of Wallet (Huge String Poisoning)**:
   Attempt to update the `themeBackground` with a 2MB base64 string to incur database capacity costs.
5. **Timestamp Bypass (Falsified Update Time)**:
   Attempt to submit a manual time `2030-01-01` in the `updatedAt` field instead of the server timestamp `request.time`.
6. **Habit List Overflow**:
   Inject an array of 5,000 blank habit objects to bloat document memory.
7. **Task Points Forgery**:
   Set `userPoints` to a negative value or attempt to inject `-999999` to compromise statistics.
8. **Invalid ID Path Variable (Path Injection)**:
   Attempt to access `/users/../malicious/path` or inject special characters.
9. **Null Value Poisoning**:
   Send `null` values for non-optional fields such as `tasks` or `habits` list fields.
10. **Ghost Tag Modifying**:
    Attempt to inject random field objects under `tags` list parameters.
11. **Malicious Notes Injecting**:
    Submit sticky notes width or height as negative values to trigger browser engine crashes.
12. **Tampering with System Notifications**:
    Inject spoofed system notifications targeting other user tasks.

## 3. Test Runner (Rules Verification)
All payloads above are validated against the fortress rules defined in `firestore.rules` to guarantee compliance.
