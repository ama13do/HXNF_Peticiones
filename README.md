# HXNF Peticiones — Setup Completo

Plataforma ciudadana para enviar peticiones a legisladores mexicanos.
Proyecto de Hackers x Nuestro Futuro.

---

## 📁 Estructura del proyecto

```
hxnf-peticiones/
├── public/
│   └── fonts/           ← PON AQUÍ TUS ARCHIVOS .woff2
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx          ← Landing page
│   │   ├── globals.css
│   │   └── formulario/
│   │       └── page.tsx      ← Formulario principal
│   ├── components/
│   │   ├── TopBanner.tsx
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── PrivacidadSection.tsx
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── cp-utils.ts
│   └── types/
│       └── index.ts
├── .env.local.example
├── .gitignore
├── netlify.toml
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

---

## 🔤 Cómo agregar tu tipografía local (Parkinsans)

1. Coloca tus archivos de fuente en la carpeta `/public/fonts/`:
   ```
   public/
   └── fonts/
       ├── Parkinsans-Regular.woff2
       ├── Parkinsans-SemiBold.woff2
       └── Parkinsans-Bold.woff2
   ```

2. Si tienes los archivos en otro formato (.ttf, .otf):
   - Convierte en: https://cloudconvert.com/ttf-to-woff2
   - O con `fonttools` si tienes Python:
     ```bash
     pip install fonttools brotli
     fonttools ttLib.woff2 compress Parkinsans-Regular.ttf
     ```

3. La declaración `@font-face` ya está en `globals.css`, solo asegúrate de que los nombres de archivo coincidan exactamente.

---

## 🔑 Variables de entorno (API Keys)

### En desarrollo local

1. Copia el archivo de ejemplo:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edita `.env.local` con tus credenciales de Supabase:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://svfppxpunsuvwskkmgtj.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

⚠️ **NUNCA** subas `.env.local` a GitHub. Ya está en `.gitignore`.

### Seguridad adicional en Supabase
1. Ve a tu dashboard de Supabase → Settings → API
2. En "Row Level Security", activa RLS en todas las tablas
3. Configura políticas para que el anon key solo pueda:
   - INSERT en `colaboradores`, `peticiones_enviadas`, `destinatarios_peticion`
   - SELECT en `diputados`, `senadores`, `plantillas`

---

## 🚀 Instalación y desarrollo local

```bash
# 1. Instala dependencias
npm install

# 2. Crea el archivo de variables
cp .env.local.example .env.local
# Edita .env.local con tus claves

# 3. Corre en desarrollo
npm run dev

# Abre http://localhost:3000
```

---

## 🌐 Desplegar en Netlify

### Opción A: Arrastra y suelta (más fácil)

1. Corre el build local:
   ```bash
   npm run build
   ```
2. Esto genera la carpeta `out/`
3. Ve a https://netlify.com → "Add new site" → "Deploy manually"
4. Arrastra la carpeta `out/` a la zona de deploy
5. Listo ✓

### Opción B: Conectar con GitHub (recomendado)

1. Sube tu proyecto a GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/tu-usuario/hxnf-peticiones.git
   git push -u origin main
   ```

2. Ve a https://app.netlify.com → "Add new site" → "Import an existing project"

3. Conecta tu repositorio de GitHub

4. En la configuración de build:
   - **Build command**: `npm run build`
   - **Publish directory**: `out`

5. Agrega las variables de entorno en Netlify:
   - Ve a Site settings → Environment variables
   - Agrega:
     - `NEXT_PUBLIC_SUPABASE_URL` = tu URL de Supabase
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tu anon key

6. Click en "Deploy site" ✓

El archivo `netlify.toml` ya está configurado correctamente.

---

## 🗄️ Supabase: Row Level Security (RLS)

Ejecuta estas políticas en el SQL Editor de Supabase para proteger tus datos:

```sql
-- Habilitar RLS
ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE peticiones_enviadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinatarios_peticion ENABLE ROW LEVEL SECURITY;
ALTER TABLE plantillas ENABLE ROW LEVEL SECURITY;
ALTER TABLE diputados ENABLE ROW LEVEL SECURITY;
ALTER TABLE senadores ENABLE ROW LEVEL SECURITY;

-- Lectura pública para tablas de datos
CREATE POLICY "Lectura publica diputados" ON diputados FOR SELECT TO anon USING (true);
CREATE POLICY "Lectura publica senadores" ON senadores FOR SELECT TO anon USING (true);
CREATE POLICY "Lectura publica plantillas" ON plantillas FOR SELECT TO anon USING (true);

-- Solo inserción para formulario
CREATE POLICY "Insercion colaboradores" ON colaboradores FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Upsert colaboradores" ON colaboradores FOR UPDATE TO anon USING (true);
CREATE POLICY "Insercion peticiones" ON peticiones_enviadas FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Insercion destinatarios" ON destinatarios_peticion FOR INSERT TO anon WITH CHECK (true);
```

---

## 📱 Notas sobre el diseño

- Fondo negro (#000000) en toda la app
- Color primario: verde HXNF (#0BE340)
- Accent amarillo: #E0FA49
- Diseño mobile-first, responsive
- Tipografía: Parkinsans (local)

---

## 🔧 Scripts disponibles

```bash
npm run dev      # Desarrollo local
npm run build    # Build para producción (genera carpeta out/)
npm run start    # Sirve el build localmente
npm run lint     # Linting
```
