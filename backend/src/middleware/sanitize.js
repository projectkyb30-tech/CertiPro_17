/**
 * Input Sanitization Middleware
 * Strips HTML/script tags from all string fields in req.body to prevent stored XSS.
 * Applied globally after express.json().
 */

const HTML_TAG_REGEX = /<\/?[^>]+(>|$)/g;
const SCRIPT_PATTERN = /javascript\s*:/gi;
const EVENT_HANDLER_PATTERN = /\bon\w+\s*=/gi;

/**
 * Recursively sanitize all string values in an object.
 * Arrays and nested objects are traversed. Non-string primitives are left untouched.
 */
function sanitizeValue(value) {
    if (typeof value === 'string') {
        return value
            .replace(HTML_TAG_REGEX, '')
            .replace(SCRIPT_PATTERN, '')
            .replace(EVENT_HANDLER_PATTERN, '');
    }
    if (Array.isArray(value)) {
        return value.map(sanitizeValue);
    }
    if (value !== null && typeof value === 'object') {
        return sanitizeObject(value);
    }
    return value;
}

function sanitizeObject(obj) {
    const sanitized = {};
    for (const [key, val] of Object.entries(obj)) {
        sanitized[key] = sanitizeValue(val);
    }
    return sanitized;
}

const sanitizeInput = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }
    next();
};

module.exports = { sanitizeInput };
