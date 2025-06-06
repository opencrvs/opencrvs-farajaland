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

import * as Hapi from '@hapi/hapi'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { defineConfig } from '@opencrvs/toolkit/events'
import { logger } from '@countryconfig/logger'
import fetch from 'node-fetch'
import { GATEWAY_URL } from '@countryconfig/constants'

// Store for the current custom event config
let currentCustomEvent: any = null
let lastUpdated: string | null = null

// Path to store the config persistently
const CONFIG_FILE_PATH = join(__dirname, '../data/custom-event-config.json')

// Load existing config on startup
try {
  if (existsSync(CONFIG_FILE_PATH)) {
    const savedData = JSON.parse(readFileSync(CONFIG_FILE_PATH, 'utf8'))
    currentCustomEvent = savedData.config
    lastUpdated = savedData.lastUpdated
    logger.info('Loaded existing custom event configuration')
  }
} catch (error) {
  logger.warn('Failed to load existing custom event configuration:', error)
}

export function configEditorHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const htmlContent = readFileSync(
    join(__dirname, 'config-editor.html'),
    'utf8'
  )
  return h.response(htmlContent).type('text/html')
}

export function validateConfigHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const config = request.payload as any

    if (!config) {
      return h
        .response({
          valid: false,
          message: 'No configuration provided'
        })
        .code(400)
    }

    // Validate the configuration by trying to run it through defineConfig
    try {
      const validatedEvent = defineConfig(config)

      // If defineConfig doesn't throw, the config is valid
      return h
        .response({
          valid: true,
          message: 'Configuration is valid',
          validatedConfig: validatedEvent
        })
        .code(200)
    } catch (defineConfigError: any) {
      // defineConfig threw an error, config is invalid
      logger.warn('defineConfig validation failed:', defineConfigError)

      // Extract useful error information
      const errorMessage =
        defineConfigError.message || 'Unknown validation error'
      const errors = []

      // Try to extract more specific error details
      if (defineConfigError.message) {
        errors.push(defineConfigError.message)
      }

      // Check for specific validation issues
      if (!config.id) {
        errors.push('Missing required field: id')
      }
      if (!config.label) {
        errors.push('Missing required field: label')
      }
      if (!config.declaration) {
        errors.push('Missing required field: declaration')
      }

      return h
        .response({
          valid: false,
          message: 'Configuration validation failed',
          errors: errors.length > 0 ? errors : [errorMessage]
        })
        .code(400)
    }
  } catch (error: any) {
    logger.error('Error validating configuration:', error)
    return h
      .response({
        valid: false,
        message: 'Internal validation error',
        errors: [error.message || 'Unknown error occurred']
      })
      .code(500)
  }
}

export function saveConfigHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const config = request.payload as any

    if (!config) {
      return h
        .response({
          success: false,
          message: 'No configuration provided'
        })
        .code(400)
    }

    // Validate the configuration first
    try {
      const validatedEvent = defineConfig(config)

      // Save the validated configuration
      currentCustomEvent = validatedEvent
      lastUpdated = new Date().toISOString()

      // Persist to file system
      const dataToSave = {
        config: validatedEvent,
        lastUpdated: lastUpdated
      }

      try {
        // Ensure the data directory exists
        const dataDir = join(__dirname, '../data')
        if (!existsSync(dataDir)) {
          require('fs').mkdirSync(dataDir, { recursive: true })
        }

        writeFileSync(CONFIG_FILE_PATH, JSON.stringify(dataToSave, null, 2))
        logger.info('Custom event configuration saved successfully')
      } catch (fileError) {
        logger.warn('Failed to persist configuration to file:', fileError)
        // Continue anyway, as the in-memory config is saved
      }

      return h
        .response({
          success: true,
          message: 'Configuration saved and deployed successfully',
          config: validatedEvent,
          lastUpdated: lastUpdated
        })
        .code(200)
    } catch (defineConfigError: any) {
      logger.warn('Failed to save invalid configuration:', defineConfigError)
      return h
        .response({
          success: false,
          message: 'Configuration is invalid and cannot be saved',
          errors: [defineConfigError.message || 'Validation failed']
        })
        .code(400)
    }
  } catch (error: any) {
    logger.error('Error saving configuration:', error)
    return h
      .response({
        success: false,
        message: 'Internal save error',
        errors: [error.message || 'Unknown error occurred']
      })
      .code(500)
  }
}

export function getCurrentConfigHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  return h
    .response({
      config: currentCustomEvent,
      lastUpdated: lastUpdated
    })
    .code(200)
}

