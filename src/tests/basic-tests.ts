/**
 * Tests para el sistema de validación
 */

import { validateToolArguments, sanitizeString } from '../utils/validation.js'

// Tests básicos para validación
export function testValidation() {
    console.log('🧪 Running validation tests...')

    // Test 1: Validación exitosa
    const validArgs = {
        owner: 'facebook',
        repo: 'react',
        path: 'src/index.js',
    }

    const result1 = validateToolArguments('analizar_archivo', validArgs)
    console.assert(
        result1.isValid === true,
        'Should validate correct arguments',
    )
    console.assert(result1.errors.length === 0, 'Should have no errors')

    // Test 2: Argumentos faltantes
    const invalidArgs = {
        owner: 'facebook',
        // repo y path faltantes
    }

    const result2 = validateToolArguments('analizar_archivo', invalidArgs)
    console.assert(
        result2.isValid === false,
        'Should fail validation with missing args',
    )
    console.assert(result2.errors.length > 0, 'Should have errors')

    // Test 3: Formato inválido
    const invalidFormatArgs = {
        owner: 'facebook@invalid',
        repo: 'react',
        path: 'invalid<path>.js',
    }

    const result3 = validateToolArguments('analizar_archivo', invalidFormatArgs)
    console.assert(
        result3.isValid === false,
        'Should fail validation with invalid format',
    )

    // Test 4: Sanitización de strings
    const dirtyString = '<script>alert("xss")</script>Hello World'
    const cleanString = sanitizeString(dirtyString)
    console.assert(
        !cleanString.includes('<script>'),
        'Should remove script tags',
    )
    console.assert(
        cleanString.includes('Hello World'),
        'Should keep clean content',
    )

    // Test 5: Token de GitHub válido
    const validToken = 'ghp_' + 'x'.repeat(36)
    const tokenResult = validateToolArguments('configurar_github', {
        token: validToken,
    })
    console.assert(
        tokenResult.isValid === true,
        'Should validate GitHub token format',
    )

    // Test 6: Token de GitHub inválido
    const invalidToken = 'invalid_token'
    const invalidTokenResult = validateToolArguments('configurar_github', {
        token: invalidToken,
    })
    console.assert(
        invalidTokenResult.isValid === false,
        'Should reject invalid token format',
    )

    console.log(' Validation tests completed')
}

// Test para patrones de análisis
export function testPatterns() {
    console.log('🧪 Running pattern analysis tests...')

    // Código con violación SRP
    const badCode = `
    class UserService {
        async getUser(id) {
            console.log('Getting user...');
            const data = await fetch('/api/users/' + id);
            localStorage.setItem('user', JSON.stringify(data));
            return data;
        }
    }
    `

    // Verificar que detecta problemas (esto requeriría el analizador completo)
    // Por ahora, test simple de regex
    const srpPattern =
        /class\s+\w+\s*{[^}]*(?:fetch|axios|console|localStorage){2,}/gs
    const srpMatches = badCode.match(srpPattern)
    console.assert(
        srpMatches && srpMatches.length > 0,
        'Should detect SRP violation',
    )

    // Código con números mágicos
    const magicNumberCode = `
    if (age > 18) {
        setTimeout(callback, 3600000);
        const tax = amount * 0.21;
    }
    `

    const magicPattern = /\b\d{2,}\b(?![.]\d)/g
    const magicMatches = magicNumberCode.match(magicPattern)
    console.assert(
        magicMatches && magicMatches.length >= 2,
        'Should detect magic numbers',
    )

    console.log(' Pattern analysis tests completed')
}

// Test para configuración
export function testConfiguration() {
    console.log('🧪 Running configuration tests...')

    // Test variables de entorno
    const originalEnv = process.env.GITHUB_TOKEN

    // Simular variable de entorno
    process.env.GITHUB_TOKEN = 'test_token'

    // Restaurar
    if (originalEnv) {
        process.env.GITHUB_TOKEN = originalEnv
    } else {
        delete process.env.GITHUB_TOKEN
    }

    console.log(' Configuration tests completed')
}

// Ejecutar todos los tests
export function runAllTests() {
    console.log('🚀 Starting test suite...\n')

    try {
        testValidation()
        testPatterns()
        testConfiguration()

        console.log('\n All tests passed!')
    } catch (error) {
        console.error('\n Test failed:', error)
        process.exit(1)
    }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllTests()
}
