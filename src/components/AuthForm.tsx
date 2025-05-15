import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { authenticate } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { isValidToken, PREDEFINED_TOKENS } from "@/lib/tokens";

interface AuthFormProps {
  onAuthenticated: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthenticated }) => {
  const { t } = useTranslation();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!token.trim()) {
      setError(t('auth.errors.emptyToken'));
      return;
    }
    
    if (!isValidToken(token)) {
      setError(t('auth.errors.invalidToken'));
      return;
    }
    
    try {
      setIsLoading(true);
      const success = await authenticate(token);
      if (success) {
        onAuthenticated();
      } else {
        setError(t('auth.errors.authFailed'));
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError(t('auth.errors.authFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">
            {t('auth.title')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('auth.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder={t('auth.inputPlaceholder')}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full"
                disabled={isLoading}
              />
              {error && <p className="text-destructive text-sm">{error}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('auth.authenticating') : t('auth.continueButton')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
          <p className="w-full">{t('auth.noAccount')}</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthForm;
