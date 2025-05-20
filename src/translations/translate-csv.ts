import * as fs from 'fs'
import * as dotenv from 'dotenv'
import OpenAI from 'openai'
import csv from 'csv-parser'
import { createObjectCsvWriter } from 'csv-writer'
import { OPENAI_API_KEY } from '@countryconfig/constants'

dotenv.config()

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
})

async function translateCsv(inputPath: string, outputPath: string) {
  const rows: any[] = []

  fs.createReadStream(inputPath)
    .pipe(csv())
    .on('data', (data) => rows.push(data))
    .on('end', async () => {
      for (const row of rows) {
        const english = row.en

        if (!english || english.trim() === '') {
          row.si = ''
          row.ta = ''
          continue
        }

        // Sinhala translation
        const sinhalaResp = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                'You are a professional translator. Translate this English sentence to Sinhala, preserving placeholders like {name}, {officeName}, etc.'
            },
            {
              role: 'user',
              content: english
            }
          ],
          temperature: 0
        })

        row.si = sinhalaResp.choices[0].message?.content?.trim() || english

        // Tamil translation
        const tamilResp = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                'You are a professional translator. Translate this English sentence to Tamil, preserving placeholders like {name}, {officeName}, etc.'
            },
            {
              role: 'user',
              content: english
            }
          ],
          temperature: 0
        })

        row.ta = tamilResp.choices[0].message?.content?.trim() || english
      }

      // Output only selected columns: id, description, en, si, ta
      const headers = ['id', 'description', 'en', 'si', 'ta'].map((key) => ({
        id: key,
        title: key
      }))

      const writer = createObjectCsvWriter({
        path: outputPath,
        header: headers
      })

      await writer.writeRecords(rows)
      console.log(`✅ Translation complete. Saved to ${outputPath}`)
    })
}

const INPUT_PATH = process.argv[2]
const OUTPUT_PATH = process.argv[3]

translateCsv(INPUT_PATH, OUTPUT_PATH)
