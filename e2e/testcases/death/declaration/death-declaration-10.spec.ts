import { test, expect } from '@playwright/test'
import {
  continueForm,
  drawSignature,
  expectRowValueWithChangeButton,
  goToSection,
  login,
  selectDeclarationAction
} from '../../../helpers'
import { CREDENTIALS } from '../../../constants'
import { ensureOutboxIsEmpty, selectAction } from '../../../utils'
import { REQUIRED_VALIDATION_ERROR } from '../../birth/helpers'

test('10. Death declaration case - 10', async ({ browser }) => {
  const page = await browser.newPage()

  const declaration = {
    deceased: {
      nationality: 'Farajaland',
      address: {
        country: 'Farajaland',
        province: 'Central',
        district: 'Ibombo'
      }
    },
    informant: {
      relation: 'Grandson'
    }
  }

  await test.step('10.1 Declaration started by HO', async () => {
    await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)

    await page.click('#header-new-event')
    await page.getByLabel('Death').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await test.step('10.1.1 Fill deceased details', async () => {
      await continueForm(page)
    })

    await test.step('10.1.2 Fill event details', async () => {
      // A place of death is needed, since hospital official may only declare a record in their own location
      await page.getByTestId('select__eventDetails____placeOfDeath').click()

      await page.getByText('Health Institution', { exact: true }).click()

      await page.locator('#eventDetails____deathLocation').fill('Klow Village')

      await page.getByText('Klow Village Hospital').click()

      await page.getByRole('button', { name: 'Continue' }).click()
    })

    await test.step('10.1.3 Fill informant details', async () => {
      await page.locator('#informant____relation').click()

      await page
        .getByText(declaration.informant.relation, {
          exact: true
        })
        .click()

      await page.waitForTimeout(500)

      // Temporary measurement untill the bug is fixed. BUG: rerenders after selecting relation with deceased
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    await test.step('10.1.4 Go to preview', async () => {
      await goToSection(page, 'review')
    })

    await test.step('10.1.5 Verify information on preview page', async () => {
      /*
       * Expected result: should include
       * - Deceased's First Name
       * - Deceased's Family Name
       * - Change button
       */

      await expectRowValueWithChangeButton(
        page,
        'deceased.name',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Deceased's Gender
       * - Change button
       */

      await expectRowValueWithChangeButton(
        page,
        'deceased.gender',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Deceased's date of birth
       * - Change button
       */

      await expectRowValueWithChangeButton(
        page,
        'deceased.dob',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should include
       * - Deceased's Nationality
       * - Change button
       */

      await expectRowValueWithChangeButton(
        page,
        'deceased.nationality',
        'Farajaland'
      )

      /*
       * Expected result: should require
       * - Deceased's Type of Id
       * - Change button
       */

      await expectRowValueWithChangeButton(
        page,
        'deceased.idType',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should include
       * - Deceased's address
       * - Change button
       */

      await expectRowValueWithChangeButton(
        page,
        'deceased.address',
        declaration.deceased.address.country +
          declaration.deceased.address.province +
          declaration.deceased.address.district
      )

      /*
       * Expected result: should require
       * - Date of death
       * - Change button
       */

      await expectRowValueWithChangeButton(
        page,
        'eventDetails.date',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should include
       * - Informant type
       * - Change button
       */

      await expectRowValueWithChangeButton(
        page,
        'informant.relation',
        declaration.informant.relation
      )

      /*
       * Expected result: should require
       * - Informant's Email
       * - Change button
       */

      await expectRowValueWithChangeButton(
        page,
        'informant.email',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Spouse's First Name
       * - Spouse's Family Name
       * - Change button
       */

      await expectRowValueWithChangeButton(
        page,
        'spouse.name',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Spouse's date of birth
       * - Change button
       */

      await expectRowValueWithChangeButton(
        page,
        'spouse.dob',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should include
       * - Spouse's Nationality
       * - Change button
       */

      await expectRowValueWithChangeButton(
        page,
        'spouse.nationality',
        'Farajaland'
      )

      /*
       * Expected result: should require
       * - Spouse's Type of Id
       * - Change button
       */

      await expectRowValueWithChangeButton(
        page,
        'spouse.idType',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Spouse's address
       * - Change button
       */

      await expectRowValueWithChangeButton(page, 'spouse.addressSameAs', 'Yes')
    })

    await test.step('10.1.6 Fill up informant signature', async () => {
      await page.getByRole('button', { name: 'Sign', exact: true }).click()

      await drawSignature(page, 'review____signature_canvas_element', false)

      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    await test.step('10.1.7 Notify', async () => {
      await selectDeclarationAction(page, 'Notify')

      await ensureOutboxIsEmpty(page)

      await expect(page.getByText('Farajaland CRS')).toBeVisible()

      /*
       * Expected result: should redirect to assigned to you workqueue
       */

      expect(page.url().includes('assigned-to-you')).toBeTruthy()

      await page.getByText('Recent').click()

      await expect(
        page
          .getByRole('button', {
            name: 'No name provided'
          })
          .first()
      ).toBeVisible()
    })
  })

  await test.step('10.2 Declaration Review by RO', async () => {
    await test.step('10.2.1 Navigate to the declaration Edit-action', async () => {
      await login(page, CREDENTIALS.REGISTRATION_OFFICER)

      await ensureOutboxIsEmpty(page)

      await page.getByText('Notifications').click()

      await page
        .getByRole('button', {
          name: 'No name provided'
        })
        .first()
        .click()

      await selectAction(page, 'Edit')
    })

    await test.step('10.2.2 Verify information on review page', async () => {
      /*
       * Expected result: should include
       * - Deceased's First Name
       * - Deceased's Family Name
       * - Change button
       */

      await expectRowValueWithChangeButton(
        page,
        'deceased.name',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Deceased's Gender
       * - Change button
       */

      await expectRowValueWithChangeButton(
        page,
        'deceased.gender',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Deceased's date of birth
       * - Change button
       */

      await expectRowValueWithChangeButton(
        page,
        'deceased.dob',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should include
       * - Deceased's Nationality
       * - Change button
       */

      await expectRowValueWithChangeButton(
        page,
        'deceased.nationality',
        'Farajaland'
      )

      /*
       * Expected result: should require
       * - Deceased's Type of Id
       * - Change button
       */

      await expectRowValueWithChangeButton(
        page,
        'deceased.idType',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should include
       * - Deceased's address
       * - Change button
       */

      await expectRowValueWithChangeButton(
        page,
        'deceased.address',
        declaration.deceased.address.country +
          declaration.deceased.address.province +
          declaration.deceased.address.district
      )

      /*
       * Expected result: should require
       * - Date of death
       * - Change button
       */

      await expectRowValueWithChangeButton(
        page,
        'eventDetails.date',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should include
       * - Informant type
       * - Change button
       */

      await expectRowValueWithChangeButton(
        page,
        'informant.relation',
        declaration.informant.relation
      )

      /*
       * Expected result: should require
       * - Informant's Email
       * - Change button
       */

      await expectRowValueWithChangeButton(
        page,
        'informant.email',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Spouse's First Name
       * - Spouse's Family Name
       * - Change button
       */

      await expectRowValueWithChangeButton(
        page,
        'spouse.name',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Spouse's date of birth
       * - Change button
       */

      await expectRowValueWithChangeButton(
        page,
        'spouse.dob',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should include
       * - Spouse's Nationality
       * - Change button
       */

      await expectRowValueWithChangeButton(
        page,
        'spouse.nationality',
        'Farajaland'
      )

      /*
       * Expected result: should require
       * - Spouse's Type of Id
       * - Change button
       */

      await expectRowValueWithChangeButton(
        page,
        'spouse.idType',
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Spouse's address
       * - Change button
       */

      await expectRowValueWithChangeButton(page, 'spouse.addressSameAs', 'Yes')
    })
  })

  await page.close()
})
