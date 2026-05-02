/* ==========================================================================
   SMART BSU - MAIN JAVASCRIPT (BAGIAN 1)
   Menangani Autentikasi, UI Interactions, Counter, dan LocalStorage
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // ----------------------------------------------------------------------
    // 1. STATE & LOCAL STORAGE UTILITIES
    // ----------------------------------------------------------------------
    const STORAGE_KEY_USERS = 'smartbsu_users';
    const STORAGE_KEY_SESSION = 'smartbsu_session';
    
    // Ambil semua data user
    const getUsers = () => JSON.parse(localStorage.getItem(STORAGE_KEY_USERS)) || [];
    
    // Simpan semua data user
    const saveUsers = (users) => localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    
    // Ambil session saat ini (User yang sedang login)
    const getSession = () => JSON.parse(localStorage.getItem(STORAGE_KEY_SESSION)) || null;
    
    // Simpan session
    const saveSession = (user) => localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
    
    // Hapus session (Logout)
    const clearSession = () => localStorage.removeItem(STORAGE_KEY_SESSION);

    // Update session (sinkronisasi dengan database users)
    const syncSession = () => {
        let session = getSession();
        if (session) {
            let users = getUsers();
            let updatedUser = users.find(u => u.id === session.id);
            if (updatedUser) saveSession(updatedUser);
        }
    };

    // Helper: Tampilkan Pesan Form
    const showMessage = (elementId, msg, type = 'success') => {
        const el = document.getElementById(elementId);
        if (el) {
            el.textContent = msg;
            el.className = `form-message ${type}`;
            setTimeout(() => { el.style.display = 'none'; }, 4000);
        }
    };

    // ----------------------------------------------------------------------
    // 2. UI INTERACTIONS (NAVBAR, MOBILE MENU, TABS)
    // ----------------------------------------------------------------------
    
    // Update Navbar UI jika user login
    const updateNavbar = () => {
        const session = getSession();
        const navPointVal = document.getElementById('nav-point-val');
        const navAvatarImg = document.getElementById('avatar-img');
        
        if (session) {
            if (navPointVal) navPointVal.textContent = session.point.toLocaleString('id-ID');
            if (navAvatarImg) navAvatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(session.nama)}&background=22c55e&color=fff`;
        }
    };
    updateNavbar();

    // Hamburger Menu Mobile
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileNav = document.getElementById('mobileNav');
    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', () => {
            mobileNav.classList.toggle('open');
            const icon = menuToggle.querySelector('i');
            if (mobileNav.classList.contains('open')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Tabs Edukasi (sampah.html)
    const eduTabs = document.querySelectorAll('.waste-tab');
    if (eduTabs.length > 0) {
        eduTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                // Hilangkan active dari semua tab
                eduTabs.forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.waste-panel').forEach(p => p.classList.remove('active'));
                
                // Tambahkan active ke tab yang diklik
                e.target.classList.add('active');
                const targetId = e.target.getAttribute('data-target');
                document.getElementById(targetId).classList.add('active');
            });
        });
    }

    // Toggle Password Visibility
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });

    // ----------------------------------------------------------------------
    // 3. ANIMASI COUNTER (DASHBOARD INDEX)
    // ----------------------------------------------------------------------
    const counters = document.querySelectorAll('.counter');
    if (counters.length > 0) {
        const runCounter = () => {
            counters.forEach(counter => {
                const updateCount = () => {
                    const target = +counter.getAttribute('data-target');
                    const count = +counter.innerText;
                    const speed = 150; // Semakin kecil semakin cepat
                    const inc = target / speed;

                    if (count < target) {
                        counter.innerText = Math.ceil(count + inc);
                        setTimeout(updateCount, 15);
                    } else {
                        counter.innerText = target;
                    }
                };
                updateCount();
            });
        };
        
        // Jalankan saat masuk viewport
        let animated = false;
        window.addEventListener('scroll', () => {
            if (!animated && window.scrollY > 100) {
                runCounter();
                animated = true;
            }
        });
        // Jika sudah di atas scroll
        if (window.scrollY <= 100) setTimeout(runCounter, 500);
    }

    // ----------------------------------------------------------------------
    // 4. AUTHENTICATION SYSTEM (LOGIN / SIGN UP)
    // ----------------------------------------------------------------------
    
    // Tab Switch Login/Signup
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const formLogin = document.getElementById('form-login');
    const formSignup = document.getElementById('form-signup');
    const authSubtitle = document.getElementById('auth-subtitle');

    if (tabLogin && tabSignup) {
        tabLogin.addEventListener('click', () => {
            tabLogin.classList.add('active');
            tabSignup.classList.remove('active');
            formLogin.classList.add('active');
            formSignup.classList.remove('active');
            authSubtitle.textContent = 'Selamat datang kembali! Silakan masuk ke akun Anda.';
        });

        tabSignup.addEventListener('click', () => {
            tabSignup.classList.add('active');
            tabLogin.classList.remove('active');
            formSignup.classList.add('active');
            formLogin.classList.remove('active');
            authSubtitle.textContent = 'Bergabunglah menjadi pahlawan lingkungan Kota Bogor.';
        });
    }

    // Proses Sign Up
    if (formSignup) {
        formSignup.addEventListener('submit', (e) => {
            e.preventDefault();
            const nama = document.getElementById('reg-nama').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const tgl = document.getElementById('reg-tgl').value;
            const kecamatan = document.getElementById('reg-kecamatan').value;
            const sektor = document.getElementById('reg-sektor').value;
            const password = document.getElementById('reg-password').value;

            let users = getUsers();
            
            // Cek Email existing
            if (users.find(u => u.email === email)) {
                showMessage('reg-msg', 'Email sudah terdaftar. Silakan gunakan email lain atau Login.', 'error');
                return;
            }

            // Buat User Baru
            const newUser = {
                id: 'BSU' + Math.floor(Math.random() * 900000 + 100000), // Generate Random ID
                nama, email, tgl, kecamatan, sektor, password,
                point: 0,
                totalKg: 0,
                history: []
            };

            users.push(newUser);
            saveUsers(users);
            
            // Auto Login
            saveSession(newUser);
            showMessage('reg-msg', 'Pendaftaran Berhasil! Mengalihkan ke Profil...', 'success');
            
            setTimeout(() => { window.location.href = 'profile.html'; }, 1500);
        });
    }

    // Proses Login
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            let users = getUsers();
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                saveSession(user);
                showMessage('login-msg', 'Login Berhasil! Mengalihkan...', 'success');
                setTimeout(() => { window.location.href = 'profile.html'; }, 1000);
            } else {
                showMessage('login-msg', 'Email atau Password salah!', 'error');
            }
        });
    }

    // Logout Functionality (Di Profile Page)
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            clearSession();
            window.location.href = 'login.html';
        });
    }
    // ----------------------------------------------------------------------
    // 5. PROFILE PAGE LOGIC (profile.html)
    // ----------------------------------------------------------------------
    const path = window.location.pathname;
    const isProfilePage = path.includes('profile.html');
    const isPointPage = path.includes('point.html');

    if (isProfilePage) {
        const session = getSession();
        if (!session) {
            window.location.href = 'login.html'; // Redirect jika belum login
        } else {
            // Populate Display Data Profile
            document.getElementById('disp-nama').textContent = session.nama;
            document.getElementById('disp-email').innerHTML = `<i class="fas fa-envelope"></i> ${session.email}`;
            document.getElementById('disp-kecamatan').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${session.kecamatan}`;
            document.getElementById('disp-sektor').innerHTML = `<i class="fas fa-briefcase"></i> ${session.sektor}`;
            document.getElementById('disp-point').textContent = session.point.toLocaleString('id-ID');
            document.getElementById('disp-kg').textContent = session.totalKg;
            document.getElementById('disp-userid').textContent = `ID: ${session.id}`;
            document.getElementById('main-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(session.nama)}&background=ffffff&color=22c55e&size=120`;

            // Populate Form Edit Profile
            document.getElementById('upd-nama').value = session.nama;
            document.getElementById('upd-email').value = session.email;
            document.getElementById('upd-tgl').value = session.tgl;
            document.getElementById('upd-kecamatan').value = session.kecamatan;
            document.getElementById('upd-sektor').value = session.sektor;

            // Handle Update Profile
            const formUpdate = document.getElementById('form-update-profile');
            if (formUpdate) {
                formUpdate.addEventListener('submit', (e) => {
                    e.preventDefault();
                    session.nama = document.getElementById('upd-nama').value;
                    session.tgl = document.getElementById('upd-tgl').value;
                    session.kecamatan = document.getElementById('upd-kecamatan').value;
                    session.sektor = document.getElementById('upd-sektor').value;
                    
                    saveSession(session);
                    syncSession();
                    
                    // Update tampilan real-time
                    document.getElementById('disp-nama').textContent = session.nama;
                    document.getElementById('disp-kecamatan').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${session.kecamatan}`;
                    document.getElementById('disp-sektor').innerHTML = `<i class="fas fa-briefcase"></i> ${session.sektor}`;
                    document.getElementById('main-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(session.nama)}&background=ffffff&color=22c55e&size=120`;
                    updateNavbar();
                    
                    showMessage('update-msg', 'Profil Anda berhasil diperbarui!', 'success');
                });
            }

            // Generate Dynamic QR Code untuk Identitas User
            const qrContainer = document.getElementById('user-qr-code');
            if (qrContainer && typeof QRCode !== 'undefined') {
                qrContainer.innerHTML = ''; // bersihkan dulu
                new QRCode(qrContainer, {
                    text: `SMARTBSU_USERID:${session.id}`,
                    width: 160,
                    height: 160,
                    colorDark : "#166534", // Hijau gelap
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.H
                });
            }
        }
    }

    // ----------------------------------------------------------------------
    // 6. GAMIFICATION & POINT SYSTEM LOGIC (point.html)
    // ----------------------------------------------------------------------
    const refreshPointDisplay = () => {
        const session = getSession();
        if (session) {
            const ptEl = document.getElementById('disp-point-big');
            const kgEl = document.getElementById('disp-kg-big');
            if (ptEl) ptEl.textContent = session.point.toLocaleString('id-ID');
            if (kgEl) kgEl.textContent = session.totalKg;

            // Update Progress Bar
            const target = 500;
            const progressFill = document.getElementById('progress-bar');
            const progressText = document.getElementById('progress-text');
            if (progressFill && progressText) {
                let currentProgress = session.point % target;
                if (session.point > 0 && currentProgress === 0) currentProgress = target; // Jika pas kelipatan 500
                let pct = Math.min((currentProgress / target) * 100, 100);
                progressFill.style.width = pct + '%';
                progressText.textContent = `${currentProgress} / ${target} Pts`;
            }

            updateNavbar(); // Sinkronisasi dengan navbar
        }
    };

    const renderLog = () => {
        const session = getSession();
        const logContainer = document.getElementById('transaction-log');
        if (!session || !logContainer) return;

        if (session.history.length === 0) {
            logContainer.innerHTML = `
                <div class="text-center p-3 text-gray">
                    <i class="fas fa-box-open" style="font-size: 2rem; margin-bottom: 10px; color: var(--gray-300);"></i>
                    <p style="font-size: 0.85rem;">Belum ada riwayat transaksi.</p>
                </div>`;
            return;
        }

        let html = '';
        // Reverse array agar log terbaru berada di atas
        const reversedHistory = [...session.history].reverse();
        reversedHistory.forEach(log => {
            const isAdd = log.type === 'in';
            const icon = isAdd ? '<i class="fas fa-leaf"></i>' : '<i class="fas fa-gift"></i>';
            const colorClass = isAdd ? 'text-green-600 bg-green-50' : 'text-blue-600 bg-blue-50';
            const sign = isAdd ? '+' : '-';
            const amountClass = isAdd ? 'plus' : 'minus';

            html += `
            <div class="log-item">
                <div class="d-flex align-center">
                    <div class="log-icon ${colorClass}">${icon}</div>
                    <div class="log-info">
                        <h4>${log.desc}</h4>
                        <p>${log.date}</p>
                    </div>
                </div>
                <div class="log-amount ${amountClass}">${sign} ${log.amount} Pts</div>
            </div>`;
        });
        logContainer.innerHTML = html;
    };

    if (isPointPage) {
        const session = getSession();
        if (!session) {
            // Jika belum login saat akses halaman point
            const msg = document.createElement('div');
            msg.className = 'alert alert-warning text-center mt-3';
            msg.innerHTML = '<strong>Perhatian!</strong> Anda harus <a href="login.html" style="text-decoration:underline;">login</a> untuk merekam aktivitas point.';
            document.querySelector('.point-hero-wrapper').appendChild(msg);
        } else {
            refreshPointDisplay();
            renderLog();

            // Interaksi Simulasi Setor Sampah
            const inputSetor = document.getElementById('input-setor-kg');
            const previewSetor = document.getElementById('setor-preview');
            const formSetor = document.getElementById('form-setor');

            if (inputSetor && previewSetor) {
                inputSetor.addEventListener('input', () => {
                    const kg = parseFloat(inputSetor.value) || 0;
                    previewSetor.textContent = `+ ${Math.floor(kg * 10)} Pts`;
                });
            }

            if (formSetor) {
                formSetor.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const kg = parseFloat(inputSetor.value);
                    if (kg > 0) {
                        const pts = Math.floor(kg * 10);
                        session.point += pts;
                        session.totalKg += kg;
                        
                        const today = new Date();
                        session.history.push({
                            type: 'in',
                            amount: pts,
                            desc: `Setor ${kg} Kg Sampah Organik`,
                            date: `${today.getDate()}/${today.getMonth()+1}/${today.getFullYear()}`
                        });

                        saveSession(session);
                        syncSession();
                        refreshPointDisplay();
                        renderLog();
                        
                        inputSetor.value = '';
                        previewSetor.textContent = '+ 0 Pts';
                        alert(`Hebat! ${pts} Point berhasil ditambahkan ke saldo Anda.`);
                    }
                });
            }

            // Interaksi Simulasi Tukar Point
            const inputTukar = document.getElementById('input-tukar-point');
            const previewTukar = document.getElementById('tukar-preview');
            const formTukar = document.getElementById('form-tukar');

            if (inputTukar && previewTukar) {
                inputTukar.addEventListener('input', () => {
                    const pts = parseInt(inputTukar.value) || 0;
                    const rupiah = (pts / 100) * 5000;
                    previewTukar.textContent = `Rp ${rupiah.toLocaleString('id-ID')}`;
                });
            }

            if (formTukar) {
                formTukar.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const pts = parseInt(inputTukar.value);
                    
                    if (pts < 50) {
                        showMessage('tukar-msg', 'Minimal penukaran adalah 50 point.', 'error');
                        return;
                    }
                    
                    if (session.point < pts) {
                        showMessage('tukar-msg', 'Saldo point Anda tidak mencukupi untuk penukaran ini!', 'error');
                        return;
                    }

                    session.point -= pts;
                    const rupiah = (pts / 100) * 5000;
                    
                    const today = new Date();
                    session.history.push({
                        type: 'out',
                        amount: pts,
                        desc: `Tukar Point ke Reward (Voucher/Sembako)`,
                        date: `${today.getDate()}/${today.getMonth()+1}/${today.getFullYear()}`
                    });

                    saveSession(session);
                    syncSession();
                    refreshPointDisplay();
                    renderLog();

                    inputTukar.value = '';
                    previewTukar.textContent = 'Rp 0';
                    showMessage('tukar-msg', `Berhasil! Transaksi penukaran point senilai Rp ${rupiah.toLocaleString('id-ID')} diproses.`, 'success');
                });
            }

            // QR Redeem Khusus Penukaran (Warna Biru)
            const qrRedeem = document.getElementById('redeem-qr-code');
            if (qrRedeem && typeof QRCode !== 'undefined') {
                qrRedeem.innerHTML = '';
                new QRCode(qrRedeem, {
                    text: `SMARTBSU_REDEEM_PROCESS:${session.id}`,
                    width: 140,
                    height: 140,
                    colorDark : "#1e3a8a", 
                    colorLight : "#f8fafc",
                    correctLevel : QRCode.CorrectLevel.M
                });
            }

            // Tombol Reset Log (Untuk Kepentingan Demo)
            const btnResetLog = document.getElementById('btn-reset-log');
            if (btnResetLog) {
                btnResetLog.addEventListener('click', () => {
                    if (confirm('Anda yakin ingin mereset seluruh data point dan riwayat Anda?')) {
                        session.point = 0;
                        session.totalKg = 0;
                        session.history = [];
                        saveSession(session);
                        syncSession();
                        refreshPointDisplay();
                        renderLog();
                    }
                });
            }
        }
    }

    // ----------------------------------------------------------------------
    // 7. FORM PARTNERSHIP & QR INFO UMUM
    // ----------------------------------------------------------------------
    const formPartnership = document.getElementById('form-partnership');
    if (formPartnership) {
        formPartnership.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = formPartnership.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses Pengajuan...';
            btn.disabled = true;

            // Simulasi API Call
            setTimeout(() => {
                formPartnership.reset();
                btn.innerHTML = originalText;
                btn.disabled = false;
                showMessage('partner-msg', 'Pengajuan berhasil dikirim! Tim SMART BSU akan menghubungi Anda maksimal 1x24 Jam.', 'success');
            }, 1800);
        });
    }

    // Generate QR Code Beranda (Akses Info Cepat SMART BSU)
    const qrInfo = document.getElementById('info-qr-code');
    if (qrInfo && typeof QRCode !== 'undefined') {
        qrInfo.innerHTML = '';
        new QRCode(qrInfo, {
            text: "https://smartbsu.id/info-jadwal",
            width: 140,
            height: 140,
            colorDark : "#14532d",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.M
        });
    }

}); // <-- END OF DOMContentLoaded