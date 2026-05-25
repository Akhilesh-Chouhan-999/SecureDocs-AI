import { useState } from 'react';

export function LoginForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ email, password }); }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-on-surface">Email</label>
        <input 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          className="mt-1 w-full p-2 bg-surface border border-outline rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-on-surface">Password</label>
        <input 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          className="mt-1 w-full p-2 bg-surface border border-outline rounded-md"
        />
      </div>
      <button type="submit" className="w-full py-2 bg-primary text-on-primary rounded-md">
        Sign In
      </button>
    </form>
  );
}
