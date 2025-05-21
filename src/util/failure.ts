type SanitizedFailure = {
    isFailure: boolean,
    internalId: string,
    reason: string,
}

type Failure = SanitizedFailure & {
    // isFailure: boolean,
    artifact: NodeJS.ErrnoException | null,
    httpStatusCode: number,
    // internalId: string,
    // reason: string,
}

/**
 * Make failure wrapper for errors. Attaches a reason and id for failure
 * for frontend to respond to.
 * @param {any} artifact Associated error artifact.
 * @param {number} httpStatusCode HTTP status code to respond with.
 * @param {string} internalId Internal id for frontend to react to.
 * @param {string} reason Displayed reason for failure.
 * @returns {Failure}
 */
export function makeFailure(artifact: NodeJS.ErrnoException | null, httpStatusCode: number, internalId: string, reason: string): Failure {
    return {
        isFailure: true,
        artifact: artifact,
        httpStatusCode: httpStatusCode,
        internalId: internalId,
        reason: reason,
    };
}

export function isFailure(failure: Failure) {
    return !!failure && !!failure.isFailure;
}

/**
 * Generates a sanitized failure object to give the client.
 * @param {Failure} failure Failure object
 * @returns {Failure}
 */
export function sanitizeFailure(failure: Failure) {
    return {
        isFailure: true,
        internalId: failure.internalId,
        reason: failure.reason,
    };
}