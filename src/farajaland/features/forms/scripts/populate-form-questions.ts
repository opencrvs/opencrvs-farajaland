import { internal } from '@hapi/boom'
import { QUESTIONS_SOURCE } from '@countryconfig/farajaland/constants'
import chalk from 'chalk'
import * as fs from 'fs'
import { populateQuestionsFromSource } from '../service'

const sourceJSON = `${QUESTIONS_SOURCE}register.json`

export default function prepareFormQuestionsFromSourceJSON() {
  const source = JSON.parse(fs.readFileSync(sourceJSON).toString())
  // tslint:disable-next-line: no-console
  console.log(
    `${chalk.magentaBright(
      '/////////////////////////// POPULATING QUESTIONS FROM JSON ///////////////////////////'
    )}`
  )
  try {
    populateQuestionsFromSource(source)
  } catch (err) {
    throw internal(err)
  }
}

prepareFormQuestionsFromSourceJSON()
