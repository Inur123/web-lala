# 🚀 Panduan Deploy LATIN & LATPEL 2026 ke VPS

Panduan lengkap untuk mendeploy website pendaftaran LATIN & LATPEL PC IPNU IPPNU Kabupaten Magetan 2026 ke VPS Ubuntu.

---

## 📋 Prasyarat di VPS

### Sistem Operasi

- **Ubuntu 22.04 / 24.04 LTS**

### Software yang Harus Terinstal

| Software   | Versi Minimum | Cek Versi        |
| ---------- | ------------- | ---------------- |
| PHP        | 8.3+          | `php -v`         |
| Composer   | 2.x           | `composer -V`    |
| Node.js    | 20+           | `node -v`        |
| NPM        | 10+           | `npm -v`         |
| PostgreSQL | 15+           | `psql --version` |
| Nginx      | latest        | `nginx -v`       |
| Git        | latest        | `git --version`  |

### Ekstensi PHP yang Dibutuhkan

```bash
sudo apt install -y php8.3-fpm php8.3-cli php8.3-pgsql php8.3-mbstring \
  php8.3-xml php8.3-curl php8.3-zip php8.3-gd php8.3-intl \
  php8.3-bcmath php8.3-readline
```

---

## 🔧 Langkah-Langkah Setup

### 1. Clone Repository

```bash
cd /var/www
sudo git clone <URL_REPOSITORY> web-lala
sudo chown -R www-data:www-data web-lala
cd web-lala
```

### 2. Install Dependencies

```bash
# Backend
composer install --optimize-autoloader --no-dev

# Frontend
npm ci
npm run build
```

### 3. Setup Environment (.env)

```bash
cp .env.example .env
php artisan key:generate
nano .env
```

**Edit file `.env` dengan konfigurasi berikut:**

```env
APP_NAME="LATIN LATPEL 2026"
APP_ENV=production
APP_KEY=   # <-- sudah di-generate otomatis
APP_DEBUG=false
APP_URL=https://s.pelajarnumagetan.or.id

APP_LOCALE=id
APP_FALLBACK_LOCALE=id
APP_FAKER_LOCALE=id_ID
APP_TIMEZONE=Asia/Jakarta

APP_MAINTENANCE_DRIVER=file

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

# ─── Database (PostgreSQL) ─────────────────────────────
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=db_pelajarnu_staging
DB_USERNAME=user_pelajarnu
DB_PASSWORD=<PASSWORD_DATABASE>

# ─── Session & Cache ───────────────────────────────────
SESSION_DRIVER=database
SESSION_LIFETIME=10080
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=database

# ─── Email (Gmail SMTP) ───────────────────────────────
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=lacipelajarnumagetan@gmail.com
MAIL_PASSWORD=rdszzekompwovwnp
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=lacipelajarnumagetan@gmail.com
MAIL_FROM_NAME="${APP_NAME}"

# ─── Cloudflare R2 Storage ────────────────────────────
R2_ACCOUNT_ID="26f321e46253815e55591f01931f0be4"
R2_ACCESS_KEY_ID="1ec57895e8b2d65ed9dadfba72bf8733"
R2_SECRET_ACCESS_KEY="<SECRET_KEY_R2>"
R2_BUCKET_NAME="laciipnuippnu"

# ─── Cloudflare Turnstile ─────────────────────────────
TURNSTILE_SITE_KEY=<SITE_KEY_PRODUCTION>
TURNSTILE_SECRET_KEY=<SECRET_KEY_PRODUCTION>
TURNSTILE_ALLOWED_HOSTNAMES=s.pelajarnumagetan.or.id

VITE_APP_NAME="${APP_NAME}"
```

> ⚠️ **PENTING:**
>
> - `APP_DEBUG` harus `false` di production!
> - `APP_ENV` harus `production`
> - Ganti semua `<...>` dengan nilai asli

### 4. Setup Database

```bash
php artisan migrate --force
```

### 5. Optimasi Laravel

```bash
php artisan optimize
php artisan storage:link
```

### 6. Set Permission

```bash
sudo chown -R www-data:www-data /var/www/web-lala
sudo chmod -R 755 /var/www/web-lala
sudo chmod -R 775 /var/www/web-lala/storage
sudo chmod -R 775 /var/www/web-lala/bootstrap/cache
```

---

## 🌐 Konfigurasi Nginx

Buat file konfigurasi Nginx:

```bash
sudo nano /etc/nginx/sites-available/web-lala
```

Isi dengan:

