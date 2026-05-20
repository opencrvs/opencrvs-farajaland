/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */

/**
 * Generates large administrative-areas.csv and locations.csv for performance testing.
 *
 * Targets:
 *   ~51k admin areas  (1 country + 10 states + 1,000 districts + 50,000 sub-areas)
 *   ~91k total locations (admin areas + 40,000 CRVS_OFFICE facilities)
 *
 * Run: yarn generate-perf-test-locations
 *
 * WARNING: This overwrites the source CSV files.
 *          Commit or stash the originals before running.
 */

import * as fs from 'fs'
import * as path from 'path'

const ADMIN_AREAS_OUT = path.join(
  __dirname,
  'data-seeding/locations/source/administrative-areas.csv'
)
const LOCATIONS_OUT = path.join(
  __dirname,
  'data-seeding/locations/source/locations.csv'
)
const EMPLOYEES_OUT = path.join(
  __dirname,
  'data-seeding/employees/source/default-employees.csv'
)
const STATISTICS_OUT = path.join(
  __dirname,
  'data-seeding/locations/source/statistics.csv'
)

const STATES = 10
const DISTRICTS_PER_STATE = 100
const SUB_AREAS_PER_DISTRICT = 50
const FACILITIES = 40_000

const COUNTRY_NAME = 'Farajaland'
const COUNTRY_PCODE = 'FAR'

let counter = 1

function nextPcode(): string {
  return (counter++).toString(36).padStart(10, '0').toUpperCase().slice(-10)
}

// ── Build hierarchy ──────────────────────────────────────────────────────────

interface SubArea {
  name: string
  pcode: string
}

interface District {
  name: string
  pcode: string
  subAreas: SubArea[]
}

interface State {
  name: string
  pcode: string
  districts: District[]
}

const states: State[] = []

for (let s = 0; s < STATES; s++) {
  const state: State = {
    name: `State ${s + 1}`,
    pcode: nextPcode(),
    districts: []
  }
  for (let d = 0; d < DISTRICTS_PER_STATE; d++) {
    const district: District = {
      name: `District ${s + 1}-${d + 1}`,
      pcode: nextPcode(),
      subAreas: []
    }
    for (let a = 0; a < SUB_AREAS_PER_DISTRICT; a++) {
      district.subAreas.push({
        name: `Area ${s + 1}-${d + 1}-${a + 1}`,
        pcode: nextPcode()
      })
    }
    state.districts.push(district)
  }
  states.push(state)
}

// ── Write administrative-areas.csv ───────────────────────────────────────────

const adminRows: string[] = [
  'admin3Name_en,admin3Name_alias,admin3Pcode,admin2Name_en,admin2Name_alias,admin2Pcode,admin1Name_en,admin1Name_alias,admin1Pcode,admin0Name_en,admin0Name_alias,admin0Pcode'
]

for (const state of states) {
  for (const district of state.districts) {
    for (const area of district.subAreas) {
      adminRows.push(
        [
          area.name,
          area.name,
          area.pcode,
          district.name,
          district.name,
          district.pcode,
          state.name,
          state.name,
          state.pcode,
          COUNTRY_NAME,
          COUNTRY_NAME,
          COUNTRY_PCODE
        ].join(',')
      )
    }
  }
}

fs.writeFileSync(ADMIN_AREAS_OUT, adminRows.join('\n') + '\n', 'utf8')

// ── Write locations.csv ──────────────────────────────────────────────────────
// One CRVS_OFFICE per sub-area for the first FACILITIES sub-areas,
// referencing that sub-area's pcode so the relationship is intact.

const locRows: string[] = ['id,name,partOf,locationType']
const generatedOfficeIds: string[] = []

let facilityCount = 0

outer: for (const state of states) {
  for (const district of state.districts) {
    for (const area of district.subAreas) {
      if (facilityCount >= FACILITIES) break outer
      const officeId = nextPcode()
      generatedOfficeIds.push(officeId)
      locRows.push(
        [
          officeId,
          `${area.name} Office`,
          `Location/${area.pcode}`,
          'CRVS_OFFICE'
        ].join(',')
      )
      facilityCount++
    }
  }
}

fs.writeFileSync(LOCATIONS_OUT, locRows.join('\n') + '\n', 'utf8')

