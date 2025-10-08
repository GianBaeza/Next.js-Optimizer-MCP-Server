import type { ValidationResult } from '../types/index.js'

/**
 * Esquemas de validación para los parámetros de las herramientas
 */

export interface ValidationSchema {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object'
    required?: boolean
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    allowedValues?: any[]
    properties?: Record<string, ValidationSchema>
    items?: ValidationSchema
}

export interface ValidationSchemas {
    [toolName: string]: {
        [paramName: string]: ValidationSchema
    }
}

/**
 * Esquemas de validación para las herramientas
 */
export const TOOL_SCHEMAS: ValidationSchemas = {
    configurar_github: {
        token: {
            type: 'string',
            required: true,
            minLength: 20,
            maxLength: 100,
            pattern: /^gh[ps]_[a-zA-Z0-9]{36,}$/,
        },
    },
    analizar_archivo: {
        owner: {
            type: 'string',
            required: true,
            minLength: 1,
            maxLength: 100,
            pattern: /^[a-zA-Z0-9\-._]+$/,
        },
        repo: {
            type: 'string',
            required: true,
            minLength: 1,
            maxLength: 100,
            pattern: /^[a-zA-Z0-9\-._]+$/,
        },
        path: {
            type: 'string',
            required: true,
            minLength: 1,
            maxLength: 500,
            pattern: /^[a-zA-Z0-9\-._/]+\.(js|jsx|ts|tsx)$/,
        },
        branch: {
            type: 'string',
            required: false,
            minLength: 1,
            maxLength: 100,
            pattern: /^[a-zA-Z0-9\-._/]+$/,
        },
    },
    analizar_repositorio: {
        owner: {
            type: 'string',
            required: true,
            minLength: 1,
            maxLength: 100,
            pattern: /^[a-zA-Z0-9\-._]+$/,
        },
        repo: {
            type: 'string',
            required: true,
            minLength: 1,
            maxLength: 100,
            pattern: /^[a-zA-Z0-9\-._]+$/,
        },
        branch: {
            type: 'string',
            required: false,
            minLength: 1,
            maxLength: 100,
            pattern: /^[a-zA-Z0-9\-._/]+$/,
        },
    },
    sugerir_arquitectura: {
        owner: {
            type: 'string',
            required: true,
            minLength: 1,
            maxLength: 100,
            pattern: /^[a-zA-Z0-9\-._]+$/,
        },
        repo: {
            type: 'string',
            required: true,
            minLength: 1,
            maxLength: 100,
            pattern: /^[a-zA-Z0-9\-._]+$/,
        },
        projectType: {
            type: 'string',
            required: false,
            allowedValues: ['web', 'api', 'mobile', 'fullstack', 'library'],
        },
    },
    explicar_patron: {
        patron: {
            type: 'string',
            required: true,
            minLength: 2,
            maxLength: 50,
            allowedValues: [
                'repository',
                'factory',
                'observer',
                'strategy',
                'singleton',
                'builder',
                'adapter',
                'decorator',
                'facade',
                'proxy',
                'command',
                'state',
                'template',
                'visitor',
                'mvc',
                'mvp',
                'mvvm',
            ],
        },
    },
    listar_archivos_react: {
        owner: {
            type: 'string',
            required: true,
            minLength: 1,
            maxLength: 100,
            pattern: /^[a-zA-Z0-9\-._]+$/,
        },
        repo: {
            type: 'string',
            required: true,
            minLength: 1,
            maxLength: 100,
            pattern: /^[a-zA-Z0-9\-._]+$/,
        },
        path: {
            type: 'string',
            required: false,
            minLength: 0,
            maxLength: 500,
            pattern: /^[a-zA-Z0-9\-._/]*$/,
        },
    },
}

/**
 * Valida un valor contra un esquema
 */
function validateValue(
    value: any,
    schema: ValidationSchema,
    fieldName: string,
): string[] {
    const errors: string[] = []

    // Verificar si es requerido
    if (
        schema.required &&
        (value === undefined || value === null || value === '')
    ) {
        errors.push(`${fieldName} is required`)
        return errors
    }

    // Si no es requerido y está vacío, no validar más
    if (
        !schema.required &&
        (value === undefined || value === null || value === '')
    ) {
        return errors
    }

    // Validar tipo
    const actualType = Array.isArray(value) ? 'array' : typeof value
    if (actualType !== schema.type) {
        errors.push(
            `${fieldName} must be of type ${schema.type}, got ${actualType}`,
        )
        return errors
    }

    // Validaciones específicas por tipo
    if (schema.type === 'string' && typeof value === 'string') {
        if (schema.minLength !== undefined && value.length < schema.minLength) {
            errors.push(
                `${fieldName} must be at least ${schema.minLength} characters`,
            )
        }

        if (schema.maxLength !== undefined && value.length > schema.maxLength) {
            errors.push(
                `${fieldName} must be at most ${schema.maxLength} characters`,
            )
        }

        if (schema.pattern && !schema.pattern.test(value)) {
            errors.push(`${fieldName} format is invalid`)
        }

        if (schema.allowedValues && !schema.allowedValues.includes(value)) {
            errors.push(
                `${fieldName} must be one of: ${schema.allowedValues.join(
                    ', ',
                )}`,
            )
        }
    }

    if (schema.type === 'array' && Array.isArray(value)) {
        if (schema.items) {
            value.forEach((item, index) => {
                const itemErrors = validateValue(
                    item,
                    schema.items!,
                    `${fieldName}[${index}]`,
                )
                errors.push(...itemErrors)
            })
        }
    }

    if (
        schema.type === 'object' &&
        typeof value === 'object' &&
        schema.properties
    ) {
        Object.entries(schema.properties).forEach(([propName, propSchema]) => {
            const propErrors = validateValue(
                value[propName],
                propSchema,
                `${fieldName}.${propName}`,
            )
            errors.push(...propErrors)
        })
    }

    return errors
}

/**
 * Valida los argumentos de una herramienta
 */
export function validateToolArguments(
    toolName: string,
    args: Record<string, any>,
): ValidationResult {
    const schema = TOOL_SCHEMAS[toolName]
    if (!schema) {
        return {
            isValid: false,
            errors: [`Unknown tool: ${toolName}`],
            warnings: [],
        }
    }

    const errors: string[] = []
    const warnings: string[] = []

    // Validar cada parámetro
    Object.entries(schema).forEach(([paramName, paramSchema]) => {
        const paramErrors = validateValue(
            args[paramName],
            paramSchema,
            paramName,
        )
        errors.push(...paramErrors)
    })

    // Verificar parámetros adicionales no esperados
    const expectedParams = Object.keys(schema)
    const actualParams = Object.keys(args || {})
    const unexpectedParams = actualParams.filter(
        (param) => !expectedParams.includes(param),
    )

    if (unexpectedParams.length > 0) {
        warnings.push(`Unexpected parameters: ${unexpectedParams.join(', ')}`)
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    }
}

/**
 * Sanitiza una cadena para prevenir inyecciones
 */
export function sanitizeString(input: string): string {
    return input
        .replace(/[<>\"'&]/g, '') // Remover caracteres peligrosos
        .trim()
        .substring(0, 1000) // Limitar longitud
}

/**
 * Sanitiza los argumentos de una herramienta
 */
export function sanitizeToolArguments(
    args: Record<string, any>,
): Record<string, any> {
    const sanitized: Record<string, any> = {}

    Object.entries(args).forEach(([key, value]) => {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeString(value)
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeToolArguments(value)
        } else {
            sanitized[key] = value
        }
    })

    return sanitized
}
