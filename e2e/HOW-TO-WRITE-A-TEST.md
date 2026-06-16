# How to write a test (that is not flaky)

TL;DR:

1. Use `openRecordByTitle` when selecting user from workqueue

- We poll search endpoint, run tests in parallel and only few users to run hundreds of tests.
- Without this method, your test will inevitably end up on a wrong event overview page if you just naively click the name.

2. Use `ensureAssignedToUser` when want to assign user to event in event overview.

- Checks if you are assigned or not. Works on 'Summary' page.
- Known drawback 1: Cannot be used on 'Audit' or 'Record' page.
- Known drawback 2: Assumes ActionMenu and Overview use the same data. Sometimes\* you'll need to wait for search response explicitly

3. Use `triggerDeclarationAction` when you use action menu to trigger action. It will wait for the responses for you.

- We cannot await the triggered actions in the application. This waits until all the action calls respond with ok.

4. use `page.waitForResponse` instead of setting arbitrary timeout.

- For the actions not covered by `triggerDeclarationAction`.
- You need to know what you are waiting for.

\* When user is redirected after action back to event overview (happens only if you come to the event through search), it takes few seconds for the UI to sync up completely. In these scenarios you might need to explicitly wait for the search cache to update.

```
// Example: How to know UI is ready without setting 30 second timeout:
    const searchCacheRefetchResponse = page.waitForResponse(
      (res) => res.url().includes(`event.search?batch=1`) && res.ok()
    )

    // ... Code to trigger the action.

    await searchCacheRefetchResponse
```
