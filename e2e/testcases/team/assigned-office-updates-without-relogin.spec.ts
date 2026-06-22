import { test, expect, type Page } from '@playwright/test'
import { createClient } from '@opencrvs/toolkit/api'
import {
  login,
  getToken,
  loginWithNewUser,
  NEW_USER_PASSWORD,
  createPIN
} from '../../helpers'
import { CLIENT_URL, CREDENTIALS, GATEWAY_HOST } from '../../constants'
import { faker } from '@faker-js/faker'
import { getIdByName, getLocations } from '../birth/helpers'

test('Assigned office and role updates without re-login', async ({
  browser
}) => {
  const page = await browser.newPage()

  const name = {
    firstname: faker.person.firstName(),
    surname: faker.person.lastName()
  }
  const fullName = `${name.firstname} ${name.surname}`
  const userName = `${name.firstname[0]}.${name.surname}`.toLocaleLowerCase()

  const token = await getToken(CREDENTIALS.NATIONAL_SYSTEM_ADMIN)
  const client = createClient(GATEWAY_HOST + '/events', `Bearer ${token}`)

  let userId: string
  const quanzaVillageOffice = 'Quanza Village Office'
  const sokaDistrictHospital = 'Soka District Hospital'

  await test.step('Create a new Community Leader in Quanza Village Office', async () => {
    const offices = await getLocations('CRVS_OFFICE', token)
    const quanzaVillageOfficeId = getIdByName(offices, quanzaVillageOffice)

    const user = {
      name,
      role: 'COMMUNITY_LEADER',
      primaryOfficeId: quanzaVillageOfficeId,
      mobile: `07${faker.string.numeric(8)}`,
      email: faker.internet.email(),
      fullHonorificName: fullName,
      device: 'web',
      data: {}
    }

    const response = await client.user.create.mutate(user)

    userId = response.id
  })

  await test.step('Complete account setup for the new user', async () => {
    await loginWithNewUser(page, userName)
  })

  await test.step('Log in to the client as the new user', async () => {
    const newUserToken = await getToken(userName, NEW_USER_PASSWORD)
    expect(newUserToken).toBeDefined()

    await page.goto(`${CLIENT_URL}?token=${newUserToken}`)
    await page.waitForSelector('#pin-input, #appSpinner', { state: 'visible' })
    await createPIN(page)
    await page.goto(CLIENT_URL)
    await expect(page.getByText('Farajaland CRS')).toBeVisible({
      timeout: 30000
    })
  })

  await test.step('Verify initial role and office in left nav', async () => {
    await expect(
      page.getByText('Community Leader • Quanza Village Office')
    ).toBeVisible()
  })

  await test.step("Update user's role and office", async () => {
    const offices = await getLocations('HEALTH_FACILITY', token)
    const sokaDistrictHospitalId = getIdByName(offices, sokaDistrictHospital)
    await client.user.update.mutate({
      id: userId,
      primaryOfficeId: sokaDistrictHospitalId,
      role: 'HOSPITAL_CLERK'
    })
  })

  await test.step('Verify updated role and office in left nav', async () => {
    await page.getByText('Recent').click()

    await expect(
      page.getByText('Hospital Official • Soka District Hospital')
    ).toBeVisible()

    // Core bug: https://github.com/opencrvs/opencrvs-core/issues/13022
    // await expect(page.getByText('Pending updates')).toBeVisible()
  })
})
