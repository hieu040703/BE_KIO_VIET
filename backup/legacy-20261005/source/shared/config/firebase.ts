// Import the functions you need from the SDKs you need
import admin from "firebase-admin";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}");
const serviceAccount = {
  type: "service_account",
  project_id: "thienbao-732ea",
  private_key_id: "9264fcc8c47d306450cb5acf78d56582e509c8b9",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDDrF22l++IgpjT\nfbODU0WUn7iPM4hwCOto0hGxf4ak/DWZcGbDPWjChMHbp8p943CHKgJbyB+FIXKT\nzzo9fiYlXlYLmAb+On6meYdainXzRqaQrSGjUyRhCM3eK5fWRD9XOTS0w8VZgeay\nvJWasWOfDW0vdLMuvPyG/dnD2u6F61nFAO355hsinswkes9iRj9RnWyBnzZp4CWY\nDLFWhWZ2+Ax+UHtQ/+YDrPck/uoZ/UQnNq6eq+1B8IdwV4kl4rIloh54ZweryGxS\nfQ0DS7Eaz3XrgImAJeoluTTA8CTawQIBwlSAu8RU5Ilt2y9jb1v8Xdcvc9vwi3Hf\n7hTZmDvtAgMBAAECggEAD1m2VbIVrd/mSAZ/JA5O/G819gX/mMpvrV7NhInnRjTY\nVPE8c+nyuKUxkB8vA4aUOAZTqQpKGWebqtIsVNFQrMh5zO8K8rwkCMCqna+/ERa5\nz8pv7nWB+nAhC7eKcdoTc1me3jooK/LE5mtk+9MZaEuQBT5iet2DR2kiwaVV5lYt\nDZ57Tf+hujdBqHpjjteewraomUq0fj7Yp60p9NKEs+n9vvyVeb36R8xRzOz/XSgz\nN39tdLIr8xuVH+D6hFUZfk5eWzTN7bDd6fl93Unl/rBR+/GLsbIdRVm5kC48Kgjf\n9hlH1UlYMMYiTB/UGA48+XTXYWT0Dv3KhrT/LoxoAQKBgQDzDNi7PjorUSsw4XrX\nl13YpJ/W3HZge8Pj6x17+48myi2MtLet9LIqJ47//lfs2ucXVZZtCcJ4gnr0YSZw\nVbqdC5/z6sD6oaRDnSfq3b1fZws/KJGSA70Obzu1NNM3BYbX2/YvERyX0ENwB5wb\nvtwynpZLzdZH0H67ZOC0MNH69QKBgQDOGU8Ohs/NEhEGB7YS84NXji5qXH9AxVA6\ncjiv8fnCAqHJKosJU+Y7CobqNZVhp1c3/MfX8vBUFjAecFk1wqHRNtQf/DrXRa/M\nBOW9KWsaCcJSTNlXdRVCHOnmn2BMOeOgG4L0YPUTUTGtNDcZW7H7To1YWUzXpYjJ\nYIUeF7uSGQKBgEBEKFayaI0lpEcDiAjTpGPxe7ZDiyWN9Eki1SQAa2S1Vv/6lQrx\nRd7xoNU9uqANbcd0wRbJ2tsknUBbI9/WO0blWQEVFLvw289pEbH/ueAtDgNAReWX\nCXl0nhQXCLZmxrXzGpBtdOMLlZlc2cFYYT8dQd5/aeaJUclZLjVXJ161AoGAK1KG\nm7ca1zCFA497ZmBpq23ns9Pdq+/N/XslD1b9+Ro0h+S5dSx9qMt9sJ2y2OQkIVCx\ncWNPwV0ooD1dgz92ZFPyIwcSF04+tdQRtsGOEdsbTdF5njiuT0dko2W9CEji4DTo\nQhZfbcATgSUIr/vmXb0VWQzsaigRqMLxOHIkq4ECgYAlHL/U30t12G+nDQl1mbzW\nHljfuarHfLy77qa3jBnhh1IBBXkYawaGe/YAbu0ls9vDlINcbzrozfW44OQavtkf\nUPVMeC26xi0zLvqT7o3V2CRhyutexs9LykQrbQh9jrr0VsjhsrJIpeSK0tl9iT8T\n25jnuPc7XfaBJDKAC/lIGg==\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@thienbao-732ea.iam.gserviceaccount.com",
  client_id: "116011047647939178314",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40thienbao-732ea.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  projectId: "thienbao-732ea",
});

export default admin;
