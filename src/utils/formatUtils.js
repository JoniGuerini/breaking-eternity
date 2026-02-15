import Decimal from 'break_eternity.js';

const STANDARD_SUFFIXES = ['', 'K', 'M', 'B', 'T'];

export const formatNumber = (val, options = { precision: 0, growthRate: null }) => {
    // Ensure we are working with a Decimal object
    const decimal = val instanceof Decimal ? val : new Decimal(val || 0);

    // Determine the sign and work with absolute value
    const absDecimal = decimal.abs();

    // Use pt-BR locale for formatting (comma for decimals, dot for thousands)
    const locale = 'pt-BR';

    // Rule 1: < 1.000 (2 decimals)
    if (absDecimal.lt(1000)) {
        return decimal.toNumber().toLocaleString(locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // Rule 2: 1.000 <= x < 1.000.000 (0 decimals)
    if (absDecimal.lt(1000000)) {
        return decimal.toNumber().toLocaleString(locale, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }

    // Rule 3: >= 1.000.000 (2 decimals, with suffix and space)
    const exponent = absDecimal.log10();
    const suffixIndex = Math.floor(exponent / 3);
    const divisor = Decimal.pow(10, suffixIndex * 3);
    const mantissa = decimal.div(divisor);

    let suffix = '';
    if (suffixIndex < STANDARD_SUFFIXES.length) {
        suffix = STANDARD_SUFFIXES[suffixIndex];
    } else {
        let n = (suffixIndex - 5) + 27;
        let suffixStr = "";
        while (n > 0) {
            n--;
            suffixStr = String.fromCharCode(65 + (n % 26)) + suffixStr;
            n = Math.floor(n / 26);
        }
        if (suffixStr.length > 5) {
            return decimal.toExponential(2).replace('+', '').replace('.', ',');
        }
        suffix = suffixStr;
    }

    return mantissa.toNumber().toLocaleString(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + ' ' + suffix;
};

export const formatTime = (seconds) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) {
        const m = Math.floor(seconds / 60);
        const s = Math.round(seconds % 60);
        return `${m}m ${s}s`;
    }
    if (seconds < 86400) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    }
    if (seconds < 604800) { // < 7 days
        const d = Math.floor(seconds / 86400);
        const h = Math.floor((seconds % 86400) / 3600);
        return `${d}d ${h}h`;
    }
    if (seconds < 2592000) { // < 30 days (1 month)
        const w = Math.floor(seconds / 604800);
        const d = Math.floor((seconds % 604800) / 86400);
        return `${w}w ${d}d`;
    }
    if (seconds < 31536000) { // < 365 days (1 year)
        const mo = Math.floor(seconds / 2592000);
        const d = Math.floor((seconds % 2592000) / 86400);
        return `${mo}mo ${d}d`;
    }

    if (seconds < 31536000000) { // < 1000 years (1 Millennium)
        const y = Math.floor(seconds / 31536000);
        const mo = Math.floor((seconds % 31536000) / 2592000);
        return `${y}y ${mo}mo`;
    }

    const Mil = Math.floor(seconds / 31536000000);
    const y = Math.floor((seconds % 31536000000) / 31536000);
    return `${Mil}Mil ${y}y`;
};
