import { auth, db, createUserWithEmailAndPassword, sendEmailVerification, doc, setDoc } from "./firebase-config.js";
import { auth, db, signInWithEmailAndPassword, signOut, doc, getDoc } from "./firebase-config.js";
// --- TOGGLE PASSWORD ---
const togglePassword = document.querySelector("#togglePassword");
const passwordInput = document.querySelector("#regPassword");

if (togglePassword) {
    togglePassword.addEventListener("click", function () {
        // Toggle tipe input antara password dan text
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);

        // Toggle ikon mata
        this.classList.toggle("fa-eye-slash");
    });
}

// --- FITUR SHARELOC (Reverse Geocoding) ---
const btnShareLoc = document.getElementById('btnShareLoc');
const addressInput = document.getElementById('regAddress');
const locStatus = document.getElementById('locStatus');

if (btnShareLoc) {
    btnShareLoc.addEventListener('click', () => {
        if (!navigator.geolocation) {
            alert("Browser anda tidak support geolocation");
            return;
        }

        locStatus.innerText = "Sedang mencari lokasi...";

        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            // Menggunakan Nominatim OpenStreetMap (Gratis & Tanpa API Key untuk skala kecil)
            // Untuk mengubah koordinat menjadi nama jalan
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                const data = await response.json();

                if (data && data.display_name) {
                    addressInput.value = data.display_name; // Mengisi textarea dengan nama jalan
                    locStatus.innerText = "Lokasi ditemukan!";
                } else {
                    locStatus.innerText = "Gagal mendapatkan nama jalan.";
                }
            } catch (error) {
                console.error("Error geocoding:", error);
                locStatus.innerText = "Gagal koneksi ke peta.";
            }

        }, (error) => {
            locStatus.innerText = "Gagal: Pastikan GPS aktif dan izinkan akses lokasi.";
        });
    });
}

// --- LOGIKA REGISTER ---
const registerForm = document.getElementById('registerForm');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const address = document.getElementById('regAddress').value;
        const role = document.getElementById('regRole').value;

        try {
            // 1. Buat User di Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Simpan Data Tambahan & Role di Firestore
            // Kita buat collection 'users' dengan ID dokumen sama dengan User ID (UID)
            await setDoc(doc(db, "users", user.uid), {
                name: name,
                email: email,
                address: address,
                role: role,
                createdAt: new Date()
            });

            // 3. Kirim Email Verifikasi
            await sendEmailVerification(user);

            alert(`Registrasi Berhasil! Email verifikasi telah dikirim ke ${email}. Silakan cek inbox/spam anda sebelum login.`);

            // Redirect ke halaman login
            window.location.href = "index.html";

        } catch (error) {
            console.error(error);
            let msg = error.message;
            if (error.code === 'auth/email-already-in-use') msg = "Email sudah terdaftar.";
            if (error.code === 'auth/weak-password') msg = "Password terlalu lemah (min 6 karakter).";
            alert("Error: " + msg);
        }
    });
}

// --- LOGIKA LOGIN ---
const loginForm = document.getElementById('loginForm');
const loginMsg = document.getElementById('loginMessage');

// Toggle Password Login (Sama seperti register)
const toggleLoginPass = document.getElementById('toggleLoginPassword');
const loginPassInput = document.getElementById('loginPassword');
if(toggleLoginPass) {
    toggleLoginPass.addEventListener('click', function() {
        const type = loginPassInput.getAttribute('type') === 'password' ? 'text' : 'password';
        loginPassInput.setAttribute('type', type);
        this.classList.toggle('fa-eye-slash');
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginMsg.innerText = "Sedang memproses...";

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            // 1. Proses Login ke Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Cek Verifikasi Email
            if (!user.emailVerified) {
                // Jika belum verifikasi, paksa logout dan beri peringatan
                await signOut(auth);
                loginMsg.innerText = "Email belum diverifikasi! Cek inbox/spam email Anda.";
                return;
            }

            // 3. Cek Role di Firestore (Database)
            // Kita ambil data user dari collection 'users' berdasarkan UID
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const userData = docSnap.data();
                const role = userData.role;

                loginMsg.style.color = "green";
                loginMsg.innerText = "Login berhasil! Mengalihkan...";

                // 4. Redirect Berdasarkan Role
                setTimeout(() => {
                    if (role === 'admin') {
                        window.location.href = "admin-dashboard.html";
                    } else if (role === 'kurir') {
                        window.location.href = "courier-dashboard.html";
                    } else {
                        // Default ke customer
                        window.location.href = "home.html";
                    }
                }, 1000); // Delay 1 detik biar user baca pesan sukses

            } else {
                loginMsg.innerText = "Data user tidak ditemukan di database.";
            }

        } catch (error) {
            console.error("Login Error:", error);
            let msg = "Email atau password salah.";
            if (error.code === 'auth/user-not-found') msg = "Akun tidak ditemukan.";
            if (error.code === 'auth/wrong-password') msg = "Password salah.";
            if (error.code === 'auth/too-many-requests') msg = "Terlalu banyak percobaan gagal. Coba lagi nanti.";
            
            loginMsg.style.color = "red";
            loginMsg.innerText = msg;
        }
    });
}