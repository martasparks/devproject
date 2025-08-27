"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AuthError } from "next-auth";

interface SignInModalProps {
  children: React.ReactNode;
  currentLocale?: string;
}

const defaultProviders = [
  { id: 'google', name: 'Google' },
  { id: 'facebook', name: 'Facebook' }
];

export function SignInModal({ children, currentLocale = 'lv' }: SignInModalProps) {
  const t = useTranslations("TestPage");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [emailSent, setEmailSent] = useState(false);

  const handleEmailSignIn = async (formData: FormData) => {
    setLoading(true);
    setError("");
    
    try {
      const email = formData.get("email") as string;
      
      if (!email) {
        setError("E-pasts ir obligāts lauks");
        return;
      }

      const result = await signIn("nodemailer", {
        email,
        redirect: false,
        callbackUrl: `/${currentLocale}`,
      });

      if (result?.error) {
        setError("Radās kļūda nosūtot e-pastu. Lūdzu mēģiniet vēlreiz.");
      } else {
        setError("");
        setEmailSent(true);
        toast.success("E-pasts nosūtīts! Pārbaudiet savu e-pasta kontu un noklikšķiniet uz saites, lai ielogotos.");
      }
    } catch (error) {
      console.error("SignIn error:", error);
      setError("Radās neparedzēta kļūda. Lūdzu mēģiniet vēlreiz.");
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSignIn = async (providerId: string) => {
    setLoading(true);
    setError("");

    try {
      const result = await signIn(providerId, {
        callbackUrl: `/${currentLocale}`,
        redirect: false,
      });

      if (result?.error) {
        setError(`Kļūda autorizējoties. Lūdzu mēģiniet vēlreiz.`);
      } else if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error("Provider signin error:", error);
      setError("Radās neparedzēta kļūda. Lūdzu mēģiniet vēlreiz.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset states when modal is closed
      setEmailSent(false);
      setError("");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm border border-gray-200 shadow-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-center text-2xl font-bold text-gray-900">
            Sveicināts atpakaļ!
          </DialogTitle>
          <p className="text-center text-gray-600 text-sm">
            Ielogojieties savā kontā vai izveidojiet jaunu
          </p>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {emailSent ? (
            /* Email Sent Success State */
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">E-pasts nosūtīts!</h3>
                <p className="text-sm text-gray-600">
                  Mēs nosūtījām jums e-pastu ar pieejas saiti. Pārbaudiet savu e-pasta kontu un noklikšķiniet uz saites, lai ielogotos.
                </p>
                <p className="text-xs text-gray-500">
                  Neredzat e-pastu? Pārbaudiet mēstuļu mapi vai mēģiniet vēlreiz.
                </p>
              </div>
              <Button 
                onClick={() => setEmailSent(false)}
                variant="outline"
                className="w-full"
              >
                Nosūtīt vēlreiz
              </Button>
            </div>
          ) : (
            <>
              {/* Email Form */}
              <form action={handleEmailSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                {t('email', { default: 'E-pasts' })}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="jūsu@e-pasts.lv"
                required
                disabled={loading}
                className="w-full h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg flex items-center space-x-2">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Nosūta...</span>
                </div>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {t("sendMagicLink", { default: "Nosūtīt pieejas saiti" })}
                </>
              )}
            </Button>
          </form>

          {/* Providers */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500 font-medium">
                Vai turpiniet ar
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {defaultProviders.map((provider) => (
              <Button
                key={provider.id}
                variant="outline"
                onClick={() => handleProviderSignIn(provider.id)}
                disabled={loading}
                className="w-full h-11 border-gray-300 hover:border-gray-400 hover:bg-gray-50 flex items-center justify-center space-x-3 transition-all duration-200"
              >
                {provider.name === 'Google' && (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                {provider.name === 'Facebook' && (
                  <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956.1874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                )}
                <span className="font-medium">
                  {t(`signInWith${provider.name}`, { default: `Turpināt ar ${provider.name}` })}
                </span>
              </Button>
            ))}
          </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}