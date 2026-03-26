import { expect, Page, test } from '@playwright/test'

import { formatName, login } from '../../helpers'
import { mockNetworkConditions } from '../../mock-network-conditions'
import { faker } from '@faker-js/faker'
import { ensureOutboxIsEmpty } from '../../utils'

test('Can Open Draft offline', async ({ browser }) => {

  
  let page: Page
  page = await browser.newPage()

  
  const name = {
    firstNames: faker.person.firstName('male'),
    familyName: faker.person.lastName('male')
  }

  await test.step('Login', async () => {

    
    await login(page)

    
    await expect(page.getByText('Farajaland CRS')).toBeVisible({
      timeout: 30000
    })

    
    await expect(page.locator('#content-name')).toHaveText('Assigned to you')

  })

  await test.step('Create a draft', async () => {

    
    await page.click('#header-new-event')

    
    await page.getByLabel('Birth').click()

    
    await page.getByRole('button', { name: 'Continue' }).click()

    
    await page.getByRole('button', { name: 'Continue' }).click()

    

    await page.locator('#firstname').fill(name.firstNames)

    
    await page.locator('#surname').fill(name.familyName)

    

    await page.getByRole('button', { name: 'Save & Exit' }).click()

    
    await page.getByRole('button', { name: 'Confirm' }).click()

    

    await ensureOutboxIsEmpty(page)

  })

  await test.step('Open the draft offline', async () => {

    
    await mockNetworkConditions(page, 'offline')

    
    await page.getByRole('button', { name: 'Drafts' }).click()

    
    await expect(page.locator('#content-name')).toHaveText('Drafts')

    
    await page.getByRole('button', { name: formatName(name) }).click()

    
    await expect(page.locator('#content-name')).toHaveText(formatName(name))

  })

  await page.close()})
