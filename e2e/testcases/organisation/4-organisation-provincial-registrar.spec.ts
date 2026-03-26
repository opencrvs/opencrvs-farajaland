import { test } from '@playwright/test'
import { login } from '../../helpers'
import { CREDENTIALS } from '../../constants'

test('3. Organisation Page', async ({ browser }) => {
  const page = await browser.newPage()

  //User: Provincial Registrar(m.owen)
  //WIP: https://github.com/opencrvs/opencrvs-core/issues/11697 , This ticket is to be resolved to have complete test case.
  test.skip('3.1.0 Verify Province -> District -> District Office', async () => {
    //needs to be updated once the issue is resolved
    await login(page, CREDENTIALS.PROVINCIAL_REGISTRAR)
  })
})
