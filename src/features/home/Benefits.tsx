import React from 'react';
import { Zap, ShieldCheck, HeartHandshake, Award } from 'lucide-react';

export const Benefits: React.FC = () => {
  const list = [
    {
      icon: <Zap className="text-amber-500" size={24} />,
      title: 'Entrega Instantánea',
      desc: 'El procesamiento de tu orden inicia en segundos. Notarás el crecimiento en tus perfiles casi de inmediato.'
    },
    {
      icon: <ShieldCheck className="text-emerald-500" size={24} />,
      title: 'Cero Riesgos',
      desc: 'Nunca pediremos contraseñas o accesos sensibles. Nuestros métodos se adaptan 100% al algoritmo.'
    },
    {
      icon: <Award className="text-indigo-500" size={24} />,
      title: 'Garantía de Estabilidad',
      desc: 'Ofrecemos recarga automática gratuita ante cualquier pequeña caída de números durante el primer mes.'
    },
    {
      icon: <HeartHandshake className="text-pink-500" size={24} />,
      title: 'Soporte VIP por WhatsApp',
      desc: 'Nuestro equipo te acompaña de forma humana y atenta a través del canal de WhatsApp preferido por nuestros clientes.'
    }
  ];

  return (
    <section className="py-24 bg-zinc-50 border-t border-zinc-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900 mb-4">
            ¿Por qué elegir ImpulsaNet?
          </h2>
          <p className="text-zinc-500 max-w-xl mx-auto text-sm md:text-base">
            No somos solo una tienda de seguidores. Nos enfocamos en construir credibilidad, alcance y confianza digital.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {list.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-zinc-100 rounded-[2rem] p-8 hover:shadow-xl hover:shadow-zinc-100 hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center mb-6">
                {item.icon}
              </div>
              <h3 className="font-bold text-lg text-zinc-900 mb-3 tracking-tight">
                {item.title}
              </h3>
              <p className="text-zinc-500 text-sm leading-relaxed flex-1">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Benefits;
