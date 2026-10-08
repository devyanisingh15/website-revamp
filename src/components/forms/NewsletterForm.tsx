import { useState, type FormEvent } from 'react';
import { Check } from 'lucide-react';
import { subscribe, isValidEmail } from '@/lib/api/newsletter';
import { Button } from '../ui/Button';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setError(null);
    setState('loading');
    try {
      await subscribe(email);
      setState('done');
    } catch {
      setState('error');
      setError('Something went wrong. Try again in a moment.');
    }
  };

  if (state === 'done')
    return (
      <p role="status" className="flex items-center gap-3 rounded-sm border border-proof-400/40 bg-proof-400/10 p-5 text-lg font-semibold">
        <Check className="size-6 text-proof-400" aria-hidden /> You’re in. Check your inbox for a welcome offer.
      </p>
    );

  return (
    <form onSubmit={submit} noValidate className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="nl-email" className="sr-only">
          Your email
        </label>
        <input
          id="nl-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          aria-invalid={!!error || undefined}
          aria-describedby={error ? 'nl-err' : undefined}
          className="h-14 flex-1 rounded-sm border border-white/20 bg-ink-950/40 px-5 text-lg text-white outline-none placeholder:text-white/50 focus:border-white"
        />
        <Button type="submit" size="lg" variant="inverse" loading={state === 'loading'}>
          Join the Squad
        </Button>
      </div>
      {error && (
        <p id="nl-err" className="mt-2 text-sm font-medium text-white" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
