// src/lib/cp-utils.ts

export const CP_A_ESTADO: Record<string, string> = {
  "01": "Ciudad de México", "02": "Ciudad de México", "03": "Ciudad de México",
  "04": "Ciudad de México", "05": "Ciudad de México", "06": "Ciudad de México",
  "07": "Ciudad de México", "08": "Ciudad de México", "09": "Ciudad de México",
  "10": "Ciudad de México", "11": "Ciudad de México", "12": "Ciudad de México",
  "13": "Ciudad de México", "14": "Ciudad de México", "15": "Ciudad de México",
  "16": "Ciudad de México", "20": "Aguascalientes", "21": "Baja California",
  "22": "Baja California", "23": "Baja California Sur", "24": "Campeche",
  "25": "Coahuila", "26": "Coahuila", "27": "Coahuila", "28": "Colima",
  "29": "Chiapas", "30": "Chiapas", "31": "Chihuahua", "32": "Chihuahua",
  "33": "Chihuahua", "34": "Durango", "35": "Durango", "36": "Guanajuato",
  "37": "Guanajuato", "38": "Guanajuato", "39": "Guerrero", "40": "Guerrero",
  "41": "Guerrero", "42": "Hidalgo", "43": "Hidalgo", "44": "Jalisco",
  "45": "Jalisco", "46": "Jalisco", "47": "Jalisco", "48": "Jalisco",
  "49": "Jalisco", "50": "Estado de México", "51": "Estado de México",
  "52": "Estado de México", "53": "Estado de México", "54": "Estado de México",
  "55": "Estado de México", "56": "Estado de México", "57": "Estado de México",
  "58": "Michoacán", "59": "Michoacán", "60": "Michoacán", "61": "Michoacán",
  "62": "Morelos", "63": "Nayarit", "64": "Nuevo León", "65": "Nuevo León",
  "66": "Nuevo León", "67": "Nuevo León", "68": "Oaxaca", "69": "Oaxaca",
  "70": "Oaxaca", "71": "Oaxaca", "72": "Puebla", "73": "Puebla", "74": "Puebla",
  "75": "Puebla", "76": "Querétaro", "77": "Quintana Roo", "78": "San Luis Potosí",
  "79": "San Luis Potosí", "80": "Sinaloa", "81": "Sinaloa", "82": "Sinaloa",
  "83": "Sonora", "84": "Sonora", "85": "Sonora", "86": "Tabasco",
  "87": "Tamaulipas", "88": "Tamaulipas", "89": "Tamaulipas", "90": "Tlaxcala",
  "91": "Veracruz", "92": "Veracruz", "93": "Veracruz", "94": "Veracruz",
  "95": "Veracruz", "96": "Veracruz", "97": "Yucatán", "98": "Zacatecas",
  "99": "Zacatecas",
};

export function getEstadoFromCP(cp: string): string | null {
  if (!cp || cp.length < 2) return null;
  const prefix = cp.substring(0, 2);
  return CP_A_ESTADO[prefix] ?? null;
}

export function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);
}

export function abrirCorreo(params: {
  emails: string[];
  asunto: string;
  cuerpo: string;
  cco?: string;
}): void {
  const { emails, asunto, cuerpo, cco } = params;
  const bcc = cco ?? "hxnf@practica.lat";
  const to = emails.join(",");

  if (isMobile()) {
    // Móvil: abre la app de correo nativa
    const s = encodeURIComponent(asunto);
    const b = encodeURIComponent(cuerpo);
    const bccE = encodeURIComponent(bcc);
    window.location.href = `mailto:${to}?subject=${s}&body=${b}&bcc=${bccE}`;
  } else {
    // Desktop: abre Gmail en nueva pestaña
    const toE = encodeURIComponent(to);
    const su = encodeURIComponent(asunto);
    const bo = encodeURIComponent(cuerpo);
    const bccE = encodeURIComponent(bcc);
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${toE}&su=${su}&body=${bo}&bcc=${bccE}`,
      "_blank"
    );
  }
}

// Kept for backward compat
export function buildMailtoLink(params: {
  emails: string[];
  asunto: string;
  cuerpo: string;
  cco?: string;
}): string {
  const { emails, asunto, cuerpo, cco } = params;
  const to = emails.join(",");
  const queryParts: string[] = [];
  if (asunto) queryParts.push(`subject=${encodeURIComponent(asunto)}`);
  if (cuerpo) queryParts.push(`body=${encodeURIComponent(cuerpo)}`);
  if (cco) queryParts.push(`bcc=${encodeURIComponent(cco)}`);
  return `mailto:${to}?${queryParts.join("&")}`;
}

export function personalizeBody(
  body: string,
  user: {
    nombre: string;
    apellido_paterno: string;
    apellido_materno?: string;
    correo?: string;
    estado?: string;
  }
): string {
  const fullName = [
    user.nombre,
    user.apellido_paterno,
    user.apellido_materno,
  ]
    .filter(Boolean)
    .join(" ");

  return body
    // formatos viejos
    .replace(/\[NOMBRE\]/g, fullName)
    .replace(/\[CORREO\]/g, user.correo ?? "")
    .replace(/\[NOMBRE_COMPLETO\]/g, fullName)

    // formatos nuevos
    .replace(/\[NOMBRE COMPLETO\]/g, fullName)
    .replace(/\[MUNICIPIO,\s*ESTADO\]/g, user.estado ?? "")
    .replace(/\[CORREO DE CONTACTO\]/g, user.correo ?? "");
}