'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { CalendarDays, Ticket } from 'lucide-react';
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
import { useRegister } from '../hooks/use-auth';
import { registerSchema, type RegisterFormData } from '../types';

export function RegisterForm({
  initialRole = 'USER',
}: {
  initialRole?: RegisterFormData['role'];
}) {
  const { mutate: register, isPending } = useRegister();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: initialRole,
      confirmPassword: '',
    },
  });

  function onSubmit(data: RegisterFormData) {
    register({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input type="text" autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account type</FormLabel>
              <FormControl>
                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    {
                      value: 'USER',
                      title: 'Customer',
                      description: 'Browse events, book tickets, and manage wallet passes',
                      icon: Ticket,
                    },
                    {
                      value: 'ORGANIZER',
                      title: 'Organizer',
                      description: 'Create listings, review bookings, and check in guests',
                      icon: CalendarDays,
                    },
                  ].map((option) => {
                    const Icon = option.icon;

                    return (
                      <button
                        aria-pressed={field.value === option.value}
                        className={
                          field.value === option.value
                            ? 'rounded-md border border-blue-900 bg-gradient-to-br from-[#0a1628] to-[#14325c] p-3 text-left text-white shadow-sm transition'
                            : 'rounded-md border border-zinc-200 bg-white p-3 text-left text-zinc-950 transition hover:border-zinc-400'
                        }
                        key={option.value}
                        onClick={() => field.onChange(option.value)}
                        type="button"
                      >
                        <span className="flex items-center gap-2 text-sm font-semibold">
                          <Icon className="size-4" />
                          {option.title}
                        </span>
                        <span className="mt-2 block text-xs leading-5 opacity-75">
                          {option.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
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
          {isPending ? 'Creating account...' : 'Create account'}
        </Button>

        <p className="text-center text-sm text-zinc-600">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-zinc-950 underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </Form>
  );
}
