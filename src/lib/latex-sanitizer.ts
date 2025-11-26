/**
 * LaTeX Sanitizer
 * Prevents LaTeX injection attacks by escaping special characters
 * and stripping dangerous commands
 */

// LaTeX special characters that need escaping
const LATEX_SPECIAL_CHARS: Record<string, string> = {
    '\\': '\\textbackslash{}',
    '{': '\\{',
    '}': '\\}',
    '$': '\\$',
    '&': '\\&',
    '#': '\\#',
    '^': '\\textasciicircum{}',
    '_': '\\_',
    '%': '\\%',
    '~': '\\textasciitilde{}',
};

// Dangerous LaTeX commands that should be stripped
const DANGEROUS_COMMANDS = [
    '\\input',
    '\\include',
    '\\write',
    '\\immediate',
    '\\openout',
    '\\closeout',
    '\\read',
    '\\openin',
    '\\closein',
    '\\csname',
    '\\expandafter',
    '\\catcode',
    '\\def',
    '\\edef',
    '\\gdef',
    '\\xdef',
    '\\let',
    '\\futurelet',
    '\\newcommand',
    '\\renewcommand',
    '\\providecommand',
];

// Field length limits (characters)
export const LATEX_FIELD_LIMITS = {
    NAME: 100,
    TITLE: 200,
    COMPANY: 200,
    LOCATION: 200,
    DATE: 50,
    DESCRIPTION: 5000,
    BULLET_POINT: 500,
    SKILL: 100,
    EMAIL: 100,
    PHONE: 50,
    URL: 500,
} as const;

export interface SanitizeOptions {
    maxLength?: number;
    allowLineBreaks?: boolean;
    stripDangerousCommands?: boolean;
}

/**
 * Escape LaTeX special characters in a string
 */
export function escapeLatexSpecialChars(text: string): string {
    if (!text) return '';

    let escaped = text;

    // Escape special characters
    for (const [char, replacement] of Object.entries(LATEX_SPECIAL_CHARS)) {
        escaped = escaped.split(char).join(replacement);
    }

    return escaped;
}

/**
 * Strip dangerous LaTeX commands from text
 */
export function stripDangerousCommands(text: string): string {
    if (!text) return '';

    let cleaned = text;

    // Remove dangerous commands (case-insensitive)
    for (const command of DANGEROUS_COMMANDS) {
        const regex = new RegExp(command.replace('\\', '\\\\'), 'gi');
        cleaned = cleaned.replace(regex, '');
    }

    return cleaned;
}

/**
 * Sanitize text for safe LaTeX insertion
 */
export function sanitizeLatex(
    text: string,
    options: SanitizeOptions = {}
): string {
    const {
        maxLength,
        allowLineBreaks = true,
        stripDangerousCommands: stripCommands = true,
    } = options;

    if (!text) return '';

    // Trim whitespace
    let sanitized = text.trim();

    // Enforce length limit
    if (maxLength && sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
    }

    // Strip dangerous commands first
    if (stripCommands) {
        sanitized = stripDangerousCommands(sanitized);
    }

    // Escape special characters
    sanitized = escapeLatexSpecialChars(sanitized);

    // Handle line breaks
    if (!allowLineBreaks) {
        sanitized = sanitized.replace(/\r?\n/g, ' ');
    } else {
        // Convert line breaks to LaTeX line breaks
        sanitized = sanitized.replace(/\r?\n/g, ' \\\\ ');
    }

    // Normalize multiple spaces
    sanitized = sanitized.replace(/\s+/g, ' ');

    return sanitized;
}

/**
 * Sanitize a name field
 */
export function sanitizeName(name: string): string {
    return sanitizeLatex(name, {
        maxLength: LATEX_FIELD_LIMITS.NAME,
        allowLineBreaks: false,
    });
}

/**
 * Sanitize a title/position field
 */
export function sanitizeTitle(title: string): string {
    return sanitizeLatex(title, {
        maxLength: LATEX_FIELD_LIMITS.TITLE,
        allowLineBreaks: false,
    });
}

/**
 * Sanitize a company/organization field
 */
export function sanitizeCompany(company: string): string {
    return sanitizeLatex(company, {
        maxLength: LATEX_FIELD_LIMITS.COMPANY,
        allowLineBreaks: false,
    });
}

/**
 * Sanitize a location field
 */
export function sanitizeLocation(location: string): string {
    return sanitizeLatex(location, {
        maxLength: LATEX_FIELD_LIMITS.LOCATION,
        allowLineBreaks: false,
    });
}

/**
 * Sanitize a date field
 */
export function sanitizeDate(date: string): string {
    return sanitizeLatex(date, {
        maxLength: LATEX_FIELD_LIMITS.DATE,
        allowLineBreaks: false,
    });
}

/**
 * Sanitize a description field (allows line breaks)
 */
export function sanitizeDescription(description: string): string {
    return sanitizeLatex(description, {
        maxLength: LATEX_FIELD_LIMITS.DESCRIPTION,
        allowLineBreaks: true,
    });
}

/**
 * Sanitize a bullet point
 */
export function sanitizeBulletPoint(bullet: string): string {
    return sanitizeLatex(bullet, {
        maxLength: LATEX_FIELD_LIMITS.BULLET_POINT,
        allowLineBreaks: false,
    });
}

/**
 * Sanitize a skill name
 */
export function sanitizeSkill(skill: string): string {
    return sanitizeLatex(skill, {
        maxLength: LATEX_FIELD_LIMITS.SKILL,
        allowLineBreaks: false,
    });
}

/**
 * Sanitize an email address
 */
export function sanitizeEmail(email: string): string {
    return sanitizeLatex(email, {
        maxLength: LATEX_FIELD_LIMITS.EMAIL,
        allowLineBreaks: false,
    });
}

/**
 * Sanitize a phone number
 */
export function sanitizePhone(phone: string): string {
    return sanitizeLatex(phone, {
        maxLength: LATEX_FIELD_LIMITS.PHONE,
        allowLineBreaks: false,
    });
}

/**
 * Sanitize a URL
 */
export function sanitizeUrl(url: string): string {
    return sanitizeLatex(url, {
        maxLength: LATEX_FIELD_LIMITS.URL,
        allowLineBreaks: false,
    });
}

/**
 * Sanitize an array of strings
 */
export function sanitizeArray(
    items: string[],
    sanitizer: (item: string) => string = sanitizeLatex
): string[] {
    return items.map(item => sanitizer(item));
}

/**
 * Validate that text doesn't contain dangerous patterns
 */
export function validateLatexSafety(text: string): {
    safe: boolean;
    issues: string[];
} {
    const issues: string[] = [];

    // Check for dangerous commands
    for (const command of DANGEROUS_COMMANDS) {
        const regex = new RegExp(command.replace('\\', '\\\\'), 'i');
        if (regex.test(text)) {
            issues.push(`Dangerous command detected: ${command}`);
        }
    }

    // Check for excessive length
    if (text.length > 50000) {
        issues.push('Text exceeds maximum safe length');
    }

    return {
        safe: issues.length === 0,
        issues,
    };
}
