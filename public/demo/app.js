// ==========================================================================
// Configuración y Variables de Estado Global
// ==========================================================================
const API_BASE =
  window.location.origin.includes("localhost") || window.location.origin.includes("127.0.0.1")
    ? window.location.origin
    : "http://localhost:3000";

let currentCaptchaToken = null;
let captchaTimerInterval = null;

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ==========================================================================
// Inicialización
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  setupCaptchaModule();
  setupAuthModule();
  setupCatalogoModule();
  checkStoredSession();
});

// ==========================================================================
// 1. Control de Pestañas Principales
// ==========================================================================
function setupTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      btn.classList.add("active");
      const targetTab = document.getElementById(`tab-${btn.dataset.tab}`);
      if (targetTab) {
        targetTab.classList.add("active");
      }

      // Si abre el catálogo, cargar escenas automáticamente
      if (btn.dataset.tab === "catalogo") {
        cargarCatalogo();
      }
    });
  });
}

// ==========================================================================
// 2. Módulo Motor CAPTCHA Cultural
// ==========================================================================
function setupCaptchaModule() {
  const btnGenerar = document.getElementById("btn-generar-captcha");
  const selectDificultad = document.getElementById("captcha-dificultad");
  const formValidar = document.getElementById("form-validar-captcha");
  const inputRespuesta = document.getElementById("input-respuesta-captcha");

  btnGenerar.addEventListener("click", async () => {
    const dificultad = selectDificultad.value;
    await generarNuevoDesafio(dificultad);
  });

  formValidar.addEventListener("submit", async (e) => {
    e.preventDefault();
    const respuesta = inputRespuesta.value.trim();
    if (!currentCaptchaToken || !respuesta) return;

    await validarDesafioCaptcha(currentCaptchaToken, respuesta);
  });
}

async function generarNuevoDesafio(dificultad = "") {
  const placeholder = document.getElementById("captcha-placeholder");
  const challengeView = document.getElementById("captcha-challenge-view");
  const badgeMeta = document.getElementById("captcha-meta-badge");
  const alertResult = document.getElementById("captcha-result");
  const btnGenerar = document.getElementById("btn-generar-captcha");

  btnGenerar.disabled = true;
  btnGenerar.textContent = "⏳ Generando Desafío...";
  alertResult.classList.add("hidden");

  try {
    const url = dificultad
      ? `${API_BASE}/captcha/nuevo?dificultad=${encodeURIComponent(dificultad)}`
      : `${API_BASE}/captcha/nuevo`;
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Error al generar desafío");

    currentCaptchaToken = data.token;

    // Actualizar vista
    document.getElementById("meta-obra").textContent = data.obra || "Obra Desconocida";
    document.getElementById("meta-dificultad").textContent = data.dificultad || "medio";
    document.getElementById("meta-token").textContent = data.token;
    document.getElementById("challenge-image").src = data.imagen_url;
    document.getElementById("input-respuesta-captcha").value = "";

    badgeMeta.textContent = "Desafío Pendiente";
    badgeMeta.className = "badge badge-warning";

    placeholder.classList.add("hidden");
    challengeView.classList.remove("hidden");

    iniciarTemporizador(data.expira_en);
    document.getElementById("input-respuesta-captcha").focus();
  } catch (error) {
    alert("Error: " + error.message);
  } finally {
    btnGenerar.disabled = false;
    btnGenerar.textContent = "🎲 Generar Nuevo Desafío";
  }
}