// Function to get the current custom event for the events endpoint
export function getCurrentCustomEvent() {
  return currentCustomEvent
}

// Function to check if there's an active custom event
export function hasActiveCustomEvent() {
  return currentCustomEvent !== null
}

export async function getSchemaHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    // Construct the OpenAPI endpoint URL
    const openApiUrl = new URL('events/api', GATEWAY_URL).toString()
    logger.info(`Fetching OpenAPI schema from: ${openApiUrl}`)

    // Fetch the OpenAPI definition
    const response = await fetch(openApiUrl, {
      headers: {
        Accept: 'application/json'
      },
      timeout: 10000 // 10 second timeout
    })

    if (!response.ok) {
      throw new Error(
        `Failed to fetch OpenAPI schema: ${response.status} ${response.statusText}`
      )
    }

    const openApiSpec = await response.json()

    // Extract the EventConfig schema and all referenced components
    const eventConfigSchema = extractEventConfigSchema(openApiSpec)

    if (!eventConfigSchema) {
      throw new Error('EventConfig schema not found in OpenAPI specification')
    }

    return h
      .response({
        schema: eventConfigSchema,
        source: 'openapi',
        endpoint: openApiUrl
      })
      .code(200)
  } catch (error: any) {
    logger.error('Error fetching OpenAPI schema:', error)

    // Fallback to the static schema if API call fails
    logger.info('Falling back to static schema generation')
    return getStaticSchemaResponse(h, error.message)
  }
}

// Extract EventConfig schema from OpenAPI specification
function extractEventConfigSchema(openApiSpec: any): string | null {
  try {
    const components = openApiSpec.components
    if (!components || !components.schemas) {
      throw new Error('No components.schemas found in OpenAPI spec')
    }

    const eventConfigSchema = components.schemas.EventConfig
    if (!eventConfigSchema) {
      throw new Error('EventConfig schema not found in components.schemas')
    }

    // Build a comprehensive schema object that includes all referenced schemas
    const fullSchema = {
      EventConfig: eventConfigSchema,
      // Add any referenced schemas
      ...extractReferencedSchemas(components.schemas, eventConfigSchema)
    }

    // Format as a readable JSON schema
    const schemaString = `OpenCRVS Event Configuration Schema

This schema was fetched dynamically from the OpenCRVS Events API OpenAPI specification.
You can use this schema with AI tools like ChatGPT or Claude to generate valid configurations.

==== COMPLETE SCHEMA DEFINITION ====

${JSON.stringify(fullSchema, null, 2)}

==== USAGE INSTRUCTIONS ====

1. The main schema is under "EventConfig" - this defines the complete structure for event configurations
2. Referenced schemas are included for completeness
3. Follow the exact structure and types defined in the schema
4. All required fields must be included
5. Optional fields can be omitted
6. Use the validation endpoint to verify your configuration before deployment

==== EXAMPLE USAGE WITH AI TOOLS ====

When asking an AI to generate a configuration:
1. Provide this complete schema as context
2. Specify your requirements (field types, pages, validation rules)
3. Ask for a complete JSON configuration following the EventConfig schema
4. Validate the result using the /config-editor/validate endpoint

The generated configuration will be validated against the official OpenCRVS event schema.`

    return schemaString
  } catch (error) {
    logger.error('Error extracting EventConfig schema:', error)
    return null
  }
}

// Recursively extract schemas referenced by the main schema
function extractReferencedSchemas(
  allSchemas: any,
  schema: any,
  visited = new Set()
): any {
  const referenced: any = {}

  function findReferences(obj: any) {
    if (!obj || typeof obj !== 'object') return

    if (obj['$ref'] && typeof obj['$ref'] === 'string') {
      const refPath = obj['$ref']
      if (refPath.startsWith('#/components/schemas/')) {
        const schemaName = refPath.replace('#/components/schemas/', '')
        if (!visited.has(schemaName) && allSchemas[schemaName]) {
          visited.add(schemaName)
          referenced[schemaName] = allSchemas[schemaName]
          // Recursively find references in this schema
          const nestedRefs = extractReferencedSchemas(
            allSchemas,
            allSchemas[schemaName],
            visited
          )
          Object.assign(referenced, nestedRefs)
        }
      }
    }

    // Recursively check all properties
    if (Array.isArray(obj)) {
      obj.forEach(findReferences)
    } else if (typeof obj === 'object') {
      Object.values(obj).forEach(findReferences)
    }
  }

  findReferences(schema)
  return referenced
}