// ── Write statistics.csv ─────────────────────────────────────────────────────
// The seeder requires statistics for every top-level (state) location.
// We use the same placeholder values as the existing Farajaland data.

const STAT_YEARS = Array.from({ length: 19 }, (_, i) => 2007 + i)
const STAT_PLACEHOLDER = '20000,20000,40000,10'

const statsHeader =
  'adminPcode,name,' +
  STAT_YEARS.map(
    (y) =>
      `male_population_${y},female_population_${y},population_${y},crude_birth_rate_${y}`
  ).join(',')

const statsRows: string[] = [statsHeader]

for (const state of states) {
  statsRows.push(
    [state.pcode, state.name, ...STAT_YEARS.map(() => STAT_PLACEHOLDER)].join(
      ','
    )
  )
}

fs.writeFileSync(STATISTICS_OUT, statsRows.join('\n') + '\n', 'utf8')

// ── Write default-employees.csv ──────────────────────────────────────────────
// Keeps the same cast of employees but maps their offices to valid generated IDs.
// officeIds[0] acts as the "HQ" office for national roles.
// Subsequent IDs are used for provincial/local roles across different offices.

const officeIds = generatedOfficeIds.slice(0, 30)

const employees: string[][] = [
  [
    officeIds[0],
    'Chipo',
    'Lungu',
    'NATIONAL_REGISTRAR',
    '0911111111',
    'c.lungu',
    'kalushabwalya17@gmail.com',
    'test'
  ],
  [
    officeIds[0],
    'Mutale',
    'Musonda',
    'PERFORMANCE_MANAGER',
    '0922222222',
    'm.musonda',
    'kalushabwalya17+@gmail.com',
    'test'
  ],
  [
    officeIds[0],
    'Jonathan',
    'Campbell',
    'NATIONAL_SYSTEM_ADMIN',
    '0933333333',
    'j.campbell',
    'kalushabwalya1.7@gmail.com',
    'test'
  ],
  [
    officeIds[1],
    'Bastien',
    'Moreau',
    'EMBASSY_OFFICIAL',
    '0921681112',
    'b.moreau',
    'kalushabwalya.17@gmail.com',
    'test'
  ],
  [
    officeIds[2],
    'Sarah',
    'Jenkins',
    'EMBASSY_OFFICIAL',
    '0915151516',
    's.jenkins',
    'kalus.habwalya17@gmail.com',
    'test'
  ],
  [
    officeIds[3],
    'Mitchel',
    'Owen',
    'PROVINCIAL_REGISTRAR',
    '0921111111',
    'm.owen',
    'kalushabwaly.a17@gmail.com',
    'test'
  ],
  [
    officeIds[3],
    'Emmanuel',
    'Mayuka',
    'LOCAL_SYSTEM_ADMIN',
    '0912121212',
    'e.mayuka',
    'kalushabwal.ya17@gmail.com',
    'test'
  ],
  [
    officeIds[4],
    'Kennedy',
    'Mweene',
    'LOCAL_REGISTRAR',
    '0923232323',
    'k.mweene',
    'kalushabwa.lya17@gmail.com',
    'test'
  ],
  [
    officeIds[4],
    'Felix',
    'Katongo',
    'REGISTRATION_AGENT',
    '0934343434',
    'f.katongo',
    'kalushabw.alya17@gmail.com',
    'test'
  ],
  [
    officeIds[5],
    'Kalusha',
    'Bwalya',
    'HOSPITAL_CLERK',
    '0978787878',
    'k.bwalya',
    'kalushab.walya17@gmail.com',
    'test'
  ],
  [
    officeIds[6],
    'Gift',
    'Phiri',
    'COMMUNITY_LEADER',
    '0922222223',
    'g.phiri',
    'kalushabwalya17+2@gmail.com',
    'test'
  ],
  [
    officeIds[7],
    'Memory',
    'Zulu',
    'COMMUNITY_LEADER',
    '0933333334',
    'm.zulu',
    'kalushabwalya17+3@gmail.com',
    'test'
  ],
  [
    officeIds[8],
    'Brighton',
    'Chimba',
    'COMMUNITY_LEADER',
    '0921681113',
    'b.chimba',
    'kalushabwalya17+4@gmail.com',
    'test'
  ],
  [
    officeIds[9],
    'Loveness',
    "Ng'andu",
    'COMMUNITY_LEADER',
    '0915151517',
    'l.ngandu',
    'kalushabwalya17+5@gmail.com',
    'test'
  ],
  [
    officeIds[10],
    'Mwansa',
    'Chileshe',
    'COMMUNITY_LEADER',
    '0921111112',
    'm.chileshe',
    'kalushabwalya17+6@gmail.com',
    'test'
  ],
  [
    officeIds[11],
    'Humphrey',
    'Katumbi',
    'COMMUNITY_LEADER',
    '0912121213',
    'h.katumbi',
    'kalushabwalya17+7@gmail.com',
    'test'
  ],
  [
    officeIds[12],
    'Agness',
    'Tembo',
    'COMMUNITY_LEADER',
    '0923232324',
    'a.tembo',
    'kalushabwalya17+8@gmail.com',
    'test'
  ],
  [
    officeIds[13],
    'Mwila',
    'Chikwanda',
    'PROVINCIAL_REGISTRAR',
    '0934343435',
    'm.chikwanda',
    'kalushabwalya17+9@gmail.com',
    'test'
  ],
  [
    officeIds[13],
    'Taonga',
    'Nkhoma',
    'LOCAL_SYSTEM_ADMIN',
    '0978787879',
    't.nkhoma',
    'kalushabwalya17+10@gmail.com',
    'test'
  ],
  [
    officeIds[14],
    'Kondwani',
    'Mwale',
    'LOCAL_REGISTRAR',
    '0977777778',
    'k.mwale',
    'kalushabwalya17+11@gmail.com',
    'test'
  ],
  [
    officeIds[14],
    'Chilufya',
    'Tayali',
    'REGISTRATION_AGENT',
    '0915151518',
    'c.tayali',
    'kalushabwalya17+12@gmail.com',
    'test'
  ],
  [
    officeIds[15],
    'Mutinta',
    'Mazoka',
    'HOSPITAL_CLERK',
    '0915152160',
    'm.mazoka',
    'kalushabwalya17+13@gmail.com',
    'test'
  ],
  [
    officeIds[16],
    'Benson',
    'Kapiri',
    'COMMUNITY_LEADER',
    '0915151815',
    'b.kapiri',
    'kalushabwalya17+14@gmail.com',
    'test'
  ],
  [
    officeIds[17],
    'Alice',
    'Simutowe',
    'COMMUNITY_LEADER',
    '0911111113',
    'a.simutowe',
    'kalushabwalya17+15@gmail.com',
    'test'
  ],
  [
    officeIds[18],
    'Dalitso',
    'Sakala',
    'LOCAL_REGISTRAR',
    '0922222224',
    'd.sakala',
    'kalushabwalya17+16@gmail.com',
    'test'
  ],
  [
    officeIds[18],
    'Kunda',
    'Simbaya',
    'REGISTRATION_AGENT',
    '0933333335',
    'k.simbaya',
    'kalushabwalya17+17@gmail.com',
    'test'
  ],
  [
    officeIds[19],
    'Bupe',
    'Chanda',
    'HOSPITAL_CLERK',
    '0921681114',
    'b.chanda',
    'kalushabwalya17+18@gmail.com',
    'test'
  ],
  [
    officeIds[20],
    'Enock',
    'Kavindele',
    'LOCAL_REGISTRAR',
    '0915151519',
    'e.kavindele',
    'kalushabwalya17+19@gmail.com',
    'test'
  ],
  [
    officeIds[21],
    'Racheal',
    'Namugala',
    'HOSPITAL_CLERK',
    '0921111113',
    'r.namugala',
    'kalushabwalya17+20@gmail.com',
    'test'
  ],
  [
    officeIds[22],
    'Luyando',
    'Haabazoka',
    'LOCAL_REGISTRAR',
    '0912121214',
    'l.haabazoka',
    'kalushabwalya17+21@gmail.com',
    'test'
  ],
  [
    officeIds[23],
    'Friday',
    'Malwa',
    'HOSPITAL_CLERK',
    '0923232325',
    'f.malwa',
    'kalushabwalya17+22@gmail.com',
    'test'
  ],
  [
    officeIds[24],
    'Sepiso',
    'Wamunyima',
    'PROVINCIAL_REGISTRAR',
    '0934343436',
    's.wamunyima',
    'kalushabwalya17+23@gmail.com',
    'test'
  ],
  [
    officeIds[24],
    'Njavwa',
    'Siame',
    'LOCAL_REGISTRAR',
    '0978787880',
    'n.siame',
    'kalushabwalya17+24@gmail.com',
    'test'
  ],
  [
    officeIds[24],
    'Mapalo',
    'Simbaya',
    'REGISTRATION_AGENT',
    '0977777779',
    'm.simbaya',
    'kalushabwalya17+25@gmail.com',
    'test'
  ],
  [
    officeIds[24],
    'Kasonde',
    'Mukuka',
    'LOCAL_SYSTEM_ADMIN',
    '0915151520',
    'k.mukuka',
    'kalushabwalya17+26@gmail.com',
    'test'
  ],
  [
    officeIds[25],
    'Mainza',
    'Boloji',
    'COMMUNITY_LEADER',
    '0915152170',
    'm.boloji',
    'kalushabwalya17+27@gmail.com',
    'test'
  ],
  [
    officeIds[26],
    'Zandile',
    'Ngosa',
    'COMMUNITY_LEADER',
    '0915151816',
    'z.ngosa',
    'kalushabwalya17+28@gmail.com',
    'test'
  ],
  [
    officeIds[27],
    'Kabange',
    'Pande',
    'PROVINCIAL_REGISTRAR',
    '0911111114',
    'k.pande',
    'kalushabwalya17+29@gmail.com',
    'test'
  ],
  [
    officeIds[28],
    'Webster',
    'Shamenda',
    'LOCAL_REGISTRAR',
    '0922222225',
    'w.shamenda',
    'kalushabwalya17+30@gmail.com',
    'test'
  ],
  [
    officeIds[28],
    'Precious',
    'Lungu',
    'REGISTRATION_AGENT',
    '0933333336',
    'p.lungu',
    'kalushabwalya17+31@gmail.com',
    'test'
  ],
  [
    officeIds[29],
    'Grace',
    'Njapau',
    'HOSPITAL_CLERK',
    '0921681115',
    'g.njapau',
    'kalushabwalya17+32@gmail.com',
    'test'
  ],
  [
    officeIds[2],
    'Toukir',
    'Mwila',
    'EMBASSY_OFFICIAL',
    '0915151515',
    't.mwila',
    'kalush.abwalya17@gmail.com',
    'test'
  ],
  [
    officeIds[1],
    'Velix',
    'Katongo',
    'REGISTRATION_AGENT',
    '0915152150',
    'v.katongo',
    'kalush.abwalya17+23232@gmail.com',
    'test'
  ],
  [
    officeIds[1],
    'Venedy',
    'Mweene',
    'LOCAL_REGISTRAR',
    '0915151814',
    'v.mweene',
    'kalushabwalya17+eo@gmail.com',
    'test'
  ],
  [
    officeIds[1],
    'Kalusha',
    'Cwalya',
    'HOSPITAL_CLERK',
    '0911111112',
    'k.cwalya',
    'kalushabwalya17+1@gmail.com',
    'test'
  ]
]

