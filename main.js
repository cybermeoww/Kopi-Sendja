import { auth, db, onAuthStateChanged, signOut, collection, onSnapshot, query, orderBy, doc, getDoc, addDoc, where } from "./firebase-config.js";

let currentUser = null;
let cart = [];
let allProducts = [];

// 1. CEK STATUS USER (LOGIN ATAU BELUM)
onAuthStateChanged(auth, async (user) => {
    const navLogin = document.getElementById('navLoginBtn');
    const userNav = document.getElementById('userNav');

    if (user) {
        // User Login
        currentUser = user;
        navLogin.style.display = 'none';
        userNav.style.display = 'flex';
        
        // Ambil Data Nama
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if(docSnap.exists()) {
            document.getElementById('welcomeName').innerText = "Hi, " + docSnap.data().name.split(' ')[0];
            document.getElementById('profName').innerText = docSnap.data().name;
            document.getElementById('profEmail').innerText = user.email;
            currentUser.dbData = docSnap.data(); // Simpan data lengkap
        }
        loadHistory(user.uid);
    } else {
        // User Belum Login (Guest)
        currentUser = null;
        navLogin.style.display = 'block';
        userNav.style.display = 'none';
    }
    loadProducts(); // Produk tetap dimuat walaupun belum login
});

// Logout
document.getElementById('btnLogout').addEventListener('click', () => {
    signOut(auth).then(() => window.location.reload());
});


// 2. LOAD PRODUK
function loadProducts() {
    onSnapshot(query(collection(db, "products")), (snap) => {
        allProducts = [];
        snap.forEach(d => allProducts.push({id: d.id, ...d.data()}));
        renderProducts(allProducts);
    });
}

function renderProducts(list) {
    const container = document.getElementById('productContainer');
    container.innerHTML = "";
    list.forEach(p => {
        container.innerHTML += `
            <div class="product-card">
                <img src="${p.image}" class="product-img">
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <div class="product-price">Rp ${p.price.toLocaleString()}</div>
                    <button class="btn-primary" onclick="addToCart('${p.id}', '${p.name}', ${p.price})">Tambah</button>
                </div>
            </div>
        `;
    });
}

// 3. ADD TO CART (DENGAN PROTEKSI LOGIN)
window.addToCart = (id, name, price) => {
    // INI LOGIKA PENTINGNYA:
    if (!currentUser) {
        if(confirm("Anda harus login untuk memesan. Ke halaman login sekarang?")) {
            window.location.href = "login.html";
        }
        return;
    }

    const exist = cart.find(x => x.id === id);
    if(exist) exist.qty++; else cart.push({id, name, price, qty:1});
    updateCart();
    alert("Masuk keranjang!");
};

function updateCart() {
    const box = document.getElementById('cartItems');
    box.innerHTML = "";
    let total = 0; let count = 0;
    
    cart.forEach((item, idx) => {
        total += item.price * item.qty; count += item.qty;
        box.innerHTML += `
            <div style="display:flex; justify-content:space-between; margin-bottom:5px; border-bottom:1px solid #eee; padding-bottom:5px;">
                <div>${item.name} (${item.qty}x)</div>
                <div>Rp ${(item.price * item.qty).toLocaleString()} <i class="fas fa-trash" style="color:red; cursor:pointer;" onclick="remCart(${idx})"></i></div>
            </div>`;
    });
    document.getElementById('cartTotal').innerText = total.toLocaleString();
    document.getElementById('cartCount').innerText = count;
}
window.remCart = (idx) => { cart.splice(idx, 1); updateCart(); };

// 4. CHECKOUT
document.getElementById('payMethod').addEventListener('change', (e) => {
    document.getElementById('qrisBox').style.display = e.target.value === 'dana' ? 'block' : 'none';
});

document.getElementById('btnCheckout').addEventListener('click', async () => {
    if(cart.length === 0) return alert("Keranjang kosong");
    
    const payMethod = document.getElementById('payMethod').value;
    const total = parseInt(document.getElementById('cartTotal').innerText.replace(/,/g, ''));

    await addDoc(collection(db, "orders"), {
        userId: currentUser.uid,
        customerName: currentUser.dbData.name,
        customerAddress: currentUser.dbData.address,
        items: cart,
        total: total,
        paymentMethod: payMethod,
        status: "diproses",
        createdAt: new Date(),
        locationLink: ""
    });
    
    alert("Pesanan Dibuat!");
    cart = []; updateCart();
    document.getElementById('cartModal').style.display='none';
});

// 5. HISTORY
function loadHistory(uid) {
    onSnapshot(query(collection(db, "orders"), where("userId", "==", uid), orderBy("createdAt", "desc")), (snap) => {
        const div = document.getElementById('orderHistory');
        div.innerHTML = "";
        snap.forEach(d => {
            const data = d.data();
            let link = data.status === 'dikirim' && data.locationLink ? `<br><a href="${data.locationLink}" target="_blank" style="color:blue">Lacak Kurir</a>` : '';
            div.innerHTML += `
                <div style="background:#f4f4f4; padding:10px; margin-bottom:10px; border-radius:5px;">
                    <b>Status: <span class="badge ${getStatusClass(data.status)}">${data.status}</span></b>
                    <p>Total: Rp ${data.total.toLocaleString()}</p>
                    ${link}
                </div>`;
        });
    });
}
function getStatusClass(s) { return s === 'diproses' ? 'bg-process' : s === 'dikirim' ? 'bg-shipping' : 'bg-success'; }