// Fallback function that returns the static schema
function getStaticSchemaResponse(
  h: Hapi.ResponseToolkit,
  errorMessage: string
) {
  try {
    // Import the field types dynamically to get the actual available types
    const { FieldType } = require('@opencrvs/toolkit/events')

    // Generate field types documentation
    const fieldTypesList = Object.keys(FieldType)
      .map((key) => {
        const value = FieldType[key]
        return `- ${value}: ${getFieldTypeDescription(value)}`
      })
      .join('\n')

    const schema = `OpenCRVS Event Configuration Schema (Static Fallback)

NOTE: This is a static fallback schema. The dynamic schema could not be fetched.
Error: ${errorMessage}

This is a manually maintained schema for creating custom event configurations in OpenCRVS.
For the most up-to-date schema, ensure the OpenCRVS Events API is accessible.

You can use this schema with AI tools like ChatGPT or Claude to generate valid configurations.

==== BASIC STRUCTURE ====

{
  "id": "unique-event-id",
  "actions": []
  "declaration": {
    "label": {
      "defaultMessage": "Event Declaration",
      "description": "Description of the event declaration",
      "id": "unique.declaration.label.id"
    },
    "pages": [
      {
        "id": "page-id",
        "type": "FORM",
        "title": {
          "defaultMessage": "Page Title",
          "description": "Description of the page",
          "id": "unique.page.title.id"
        },
        "fields": [
          {
            "id": "field.id",
            "type": "FIELD_TYPE",
            "label": {
              "defaultMessage": "Field Label",
              "description": "Description of the field",
              "id": "unique.field.label.id"
            },
            "configuration": {
              "required": true
            }
          }
        ]
      }
    ]
  },
  "label": {
    "defaultMessage": "Event Label",
    "description": "Label for the event type",
    "id": "unique.event.label.id"
  },
  "title": {
    "defaultMessage": "Event Title Template",
    "description": "Template for event titles using field values",
    "id": "unique.event.title.id"
  },
  "summary": {
    "fields": [
      {
        "fieldId": "field.id",
        "label": {
          "defaultMessage": "Summary Label",
          "description": "Label in summary",
          "id": "unique.summary.label.id"
        },
        "value": {
          "defaultMessage": "Summary Value Template",
          "description": "Value template in summary",
          "id": "unique.summary.value.id"
        }
      }
    ]
  }
}

==== AVAILABLE FIELD TYPES ====

${fieldTypesList}

==== REQUIRED FIELDS ====

- id: Unique identifier for the event
- declaration: Contains the form structure with pages and fields
- label: Display label for the event (TranslationConfig object)
- title: Template for event titles (TranslationConfig object)
- summary: Summary configuration with field mappings

==== TRANSLATION CONFIG STRUCTURE ====

All text elements use the TranslationConfig structure:
{
  "defaultMessage": "The default text to display",
  "description": "Description of what this text is for",
  "id": "unique.identifier.for.translation"
}

==== FIELD CONFIGURATION OPTIONS ====

Common field configuration options:
- required: boolean - Whether the field is required
- disabled: boolean - Whether the field is disabled
- readonly: boolean - Whether the field is read-only
- maxLength: number - Maximum length for text fields
- minLength: number - Minimum length for text fields
- placeholder: TranslationConfig - Placeholder text
- tooltip: TranslationConfig - Tooltip text
- helperText: TranslationConfig - Helper text below the field

For SELECT and RADIO_GROUP fields:
- options: Array of option objects with { value, label }

For DATE fields:
- dateFormat: string - Format for date display
- ignoreDeathOccurrence: boolean - Special flag for certain validations

For FILE fields:
- allowedDocTypes: Array of allowed document types

==== IMPORTANT RULES ====

1. All IDs must be unique across the configuration
2. Field IDs should follow dot notation (e.g., "applicant.firstName")
3. Translation IDs should be unique and descriptive
4. Title and summary values can reference field values using {field.id} syntax
5. Page types are typically "FORM" for data collection pages
6. Field types must be exactly as listed above (case-sensitive)
7. All TranslationConfig objects must have defaultMessage, description, and id

==== EXAMPLE CONFIGURATION ====

{
  "id": "adoption-application",
  "declaration": {
    "pages": [
      {
        "id": "applicant-details",
        "type": "FORM",
        "title": {
          "defaultMessage": "Applicant Details",
          "description": "Page for collecting applicant information",
          "id": "adoption.applicant.page.title"
        },
        "fields": [
          {
            "id": "applicant.firstName",
            "type": "TEXT",
            "label": {
              "defaultMessage": "First Name",
              "description": "Applicant's first name",
              "id": "adoption.applicant.firstName.label"
            },
            "configuration": {
              "required": true,
              "maxLength": 50
            }
          },
          {
            "id": "applicant.lastName",
            "type": "TEXT",
            "label": {
              "defaultMessage": "Last Name",
              "description": "Applicant's last name",
              "id": "adoption.applicant.lastName.label"
            },
            "configuration": {
              "required": true,
              "maxLength": 50
            }
          },
          {
            "id": "applicant.dateOfBirth",
            "type": "DATE",
            "label": {
              "defaultMessage": "Date of Birth",
              "description": "Applicant's date of birth",
              "id": "adoption.applicant.dateOfBirth.label"
            },
            "configuration": {
              "required": true
            }
          },
          {
            "id": "applicant.gender",
            "type": "RADIO_GROUP",
            "label": {
              "defaultMessage": "Gender",
              "description": "Applicant's gender",
              "id": "adoption.applicant.gender.label"
            },
            "configuration": {
              "required": true,
              "options": [
                { "value": "male", "label": { "defaultMessage": "Male", "description": "Male gender option", "id": "adoption.gender.male" } },
                { "value": "female", "label": { "defaultMessage": "Female", "description": "Female gender option", "id": "adoption.gender.female" } },
                { "value": "other", "label": { "defaultMessage": "Other", "description": "Other gender option", "id": "adoption.gender.other" } }
              ]
            }
          }
        ]
      }
    ]
  },
  "label": {
    "defaultMessage": "Adoption Application",
    "description": "Label for adoption application event",
    "id": "adoption.event.label"
  },
  "title": {
    "defaultMessage": "Adoption Application for {applicant.firstName} {applicant.lastName}",
    "description": "Title template for adoption applications",
    "id": "adoption.event.title"
  },
  "summary": {
    "fields": [
      {
        "fieldId": "applicant.firstName",
        "label": {
          "defaultMessage": "First Name",
          "description": "Summary label for first name",
          "id": "adoption.summary.firstName.label"
        },
        "value": {
          "defaultMessage": "{applicant.firstName}",
          "description": "Summary value for first name",
          "id": "adoption.summary.firstName.value"
        }
      },
      {
        "fieldId": "applicant.lastName",
        "label": {
          "defaultMessage": "Last Name",
          "description": "Summary label for last name",
          "id": "adoption.summary.lastName.label"
        },
        "value": {
          "defaultMessage": "{applicant.lastName}",
          "description": "Summary value for last name",
          "id": "adoption.summary.lastName.value"
        }
      }
    ]
  }
}

==== USAGE WITH AI TOOLS ====

When using this schema with AI tools:
1. Provide this complete schema as context
2. Ask the AI to generate configurations following this exact structure
3. Ensure all field types are from the available list above
4. Validate that all IDs are unique
5. Test the generated configuration using the validation endpoint

The configuration will be validated using the OpenCRVS defineConfig function, which ensures compliance with the official OpenCRVS event schema.`

    return h
      .response({
        schema: schema,
        source: 'static',
        error: errorMessage
      })
      .code(200)
  } catch (error: any) {
    logger.error('Error generating static schema:', error)
    return h
      .response({
        schema: 'Error generating schema: ' + error.message,
        source: 'error',
        error: error.message
      })
      .code(500)
  }
}