```nginx
server {
    listen 80;
    server_name s.pelajarnumagetan.or.id;

    root /var/www/web-lala/public;
    index index.php;

    charset utf-8;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
    gzip_min_length 256;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Max upload size (untuk file pendaftaran)
    client_max_body_size 100M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Aktifkan dan restart:

```bash
sudo ln -s /etc/nginx/sites-available/web-lala /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 SSL/HTTPS (Certbot)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d s.pelajarnumagetan.or.id
```

Certbot akan otomatis mengubah konfigurasi Nginx ke HTTPS.

---

## 📧 Queue Worker (WAJIB untuk Email)

Email konfirmasi pendaftaran dikirim melalui _queue_ (background job). **Queue Worker HARUS berjalan** agar email terkirim.

### Setup Supervisor (Agar Berjalan Otomatis)

```bash
sudo apt install supervisor -y
sudo nano /etc/supervisor/conf.d/web-lala-worker.conf
```

Isi dengan:

```ini
[program:web-lala-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/web-lala/artisan queue:work database --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/var/www/web-lala/storage/logs/worker.log
stopwaitsecs=3600
```

Aktifkan:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start web-lala-worker:*
```

Cek status:

```bash
sudo supervisorctl status
```

---

## 🔄 Cara Update / Deploy Ulang

Setiap kali ada perubahan kode baru, jalankan perintah berikut di VPS:

```bash
cd /var/www/web-lala

# 1. Tarik kode terbaru
git pull origin main

# 2. Install dependensi
composer install --optimize-autoloader --no-dev
npm ci && npm run build

# 3. Migrasi database (jika ada perubahan)
php artisan migrate --force

# 4. Clear & rebuild cache
php artisan optimize:clear
php artisan optimize

# 5. Restart queue worker
sudo supervisorctl restart web-lala-worker:*

# 6. Restart PHP-FPM
sudo systemctl restart php8.3-fpm
```

> 💡 **Tips:** Bisa dibuat script `deploy.sh` agar tinggal jalankan satu perintah.

---

## 🧪 Checklist Setelah Deploy

Pastikan semua item berikut sudah ✅:

- [ ] Website bisa diakses via `https://s.pelajarnumagetan.or.id`
- [ ] Halaman pendaftaran (`/register`) bisa dibuka
- [ ] Upload file (PDF/gambar) berhasil ke Cloudflare R2
- [ ] Cloudflare Turnstile (captcha) muncul dan berfungsi
- [ ] Email konfirmasi terkirim setelah mendaftar
- [ ] Link WhatsApp di email bisa diklik dan masuk ke grup
- [ ] Halaman error (404) tampil dengan benar
- [ ] Dashboard admin (`/login`) bisa diakses
- [ ] Queue worker berjalan (`sudo supervisorctl status`)
- [ ] SSL/HTTPS aktif (gembok hijau di browser)
- [ ] `APP_DEBUG=false` di `.env` (KEAMANAN!)

---

## 🛠 Troubleshooting

### Email Tidak Terkirim

```bash
# Cek apakah queue worker berjalan
sudo supervisorctl status

# Cek log worker
tail -f /var/www/web-lala/storage/logs/worker.log

# Cek apakah ada job gagal
php artisan queue:failed

# Retry job yang gagal
php artisan queue:retry all
```

### Error 500 / Halaman Putih

```bash
# Cek log Laravel
tail -50 /var/www/web-lala/storage/logs/laravel.log

# Pastikan permission benar
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

### Upload File Gagal

```bash
# Cek konfigurasi R2 di .env
php artisan tinker
>>> Storage::disk('r2')->put('test.txt', 'hello');
# Harus return true

# Cek php.ini upload limit
php -i | grep upload_max_filesize
# Harus >= 10M
```

### Turnstile Tidak Muncul

- Pastikan `TURNSTILE_SITE_KEY` dan `TURNSTILE_SECRET_KEY` sudah diganti dengan key **production** dari dashboard Cloudflare
- Pastikan domain `s.pelajarnumagetan.or.id` sudah ditambahkan di `TURNSTILE_ALLOWED_HOSTNAMES`

---

## 📁 Struktur Penting

```
web-lala/
├── .env                    ← Konfigurasi utama (RAHASIA!)
├── public/                 ← Document root Nginx
│   ├── build/              ← Hasil npm run build (JS/CSS)
│   └── images/             ← Logo dan aset gambar
├── storage/
│   └── logs/               ← Log Laravel & worker
├── bootstrap/cache/        ← Cache konfigurasi
└── ...
```

> 🔴 **JANGAN** commit file `.env` ke Git. File ini berisi password dan API key!
