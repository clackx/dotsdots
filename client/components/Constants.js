const prod = {
    url: {
        BACKEND_URL: 'https://back.qrcat.ru/'
    }
};
const dev = {
    url: {
        BACKEND_URL: 'http://localhost:5000/'
    }
};

console.log('process.env.NODE_ENV',process.env.NODE_ENV);
export const config = process.env.NODE_ENV === 'development' ? dev : prod;
