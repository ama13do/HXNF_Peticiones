// src/components/PrivacidadSection.tsx
"use client";
import { useState } from "react";

const AVISO_COMPLETO = `
## I. Identidad y domicilio del Responsable

Nuestro Futuro A.C., con domicilio en Calle Aida 112, 01060 col. San Angel Inn, Alcaldía Álvaro Obregón, CDMX, es la persona moral responsable del tratamiento de sus datos personales, en términos de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento.

## II. Datos personales que se recaban

Recabamos únicamente los datos personales estrictamente necesarios:
- Nombre completo
- Correo electrónico
- Código postal
- Municipio y estado de residencia (derivados automáticamente del código postal)

No recabamos datos personales sensibles en términos del artículo 3, fracción VI de la LFPDPPP.

## III. Finalidades del tratamiento

### Finalidades primarias
1. Identificar a los representantes legislativos que corresponden a su circunscripción.
2. Prellenar y enviar, con su consentimiento expreso, una comunicación ciudadana dirigida a sus representantes legislativos.
3. Contabilizar el número de comunicaciones ciudadanas enviadas.

### Finalidades secundarias
4. Invitarle a sumarse al capítulo estatal de Hackers x Nuestro Futuro.
5. Mantenerle informada/o sobre actividades y campañas futuras.

Si no desea las finalidades 4 o 5, escríbenos a hxnf@practica.lat con el asunto "Oposición a finalidades secundarias".

## IV. Transferencia de datos personales

Sus datos se comunicarán únicamente a los representantes legislativos de su circunscripción, con su consentimiento expreso al hacer clic en "Enviar".

## V. Derechos ARCO

Tiene derecho a Acceder, Rectificar, Cancelar y Oponerse al tratamiento de sus datos. Para ejercerlos:

Correo: hxnf@practica.lat
Asunto: "Solicitud ARCO — [su nombre completo]"

Responderemos en 20 días hábiles (art. 32 LFPDPPP). Puede presentar quejas ante el INAI en www.inai.org.mx.

## VI. Revocación del consentimiento

Puede revocar su consentimiento enviando a hxnf@practica.lat el asunto "Revocación de consentimiento". La revocación no tendrá efectos retroactivos sobre correos ya enviados.

## VII. Consentimiento

Al completar y enviar el formulario, usted declara haber leído y comprendido el presente aviso y otorga su consentimiento para el tratamiento de sus datos personales.

Este aviso se rige por la LFPDPPP (DOF, 5 de julio de 2010) y su Reglamento (DOF, 21 de diciembre de 2011).
`;

export default function PrivacidadSection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section id="privacidad" className="max-w-6xl mx-auto px-4 py-12">
      <div className="border border-white/10 rounded-2xl overflow-hidden">
        <div className="bg-white/5 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Aviso de Privacidad</h2>
            <p className="text-white/50 text-sm mt-0.5">
              Coalición Hackers x Nuestro Futuro · Última actualización: 30/05/2026
            </p>
          </div>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-2 bg-white/10 hover:bg-hxnf-green hover:text-black text-white text-sm font-semibold px-4 py-2 rounded-full transition-all duration-200"
          >
            {expanded ? "Ver menos ↑" : "Ver más ↓"}
          </button>
        </div>

        {/* Resumen siempre visible */}
        <div className="px-6 py-5 border-t border-white/5">
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-hxnf-green/10 border border-hxnf-green/20 rounded-xl p-4">
              <div className="text-hxnf-green font-semibold mb-1">✓ Tus datos</div>
              <p className="text-white/70">Nunca salen de tu dispositivo. Los correos se preparan localmente.</p>
            </div>
            <div className="bg-hxnf-green/10 border border-hxnf-green/20 rounded-xl p-4">
              <div className="text-hxnf-green font-semibold mb-1">✓ Sin servidores</div>
              <p className="text-white/70">No hay servidor que almacene tus mensajes. Tú envías desde tu correo.</p>
            </div>
            <div className="bg-hxnf-green/10 border border-hxnf-green/20 rounded-xl p-4">
              <div className="text-hxnf-green font-semibold mb-1">✓ Copia oculta</div>
              <p className="text-white/70">Todos los envíos incluyen copia a hxnf@practica.lat para registro.</p>
            </div>
          </div>
        </div>

        {/* Contenido expandible */}
        {expanded && (
          <div className="border-t border-white/5 px-6 py-6 slide-down">
            <div className="prose prose-invert max-w-none text-sm text-white/70 space-y-4">
              {AVISO_COMPLETO.trim().split("\n").map((line, i) => {
                if (line.startsWith("## ")) {
                  return (
                    <h3 key={i} className="text-white font-semibold text-base mt-6 mb-2">
                      {line.replace("## ", "")}
                    </h3>
                  );
                }
                if (line.startsWith("### ")) {
                  return (
                    <h4 key={i} className="text-hxnf-green font-semibold text-sm mt-4 mb-1">
                      {line.replace("### ", "")}
                    </h4>
                  );
                }
                if (line.startsWith("- ")) {
                  return (
                    <li key={i} className="ml-4 list-disc text-white/60">
                      {line.replace("- ", "")}
                    </li>
                  );
                }
                if (line.match(/^\d+\./)) {
                  return (
                    <li key={i} className="ml-4 list-decimal text-white/60">
                      {line.replace(/^\d+\.\s/, "")}
                    </li>
                  );
                }
                if (line.trim() === "") return <br key={i} />;
                return (
                  <p key={i} className="text-white/60 leading-relaxed">
                    {line}
                  </p>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
