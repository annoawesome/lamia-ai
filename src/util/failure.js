/**
 * Failure wrapper for errors. May also serve as
 * custom error usable to give to client.
 * @typedef {Object} Failure
 * @property {boolean} isFailure
 * @property {any} artifact
 * @property {number} httpStatusCode
 * @property {string} internalId
 * @property {string} reason
 */

/**
 * Make failure wrapper for errors. Attaches a reason and id for failure
 * for frontend to respond to.
 * @param {any} artifact Associated error artifact.
 * @param {number} httpStatusCode HTTP status code to respond with.
 * @param {string} internalId Internal id for frontend to react to.
 * @param {string} reason Displayed reason for failure.
 * @returns {Failure}
 */
export function makeFailure(artifact, httpStatusCode, internalId, reason) {
    return {
        isFailure: true,
        artifact: artifact,
        httpStatusCode: httpStatusCode,
        internalId: internalId,
        reason: reason,
    };
}

export function isFailure(failure) {
    return !!failure && !!failure.isFailure;
}

/**
 * Generates a sanitized failure object to give the client.
 * @param {Failure} failure Failure object
 * @returns {Failure}
 */
export function sanitizeFailure(failure) {
    return {
        isFailure: true,
        internalId: failure.internalId,
        reason: failure.reason,
    };
}