async function validarDesafioCaptcha(token, respuesta) {
  const alertResult = document.getElementById("captcha-result");
  const btnValidar = document.getElementById("btn-validar-captcha");
  const badgeMeta = document.getElementById("captcha-meta-badge");

  btnValidar.disabled = true;
  btnValidar.textContent = "⏳ Verificando...";

  try {
    const res = await fetch(`${API_BASE}/captcha/validar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, respuesta }),
    });

    const data = await res.json();

    alertResult.classList.remove("hidden", "alert-success", "alert-danger");

    if (data.valido) {
      alertResult.classList.add("alert-success");
      alertResult.innerHTML = `
        <strong>✅ ¡Verificación Exitosa!</strong><br>
        Has demostrado ser un humano. La transcripción cultural coincide satisfactoriamente.<br>
        <small style="opacity: 0.8">Desafío ID: ${escapeHtml(data.desafio_id)}</small>
      `;
      badgeMeta.textContent = "Resuelto";
      badgeMeta.className = "badge badge-success";
      clearInterval(captchaTimerInterval);
    } else {
      alertResult.classList.add("alert-danger");
      alertResult.innerHTML = `
        <strong>❌ Verificación Fallida</strong><br>
        ${escapeHtml(data.message || "El texto ingresado no coincide con el subtítulo.")}
      `;
    }
  } catch (error) {
    alertResult.classList.remove("hidden");
    alertResult.classList.add("alert-danger");
    alertResult.textContent = "Error de red: " + error.message;
  } finally {
    btnValidar.disabled = false;
    btnValidar.textContent = "✨ Verificar Respuesta (Validar Humano)";
  }
}

function iniciarTemporizador(expiraEnIso) {
  clearInterval(captchaTimerInterval);
  const timerBadge = document.getElementById("meta-timer");
  const expiraTimestamp = new Date(expiraEnIso).getTime();

  function actualizar() {
    const ahora = Date.now();
    const restante = expiraTimestamp - ahora;

    if (restante <= 0) {
      clearInterval(captchaTimerInterval);
      timerBadge.textContent = "Expirado";
      timerBadge.className = "badge badge-neutral";
      const alertResult = document.getElementById("captcha-result");
      alertResult.className = "alert-box alert-danger";
      alertResult.textContent =
        "El tiempo de este desafío ha expirado. Por favor genera uno nuevo.";
      alertResult.classList.remove("hidden");
      return;
    }

    const minutos = Math.floor(restante / 60000);
    const segundos = Math.floor((restante % 60000) / 1000);
    timerBadge.textContent = `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
  }

  actualizar();
  captchaTimerInterval = setInterval(actualizar, 1000);
}

// ==========================================================================
// 3. Módulo de Autenticación y JWT
// ==========================================================================
function setupAuthModule() {
  const subtabBtns = document.querySelectorAll(".subtab-btn");
  const forms = {
    login: document.getElementById("form-login"),
    registro: document.getElementById("form-registro"),
  };

  subtabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      subtabBtns.forEach((b) => b.classList.remove("active"));
      Object.values(forms).forEach((f) => f.classList.remove("active"));

      btn.classList.add("active");
      forms[btn.dataset.subtab].classList.add("active");
    });
  });

  // Credenciales rápidas
  const credentials = {
    admin: { correo: "admin@apimedia.com", pass: "Admin123*" },
    carlos: { correo: "carlos.gomez@ejemplo.com", pass: "ClaveSegura123" },
    mariana: { correo: "mariana.lopez@ejemplo.com", pass: "Segura2026*" },
  };

  document.querySelectorAll(".btn-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const u = credentials[chip.dataset.user];
      if (u) {
        document.getElementById("login-correo").value = u.correo;
        document.getElementById("login-password").value = u.pass;
      }
    });
  });

  // Formulario Login
  forms.login.addEventListener("submit", async (e) => {
    e.preventDefault();
    const correo = document.getElementById("login-correo").value.trim();
    const contrasena = document.getElementById("login-password").value;
    await realizarLogin(correo, contrasena);
  });

  // Formulario Registro
  forms.registro.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = document.getElementById("reg-nombre").value.trim();
    const apellido = document.getElementById("reg-apellido").value.trim();
    const correo = document.getElementById("reg-correo").value.trim();
    const contrasena = document.getElementById("reg-password").value;
    const rol = document.getElementById("reg-rol").value;
    await realizarRegistro({ nombre, apellido, correo, contrasena, rol });
  });

  // Botón Copiar Token
  document.getElementById("btn-copy-token").addEventListener("click", () => {
    const inputToken = document.getElementById("active-jwt-token");
    navigator.clipboard.writeText(inputToken.value);
    alert("Token copiado al portapapeles");
  });

  // Botón Consultar Perfil
  document.getElementById("btn-get-perfil").addEventListener("click", consultarPerfilActual);

  // Botón Logout
  document.getElementById("btn-logout").addEventListener("click", cerrarSesion);
}

