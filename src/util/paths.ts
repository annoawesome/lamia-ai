import fs from 'fs';
import path from 'path';

export function isValidPath(strPath: string) {
    return !!strPath && fs.existsSync(strPath);
}

export const envDependentPaths = {
    appData: () => process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share"),
    userData: () => path.join(envDependentPaths.appData(), 'lamia-ai'),
};
