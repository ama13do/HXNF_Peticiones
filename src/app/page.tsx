// src/app/page.tsx
import Link from "next/link";
import TopBanner from "@/components/TopBanner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PrivacidadSection from "@/components/PrivacidadSection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <TopBanner />
      <Navbar />

      {/* HERO */}
      <main className="max-w-6xl mx-auto px-4 pt-12 pb-8">
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* Left: Hero text */}
          <div className="flex-1 fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 border border-hxnf-green/40 bg-hxnf-green/10 text-hxnf-green text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 bg-hxnf-green rounded-full animate-pulse" />
              PETICIÓN CIUDADANA · MÉXICO
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Escribe a tus{" "}
              <span className="text-hxnf-green">
                legisladores
              </span>
            </h1>

            <p className="text-white/60 text-lg sm:text-xl max-w-md mb-10 leading-relaxed">
              Con solo tu código postal encontramos a tus diputados y senadores
              y preparamos el correo.{" "}
              <strong className="text-white">Tú solo das clic.</strong>
            </p>

            <Link
              href="/formulario"
              className="inline-flex items-center gap-3 bg-hxnf-green text-black font-bold text-lg px-8 py-4 rounded-full hover:bg-hxnf-yellow transition-all duration-200 hover:scale-105 active:scale-95"
            >
              COMENZAR
              <span className="text-xl">→</span>
            </Link>

            {/* Stats */}
            <div className="flex gap-8 mt-12">
              <div>
                <div className="text-2xl font-bold text-hxnf-green">500+</div>
                <div className="text-white/40 text-sm">Legisladores registrados</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-hxnf-green">32</div>
                <div className="text-white/40 text-sm">Estados cubiertos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-hxnf-green">100%</div>
                <div className="text-white/40 text-sm">Datos privados</div>
              </div>
            </div>
          </div>

          {/* Right: How it works */}
          <div className="lg:w-96 w-full fade-in-up fade-in-up-delay-2">
            <div className="border border-white/10 bg-white/5 rounded-2xl p-6">
              <h2 className="font-bold text-white mb-5 text-lg">¿Cómo funciona?</h2>
              <div className="space-y-5">
                {[
                  {
                    n: 1,
                    text: "Ingresa tu nombre y código postal para identificar a tus representantes.",
                  },
                  {
                    n: 2,
                    text: "Elige una causa o escribe tu propio mensaje.",
                  },
                  {
                    n: 3,
                    text: 'Selecciona a cada un legislador o "Enviar a todos a la vez".',
                  },
                  {
                    n: 4,
                    text: "Se abre tu app de correos con todo listo. Solo confirma el envío.",
                  },
                ].map((step) => (
                  <div key={step.n} className="flex gap-4 items-start">
                    <span className="w-7 h-7 rounded-full bg-black border-2 border-hxnf-green text-hxnf-green text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {step.n}
                    </span>
                    <p className="text-white/70 text-sm leading-relaxed">{step.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy summary card */}
            <div className="border border-white/10 bg-white/5 rounded-2xl p-5 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-hxnf-green">🔒</span>
                <h3 className="font-semibold text-white text-sm">Privacidad</h3>
              </div>
              <p className="text-white/60 text-xs leading-relaxed">
                Tus datos <strong className="text-white">nunca salen de tu dispositivo</strong>.
                Los correos se preparan localmente y se envían desde tu propia app de correos.
                No hay servidor que los almacene.
              </p>
              <p className="text-white/50 text-xs mt-2 leading-relaxed">
                Todos los envíos incluyen copia oculta a{" "}
                <strong className="text-hxnf-green">hxnf@practica.lab</strong> para llevar
                registro del movimiento ciudadano.
              </p>
              
            </div>
          </div>
        </div>
      </main>

      {/* Dashed divider */}
      <div className="border-t border-dashed border-white/20 mx-4 my-6" />

      {/* CTA Banner */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-hxnf-pink rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-black font-bold text-2xl sm:text-3xl">
              ¿Listo para escribir?
            </h2>
            <p className="text-black/70 mt-1">
              Solo necesitas tu código postal. Es gratis, rápido y privado.
            </p>
          </div>
          <Link
            href="/formulario"
            className="bg-black text-hxnf-pink font-bold px-8 py-3 rounded-full hover:bg-gray-900 transition-colors whitespace-nowrap"
          >
            Comenzar ahora →
          </Link>
        </div>
      </section>

      {/* Privacy Section */}
      <PrivacidadSection />

      <Footer />
    </div>
  );
}
