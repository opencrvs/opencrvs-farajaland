# How to debug E2E tests on CI

1. Go to E2E repository https://github.com/opencrvs/e2e
2. Find the `Deploy & run E2E` action run that failed
3. Locate the failing test(s)
4. Under `upload-artifact` step, download the artifact
5. Unzip the downloaded artifact

   ### CLI approach

   6. run `npx playwright show-report path-to-unzipped-report` and open the link (`Serving HTML report at http://localhost:9323.`)
   7. Select the failing test
   8. Detailed view of the case is opened
   9. Further down, you see screenshots taken during the failure and trace.
   10. Click `trace` thubmnail

   ### Click through UI approach

   6. Open the `index.html` file in browser
   7. Select the failing test
   8. Detailed view of the case is opened
   9. Further down, you see screenshots taken during the failure and trace.
   10. Download `trace`
   11. Open browser, go to https://trace.playwright.dev
   12. Open the previously downloaded trace .zip

You are now able to debug the failed test case as it would have happened on your local environment

![alt text](e2e-debug-steps.png 'E2E debug steps')

# Run e2e tests locally

First ensure you have your local dev environment running.

Some V1 tests require running the country configuration server from `opencrvs-farajaland` instead of `opencrvs-countryconfig`. For V2, either should work 👍 Unfortunately some V1 tests are currently failing in local environment (with any configuration).

Then, in `opencrvs-farajaland` root directory, run:

```
yarn

# to run against localhost
yarn e2e-dev

# to run against chosen deployment
export DOMAIN=my-deployment.opencrvs.dev; yarn e2e
```