async function realizarLogin(correo, contrasena) {
  const alertBox = document.getElementById("auth-alert");
  alertBox.classList.add("hidden");

  try {
    const res = await fetch(`${API_BASE}/usuarios/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, contrasena }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al iniciar sesión");

    localStorage.setItem("api_media_token", data.token);
    localStorage.setItem("api_media_user", JSON.stringify(data.usuario));

    actualizarVistaSesion(data.usuario, data.token);
  } catch (error) {
    alertBox.className = "alert-box alert-danger";
    alertBox.textContent = error.message;
    alertBox.classList.remove("hidden");
  }
}

async function realizarRegistro(datos) {
  const alertBox = document.getElementById("auth-alert");
  alertBox.classList.add("hidden");

  try {
    const headers = { "Content-Type": "application/json" };
    const activeToken = localStorage.getItem("api_media_token");
    if (activeToken) {
      headers["Authorization"] = `Bearer ${activeToken}`;
    }

    const res = await fetch(`${API_BASE}/usuarios`, {
      method: "POST",
      headers,
      body: JSON.stringify(datos),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al registrar usuario");

    alertBox.className = "alert-box alert-success";
    alertBox.textContent = "¡Usuario registrado con éxito! Iniciando sesión...";
    alertBox.classList.remove("hidden");

    await realizarLogin(datos.correo, datos.contrasena);
  } catch (error) {
    alertBox.className = "alert-box alert-danger";
    alertBox.textContent = error.message;
    alertBox.classList.remove("hidden");
  }
}

function checkStoredSession() {
  const token = localStorage.getItem("api_media_token");
  const userJson = localStorage.getItem("api_media_user");

  if (token && userJson) {
    try {
      const user = JSON.parse(userJson);
      actualizarVistaSesion(user, token);
    } catch {
      cerrarSesion();
    }
  }
}

function sincronizarSelectorRolRegistro(esAdmin) {
  const optAdmin = document.getElementById("opt-reg-admin");
  const selectRol = document.getElementById("reg-rol");
  if (!optAdmin || !selectRol) return;

  optAdmin.disabled = !esAdmin;
  optAdmin.textContent = esAdmin
    ? "Administrador"
    : "Administrador (Requiere sesión Admin)";
  if (!esAdmin && selectRol.value === "admin") {
    selectRol.value = "cliente";
  }
}

function actualizarVistaSesion(user, token) {
  document.getElementById("session-unauthenticated").classList.add("hidden");
  document.getElementById("session-authenticated").classList.remove("hidden");

  const badge = document.getElementById("session-badge");
  badge.textContent = `Sesión: ${user.rol || "cliente"}`;
  badge.className = "badge badge-success";

  document.getElementById("profile-avatar").textContent = (user.nombre || "U")[0].toUpperCase();
  document.getElementById("profile-name").textContent = `${user.nombre} ${user.apellido || ""}`.trim();
  document.getElementById("profile-email").textContent = user.correo;
  document.getElementById("profile-role").textContent = user.rol || "cliente";
  document.getElementById("active-jwt-token").value = token;

  sincronizarSelectorRolRegistro(user.rol === "admin");
}

function cerrarSesion() {
  localStorage.removeItem("api_media_token");
  localStorage.removeItem("api_media_user");

  document.getElementById("session-unauthenticated").classList.remove("hidden");
  document.getElementById("session-authenticated").classList.add("hidden");

  const badge = document.getElementById("session-badge");
  badge.textContent = "No autenticado";
  badge.className = "badge badge-neutral";

  document.getElementById("profile-json-output").textContent = "// Sesión cerrada";
  sincronizarSelectorRolRegistro(false);
}

async function consultarPerfilActual() {
  const token = localStorage.getItem("api_media_token");
  const jsonViewer = document.getElementById("profile-json-output");

  if (!token) return;

  jsonViewer.textContent = "// Consultando GET /usuarios/perfil...";

  try {
    const res = await fetch(`${API_BASE}/usuarios/perfil`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    jsonViewer.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    jsonViewer.textContent = `// Error: ${error.message}`;
  }
}

// ==========================================================================
// 4. Módulo de Catálogo Audiovisual
// ==========================================================================
function setupCatalogoModule() {
  const btnRecargar = document.getElementById("btn-recargar-catalogo");
  const selectFiltro = document.getElementById("catalogo-filtro-dificultad");

  btnRecargar.addEventListener("click", cargarCatalogo);
  selectFiltro.addEventListener("change", cargarCatalogo);
}

async function cargarCatalogo() {
  const grid = document.getElementById("catalogo-grid");
  const loading = document.getElementById("catalogo-loading");
  const filtroDificultad = document.getElementById("catalogo-filtro-dificultad").value;

  loading.classList.remove("hidden");
  grid.innerHTML = "";

  try {
    const url = filtroDificultad
      ? `${API_BASE}/escenas?dificultad=${encodeURIComponent(filtroDificultad)}`
      : `${API_BASE}/escenas`;

    const headers = {};
    const token = localStorage.getItem("api_media_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, { headers });
    const escenas = await res.json();

    loading.classList.add("hidden");

    if (!Array.isArray(escenas) || escenas.length === 0) {
      grid.innerHTML =
        "<p style='color: var(--text-muted);'>No hay escenas disponibles con este filtro.</p>";
      return;
    }

    grid.innerHTML = escenas
      .map(
        (e) => `
        <div class="scene-card">
          <img src="${escapeHtml(e.imagen_url)}" alt="${escapeHtml(e.obra_titulo)}" class="scene-card-img" onerror="this.src='data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'300\\' height=\\'140\\'%3E%3Crect width=\\'300\\' height=\\'140\\' fill=\\'%231e293b\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' fill=\\'%2394a3b8\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\'%3EEscena ${Number(e.id)}%3C/text%3E%3C/svg%3E'">
          <div class="scene-card-body">
            <div>
              <h3 class="scene-card-title">${escapeHtml(e.obra_titulo)}</h3>
              <p class="scene-card-meta">${escapeHtml(e.personaje_nombre || "Personaje")} (${escapeHtml(e.actor_nombre || "Actor")}) • Minuto ${escapeHtml(e.minuto_escena)}</p>
              ${
                e.subtitulo_texto
                  ? `<blockquote class="scene-card-quote">"${escapeHtml(e.subtitulo_texto)}"</blockquote>`
                  : `<p class="scene-card-quote" style="font-style: normal; color: var(--text-muted);">🔒 Subtítulo incrustado en imagen (texto JSON solo visible para Admin)</p>`
              }
            </div>
            <div class="scene-card-footer">
              <span class="badge ${e.dificultad === "facil" ? "badge-success" : e.dificultad === "medio" ? "badge-warning" : "badge-info"}">${escapeHtml(e.dificultad)}</span>
              <span style="color: var(--text-muted);">ID #${Number(e.id)}</span>
            </div>
          </div>
        </div>
      `
      )
      .join("");
  } catch (error) {
    loading.classList.add("hidden");
    grid.innerHTML = `<p style="color: var(--accent-danger);">Error al cargar catálogo: ${escapeHtml(error.message)}</p>`;
  }
}
