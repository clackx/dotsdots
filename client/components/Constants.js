const back_urls = {
    production: { url: { BACKEND_URL: 'https://back.qrcat.ru/' } },
    development: { url: { BACKEND_URL: 'http://localhost:5000/' } },
};

const env_var = process.env.NEXT_PUBLIC_DICK || process.env.NODE_ENV || 'development';
const stage_url = back_urls[env_var];
console.log(env_var, 'url', stage_url.url.BACKEND_URL);

export const config = stage_url