// Helper function to provide descriptions for field types
function getFieldTypeDescription(fieldType: string): string {
  const descriptions: Record<string, string> = {
    TEXT: 'Simple text input field',
    NUMBER: 'Numeric input field',
    TEXTAREA: 'Multi-line text input field',
    EMAIL: 'Email address input field',
    DATE: 'Date picker field',
    DATE_RANGE: 'Date range picker field',
    SELECT: 'Dropdown selection field',
    RADIO_GROUP: 'Radio button group field',
    CHECKBOX: 'Single checkbox field',
    LOCATION: 'Location/address picker field',
    ADDRESS: 'Address input field',
    COUNTRY: 'Country selection field',
    ADMINISTRATIVE_AREA: 'Administrative area selection field',
    FACILITY: 'Health facility selection field',
    OFFICE: 'CRVS office selection field',
    FILE: 'File upload field',
    FILE_WITH_OPTIONS: 'File upload with options field',
    SIGNATURE: 'Digital signature field',
    PARAGRAPH: 'Read-only paragraph text',
    PAGE_HEADER: 'Page header text',
    BULLET_LIST: 'Bullet list display',
    DIVIDER: 'Visual divider element',
    DATA: 'Data display field'
  }

  return descriptions[fieldType] || 'Unknown field type'
}
