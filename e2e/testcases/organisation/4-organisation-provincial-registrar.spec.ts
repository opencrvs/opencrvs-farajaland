import { test, expect, type Page } from '@playwright/test'
import path from 'path'
import { ensureLoginPageReady, continueForm, login } from '../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS, LOGIN_URL } from '../../constants'
import { getUserByRole } from '@countryconfig/data-generator/users'
import _, { has, nth, slice } from 'lodash'
import { isPageHeaderFieldType } from '@opencrvs/toolkit/events'
import { type } from '../../utils'
import exp from 'constants'
test.describe.serial('3. Organisation Page -1', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  //User: Provincial Registrar(m.owen)
  //WIP: https://github.com/opencrvs/opencrvs-core/issues/11697 , This ticket is to be resolved to have complete test case.

  test.describe.serial('3.1 UI check', async () => {
    test('3.1.0 Verify Province-> Distric -> District Office', async () => {
      //needs to be updated once the issue is resolved
      await login(page, CREDENTIALS.PROVINCIAL_REGISTRAR)
    })
  })
})
