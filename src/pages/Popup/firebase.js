import { initializeApp } from 'firebase/app';
import {
    getDatabase,
    ref,
    set,
    get,
    child,
    update,
    remove,
} from 'firebase/database';

const firebaseConfig = {
    apiKey: 'AIzaSyCTwnESPIMkYG0cSJQ9fGQrPUNbwo4F86U',
    authDomain: 'nova-keygen.firebaseapp.com',
    databaseURL: 'https://nova-keygen-default-rtdb.firebaseio.com',
    projectId: 'nova-keygen',
    storageBucket: 'nova-keygen.firebasestorage.app',
    messagingSenderId: '409390325290',
    appId: '1:409390325290:web:4f9b266f53e42882a96d53',
    measurementId: 'G-QRBWZY032Y',
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Xuất các hàm CRUD
export const getData = async () => {
    const dbRef = ref(db, 'nova_checking');
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
        return snapshot.val().map((item, index) => {
            return {
                ...item,
                index,
            };
        }); // Trả về dữ liệu
    } else {
        return null; // Không có dữ liệu
    }
};

export const updateData = async (id, data) => {
    const dbRef = ref(db, 'nova_checking/' + id);
    await update(dbRef, data);
};
