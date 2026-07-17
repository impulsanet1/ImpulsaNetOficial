import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-zinc-100 py-6 last:border-none">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left font-semibold text-zinc-900 hover:text-indigo-600 transition-colors focus:outline-none"
      >
        <span className="text-base md:text-lg tracking-tight pr-4">{question}</span>
        <span className="bg-zinc-50 p-2 rounded-full text-zinc-500">
          {isOpen ? <Minus size={16} /> : <Plus size={16} />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="mt-4 text-sm md:text-base text-zinc-500 leading-relaxed max-w-3xl">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const FAQ: React.FC = () => {
  const faqs = [
    {
      question: '¿Los seguidores, likes y vistas son seguros para mis cuentas?',
      answer: 'Sí, absolutamente. En ImpulsaNet utilizamos métodos orgánicos y seguros que cumplen con los términos de servicio de cada red social. Tu perfil nunca estará en riesgo y no requerimos tus contraseñas.'
    },
    {
      question: '¿Cuánto tiempo tarda en entregarse mi pedido?',
      answer: 'La mayoría de los servicios comienzan a entregarse en minutos tras confirmar el pedido por WhatsApp. Para entregas masivas, dosificamos la velocidad para que el crecimiento luzca completamente natural.'
    },
    {
      question: '¿Puedo armar un pedido con múltiples servicios y redes sociales?',
      answer: '¡Por supuesto! Esa es la ventaja de nuestro configurador. Puedes añadir seguidores de Instagram, vistas de TikTok y likes de Facebook al mismo carrito y pagarlo todo en un único pedido.'
    },
    {
      question: '¿Cómo funciona la garantía de recarga?',
      answer: 'Todos nuestros servicios cuentan con garantía de estabilidad. Si experimentas alguna caída en los números contratados dentro de los 30 días posteriores al pedido, realizamos la recarga sin costo adicional.'
    },
    {
      question: '¿Tienen soporte o atención personalizada?',
      answer: 'Sí, ofrecemos soporte personalizado prioritario a través de WhatsApp. Estamos disponibles para resolver cualquier duda antes, durante y después de tu compra.'
    }
  ];

  return (
    <section className="py-24 bg-white border-t border-zinc-100">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900 mb-4">
            Preguntas Frecuentes
          </h2>
          <p className="text-zinc-500 max-w-xl mx-auto text-sm md:text-base">
            Todo lo que necesitas saber sobre cómo impulsamos tus redes de forma segura y profesional.
          </p>
        </div>

        <div className="bg-zinc-50/50 rounded-3xl p-6 md:p-10 border border-zinc-100">
          {faqs.map((faq, idx) => (
            <FAQItem key={idx} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
};
export default FAQ;