const empRows = [
  'primaryOfficeId,givenNames,familyName,role,mobile,username,email,password',
  ...employees.map((row) =>
    [`CRVS_OFFICE_${row[0]}`, ...row.slice(1)].join(',')
  )
]

fs.writeFileSync(EMPLOYEES_OUT, empRows.join('\n') + '\n', 'utf8')

const totalAdminAreas =
  1 +
  STATES +
  STATES * DISTRICTS_PER_STATE +
  STATES * DISTRICTS_PER_STATE * SUB_AREAS_PER_DISTRICT
const totalLocations = totalAdminAreas + facilityCount

process.stdout.write(
  [
    `Wrote ${adminRows.length - 1} rows → ${ADMIN_AREAS_OUT}`,
    `Wrote ${locRows.length - 1} rows → ${LOCATIONS_OUT}`,
    `Wrote ${statsRows.length - 1} rows → ${STATISTICS_OUT}`,
    `Wrote ${empRows.length - 1} rows → ${EMPLOYEES_OUT}`,
    '',
    `Admin areas : ${totalAdminAreas.toLocaleString()}`,
    `Facilities  : ${facilityCount.toLocaleString()}`,
    `Total       : ${totalLocations.toLocaleString()}`,
    `Employees   : ${(empRows.length - 1).toLocaleString()}`,
    ''
  ].join('\n')
)
