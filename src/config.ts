/** Faste lenker og verdier som brukes flere steder i appen. */
export const SITE_URL = 'https://ranheimkraft.no/';
export const REPO_URL = 'https://github.com/RanheimGeriljaTV/Kraft-Fryer';
export const ISSUES_URL = `${REPO_URL}/issues/new`;
export const APP_VERSION = __APP_VERSION__;

/** Filer i public/ må hentes relativt til base (./), ikke fra roten. */
export const asset = (file: string) => `${import.meta.env.BASE_URL}${file}`;
