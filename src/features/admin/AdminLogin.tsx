import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Shield, Key, Mail, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const { adminLogin, adminRegister } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError('Por favor, ingresa tu Correo Electrónico primero para enviarte el enlace de restablecimiento.');
      return;
    }
    setLoading(true);
    setError(null);
    setResetSent(false);
    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      setResetSent(true);
    } catch (err: any) {
      console.error("Password reset error:", err);
      const code = err?.code || '';
      if (code === 'auth/user-not-found') {
        setError('⚠️ Error: Este correo no está registrado como administrador.');
      } else {
        setError(err?.message || 'Error al enviar el correo de restablecimiento.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      if (isRegister) {
        const ok = await adminRegister(email, password);
        if (ok) {
          onSuccess();
        } else {
          setError('No se pudo registrar el administrador.');
        }
      } else {
        const ok = await adminLogin(email, password);
        if (ok) {
          onSuccess();
        } else {
          setError('Credenciales inválidas o acceso no autorizado.');
        }
      }
    } catch (err: any) {
      console.error("Login/Register catch block:", err);
      const code = err?.code || '';
      const message = err?.message || '';
      
      if (code === 'auth/operation-not-allowed') {
        setError('⚠️ Error: El inicio de sesión con Correo/Contraseña no está activado en tu consola de Firebase. Dirígete a la consola de Firebase > Authentication > Sign-in method y activa "Correo electrónico/contraseña".');
      } else if (code === 'auth/weak-password') {
        setError('⚠️ Contraseña débil: La contraseña de administrador debe tener al menos 6 caracteres.');
      } else if (code === 'auth/email-already-in-use') {
        setError('⚠️ Correo registrado: Este correo electrónico ya se encuentra registrado. Intenta iniciar sesión.');
      } else if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setError('Credenciales inválidas (correo o contraseña incorrectos). Si aún no has creado tu usuario, cámbiate a la pestaña "Registrar Administrador" abajo.');
      } else if (message.includes('offline') || code === 'unavailable') {
        setError('⚠️ Error de conexión: No se pudo conectar con Firebase. Asegúrate de tener conexión a Internet.');
      } else {
        setError(message || 'Error al conectar con el servidor de autenticación de Firebase.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-zinc-200/80 rounded-[2.5rem] shadow-xl p-8 md:p-10 space-y-8 relative overflow-hidden">
        
        {/* Decorative blur */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full blur-2xl -z-10" />

        <button 
          onClick={onCancel}
          className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-black transition-colors focus:outline-none"
        >
          <ArrowLeft size={14} /> Volver a la Tienda
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Shield size={22} fill="currentColor" className="fill-indigo-100" />
          </div>
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight">
            {isRegister ? 'Registro Administrativo' : 'Acceso Administrativo'}
          </h2>
          <p className="text-zinc-500 text-xs font-semibold">
            {isRegister 
              ? 'Crea una cuenta para gestionar de forma segura el catálogo y pedidos.' 
              : 'Inicia sesión de forma segura para gestionar el catálogo del sitio.'}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-xs font-semibold rounded-2xl border border-red-100 flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {resetSent && (
          <div className="p-4 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-2xl border border-emerald-100 flex items-center gap-2">
            <span>✅</span>
            <span>Se ha enviado un correo para restablecer tu contraseña. Por favor, revisa tu bandeja de entrada.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Correo Electrónico</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-4 text-zinc-400" />
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full bg-zinc-50 border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl py-3.5 pl-12 pr-4 text-xs font-semibold outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Contraseña</label>
              {!isRegister && (
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="text-[10px] font-black uppercase tracking-wider text-indigo-600 hover:text-indigo-800 transition-colors focus:outline-none cursor-pointer"
                >
                  ¿La olvidaste?
                </button>
              )}
            </div>
            <div className="relative">
              <Key size={16} className="absolute left-4 top-4 text-zinc-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={isRegister ? 'Mínimo 6 caracteres' : 'Ingresa tu contraseña'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full bg-zinc-50 border border-zinc-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl py-3.5 pl-12 pr-12 text-xs font-semibold outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button type="submit" variant="primary" fullWidth disabled={loading} className="py-3.5 font-bold mt-2 rounded-xl">
            {loading 
              ? (isRegister ? 'Registrando...' : 'Iniciando Sesión...') 
              : (isRegister ? 'Registrar y Entrar' : 'Iniciar Sesión')}
          </Button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
              setResetSent(false);
            }}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors focus:outline-none"
          >
            {isRegister 
              ? '¿Ya tienes una cuenta de administrador? Inicia sesión' 
              : '¿No tienes cuenta? Crea un usuario administrador'}
          </button>
        </div>

      </div>
    </div>
  );
};
export default AdminLogin;
