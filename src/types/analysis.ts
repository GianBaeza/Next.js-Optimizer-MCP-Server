/**
 * Tipos para análisis de código y arquitectura
 */

export interface AnalysisIssue {
    category: string
    issue: string
    recommendation: string
    severity: 'critical' | 'high' | 'medium' | 'low' | 'good' | 'info'
    occurrences: number
    explanation?: string
    designPattern?: string
    architectureLayer?: string
    codeExample?: string
    resources?: string[]
}

export interface FileAnalysisResult {
    file: string
    totalIssues: number
    issues: AnalysisIssue[]
    summary: Summary
    architectureScore: number
    cleanCodeScore: number
    suggestions: ArchitectureSuggestion[]
}

export interface Summary {
    total: number
    critical: number
    high: number
    medium: number
    low: number
    good: number
    info: number
}

export interface ArchitectureSuggestion {
    title: string
    description: string
    pattern: string
    benefit: string
    implementation: string
    example?: string
}

export interface RepositoryAnalysisResult {
    repository: string
    totalFiles: number
    analyzedFiles: number
    overallScore: {
        architecture: number
        cleanCode: number
        overall: number
    }
    summary: Summary
    topIssues: Array<{
        issue: string
        severity: string
        count: number
        recommendation: string
        designPattern?: string
    }>
    recommendations: string[]
    files: FileAnalysisResult[]
}

export interface AnalysisPattern {
    pattern: RegExp
    issue: string
    recommendation: string
    severity: AnalysisIssue['severity']
    explanation?: string
    designPattern?: string
    architectureLayer?: string
    codeExample?: string
    resources?: string[]
}

export interface PatternCategory {
    [key: string]: AnalysisPattern[]
}

export interface AnalysisOptions {
    includeGoodPractices?: boolean
    focusOnArchitecture?: boolean
    maxFileSize?: number
    skipTests?: boolean
    enabledCategories?: string[]
}
