import fs from 'fs'
import csvParser from 'csv-parser'
import { createObjectCsvWriter } from 'csv-writer'

interface Location {
  [key: string]: string
}

const locationsFile = 'locations.csv' // This is a complete
const statisticsFile = 'statistics.csv' // Ensure that the highest level places have completed rows and this script will fill in the rest
const outputFile = 'output_statistics.csv'

const statisticsMap: Map<string, number> = new Map()
const hierarchyMap: Map<string, Set<string>> = new Map()
const pcodeToName: Map<string, string> = new Map()

function readCSV(filePath: string): Promise<Location[]> {
  return new Promise((resolve) => {
    const data: Location[] = []
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => data.push(row))
      .on('end', () => resolve(data))
  })
}

function distribute(
  parent: string,
  total: number,
  children: string[]
): Map<string, number> {
  const result = new Map<string, number>()
  const base = Math.floor(total / children.length)
  const remainder = total % children.length
  children.forEach((child, index) => {
    result.set(child, base + (index === 0 ? remainder : 0))
  })
  return result
}

;(async () => {
  const stats = await readCSV(statisticsFile)
  const locs = await readCSV(locationsFile)

  // Load statistics
  stats.forEach((row) => {
    const pcode = row['adminPcode']
    const pop = parseInt(row['population_2023'], 10)
    statisticsMap.set(pcode, pop)
    pcodeToName.set(pcode, row['name'])
  })

  // Create hierarchy map and name map
  const levels = [
    'admin0Pcode',
    'admin1Pcode',
    'admin2Pcode',
    'admin3Pcode',
    'admin4Pcode'
  ]
  const names = [
    'admin0Name_en',
    'admin1Name_en',
    'admin2Name_en',
    'admin3Name_en',
    'admin4Name_en'
  ]

  locs.forEach((row) => {
    for (let i = 0; i < levels.length - 1; i++) {
      const parent = row[levels[i]]
      const child = row[levels[i + 1]]
      const name = row[names[i + 1]]
      if (parent && child) {
        if (!hierarchyMap.has(parent)) hierarchyMap.set(parent, new Set())
        hierarchyMap.get(parent)!.add(child)
        if (!pcodeToName.has(child)) pcodeToName.set(child, name)
      }
    }
  })

  // Distribute population recursively
  const queue = Array.from(statisticsMap.keys())
  while (queue.length) {
    const parent = queue.shift()!
    const pop = statisticsMap.get(parent)!
    const children = hierarchyMap.get(parent)
    if (children) {
      const childArray = Array.from(children).sort()
      const distributed = distribute(parent, pop, childArray)
      distributed.forEach((value, key) => {
        if (!statisticsMap.has(key)) {
          statisticsMap.set(key, value)
          queue.push(key)
        }
      })
    }
  }

  // Prepare final output
  const output: any[] = []
  statisticsMap.forEach((pop, pcode) => {
    const male = Math.floor(pop / 2) + (pop % 2)
    const female = Math.floor(pop / 2)
    output.push({
      adminPcode: pcode,
      name: pcodeToName.get(pcode) || '',
      male_population_2023: male,
      female_population_2023: female,
      population_2023: pop,
      crude_birth_rate_2023: 15
    })
  })

  output.sort((a, b) => a.adminPcode.localeCompare(b.adminPcode))

  // Write to CSV using csv-writer
  const csvWriter = createObjectCsvWriter({
    path: outputFile,
    header: [
      { id: 'adminPcode', title: 'adminPcode' },
      { id: 'name', title: 'name' },
      { id: 'male_population_2023', title: 'male_population_2023' },
      { id: 'female_population_2023', title: 'female_population_2023' },
      { id: 'population_2023', title: 'population_2023' },
      { id: 'crude_birth_rate_2023', title: 'crude_birth_rate_2023' }
    ]
  })

  await csvWriter.writeRecords(output)
  console.log(`✅ Population statistics written to ${outputFile}`)
})()
