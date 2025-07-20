// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
import * as Sentry from '@sentry/node';
import { log } from './middleware/logger.js';

export function initSentry(dsn: string | undefined) {
    if (!dsn) {
        log('Sentry DSN not specified, going blind');
        return;
    }

    log('Initializing Sentry');

    return Sentry.init({
        dsn: dsn,

        // Setting this option to true will send default PII data to Sentry.
        // For example, automatic IP address collection on events
        sendDefaultPii: true,
    });
}