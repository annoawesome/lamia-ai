import fs from 'fs';

export function isValidPath(strPath: string) {
    return !!strPath && fs.existsSync(strPath);
}
