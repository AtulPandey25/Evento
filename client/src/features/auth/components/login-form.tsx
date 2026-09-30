'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useLogin } from '../hooks/use-auth';
import { loginSchema, type LoginFormData } from '../types';

export function LoginForm({
  createAccountHref = '/register',
  createAccountLabel = 'Create one',
}: {
  createAccountHref?: string;
  createAccountLabel?: string;
}) {
  const { mutate: login, isPending } = useLogin();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  function onSubmit(data: LoginFormData) {
    login(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-[#ff5a3d] text-white hover:bg-[#e8492f]"
          disabled={isPending}
        >
          {isPending ? 'Signing in...' : 'Sign in'}
        </Button>

        <p className="text-center text-sm text-zinc-600">
          Don&apos;t have an account?{' '}
          <Link
            href={createAccountHref}
            className="font-medium text-zinc-950 underline-offset-4 hover:underline"
          >
            {createAccountLabel}
          </Link>
        </p>
      </form>
    </Form>
  );
}
