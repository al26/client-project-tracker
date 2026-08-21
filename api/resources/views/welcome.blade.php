<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name', 'Client Project Tracker') }} — Manage client projects, track progress, prioritize work
    </title>
    <meta name="description"
        content="A client project tracker for digital agencies. Create, organize, filter, and prioritize client projects with ease.">
    @fonts
    @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
    @vite(['resources/css/app.css'])
    @endif
</head>

<body class="h-full bg-[#FDFDFC] dark:bg-[#0a0a0a] text-[#1b1b18] dark:text-[#EDEDEC] font-sans antialiased">
    <div class="relative flex min-h-screen flex-col overflow-hidden">
        {{-- Decorative background glow --}}
        <div
            class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-gradient-to-b from-[#f53003]/[0.06] via-transparent to-transparent dark:from-[#F61500]/[0.08]">
        </div>

        {{-- Header --}}
        <header class="w-full">
            <nav class="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 lg:px-8">
                <a href="/" class="flex items-center gap-2.5">
                    <span
                        class="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#f53003] to-[#FF4433] text-white shadow-sm">
                        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path
                                d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5zm12 5h-5v9a1 1 0 1 1-2 0V8H8a1 1 0 1 1 0-2h5a2 2 0 0 1 2 2z" />
                        </svg>
                    </span>
                    <span class="text-lg font-semibold tracking-tight">{{ config('app.name', 'Client Project Tracker')
                        }}</span>
                </a>
                <div class="flex items-center gap-3 text-sm">
                    <a href="/health"
                        class="rounded-md px-3 py-1.5 text-muted-foreground hover:text-foreground transition-colors">Health</a>
                    {{-- <a href="{{ config('app.frontend_url') }}/login"
                        class="rounded-md px-3 py-1.5 text-muted-foreground hover:text-foreground transition-colors">Log
                        in</a>
                    <a href="{{ config('app.frontend_url') }}/register"
                        class="rounded-md bg-[#1b1b18] dark:bg-[#EDEDEC] px-4 py-1.5 font-medium text-white dark:text-[#1C1C1A] transition-colors hover:bg-black dark:hover:bg-white">
                        Register
                    </a> --}}
                </div>
            </nav>
        </header>

        {{-- Hero --}}
        <main class="mx-auto w-full max-w-6xl flex-1 px-6 lg:px-8">
            <section class="flex flex-col items-center py-16 text-center lg:py-24">
                <span
                    class="mb-5 inline-flex items-center gap-2 rounded-full border border-[#19140035] dark:border-[#3E3E3A] bg-white/60 dark:bg-[#161615] px-3 py-1 text-xs font-medium">
                    <span class="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                    Laravel {{ app()->version() }} <span class="text-[#706f6c] dark:text-[#A1A09A]">·</span> API Ready
                </span>
                <h1 class="max-w-3xl text-4xl font-bold leading-tight tracking-tight lg:text-6xl">
                    Track every client project,
                    <span class="bg-gradient-to-r from-[#f53003] to-[#FF4433] bg-clip-text text-transparent">from brief
                        to delivery.</span>
                </h1>
                <p class="mt-6 max-w-2xl text-base leading-relaxed text-[#706f6c] dark:text-[#A1A09A] lg:text-lg">
                    A simple Client Project Tracker for digital agencies. Monitor progress, manage
                    priorities, and keep every stakeholder aligned.
                </p>
                <div class="mt-10 flex flex-col items-center gap-3 sm:flex-row">
                    <a href="/health"
                        class="inline-flex items-center justify-center rounded-md bg-[#f53003] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#d62c02]">
                        View API Health
                    </a>
                    <a href="{{ config('app.frontend_url') }}/register"
                        class="inline-flex items-center justify-center rounded-md border border-[#19140035] dark:border-[#3E3E3A] bg-white/70 dark:bg-[#161615] px-6 py-3 text-sm font-medium transition-colors hover:border-[#1915014a] dark:hover:border-[#62605b]">
                        Get started free
                    </a>
                </div>
            </section>

            {{-- Features --}}
            <section class="pb-16 lg:pb-20">
                <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div
                        class="rounded-xl border border-[#e3e3e0] dark:border-[#3E3E3A] bg-white dark:bg-[#161615] p-6 shadow-sm transition-transform hover:-translate-y-1">
                        <div
                            class="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f53003]/10 text-[#f53003] dark:text-[#FF4433]">
                            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" />
                                <path d="M8 2v4M16 2v4M3 10h18" />
                            </svg>
                        </div>
                        <h3 class="mt-4 text-base font-semibold">Full Project Management</h3>
                        <p class="mt-2 text-sm leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">
                            Create, view, update, and delete client projects with complete details — client,
                            description, dates, and more.
                        </p>
                    </div>
                    <div
                        class="rounded-xl border border-[#e3e3e0] dark:border-[#3E3E3A] bg-white dark:bg-[#161615] p-6 shadow-sm transition-transform hover:-translate-y-1">
                        <div
                            class="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f53003]/10 text-[#f53003] dark:text-[#FF4433]">
                            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path
                                    d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                            </svg>
                        </div>
                        <h3 class="mt-4 text-base font-semibold">Status Tracking</h3>
                        <p class="mt-2 text-sm leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">
                            Follow work through Planning, In Progress, On Hold, and Completed — with Low, Medium, and
                            High priorities.
                        </p>
                    </div>
                    <div
                        class="rounded-xl border border-[#e3e3e0] dark:border-[#3E3E3A] bg-white dark:bg-[#161615] p-6 shadow-sm transition-transform hover:-translate-y-1">
                        <div
                            class="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f53003]/10 text-[#f53003] dark:text-[#FF4433]">
                            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="11" cy="11" r="7" />
                                <path d="m21 21-4.35-4.35M8 11h6M11 8v6" />
                            </svg>
                        </div>
                        <h3 class="mt-4 text-base font-semibold">Search, Filter &amp; Sort</h3>
                        <p class="mt-2 text-sm leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">
                            Find projects fast with full-text search, server-side filtering by status and priority, and
                            flexible sorting.
                        </p>
                    </div>
                </div>
            </section>

            {{-- Tech stack --}}
            <section class="pb-16 lg:pb-24">
                <div
                    class="rounded-2xl border border-[#e3e3e0] dark:border-[#3E3E3A] bg-white/60 dark:bg-[#161615]/60 p-8 lg:p-10">
                    <h2
                        class="text-center text-sm font-semibold uppercase tracking-widest text-[#706f6c] dark:text-[#A1A09A]">
                        Built on a modern stack</h2>
                    <div class="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
                        <span
                            class="rounded-full border border-[#19140035] dark:border-[#3E3E3A] bg-white dark:bg-[#161615] px-4 py-1.5 font-medium">Laravel
                            {{ app()->version() }}</span>
                        <span
                            class="rounded-full border border-[#19140035] dark:border-[#3E3E3A] bg-white dark:bg-[#161615] px-4 py-1.5 font-medium">PHP
                            {{ PHP_VERSION }}</span>
                        <span
                            class="rounded-full border border-[#19140035] dark:border-[#3E3E3A] bg-white dark:bg-[#161615] px-4 py-1.5 font-medium">Sanctum
                            Auth</span>
                        <span
                            class="rounded-full border border-[#19140035] dark:border-[#3E3E3A] bg-white dark:bg-[#161615] px-4 py-1.5 font-medium">PostgreSQL
                            / SQLite</span>
                        <span
                            class="rounded-full border border-[#19140035] dark:border-[#3E3E3A] bg-white dark:bg-[#161615] px-4 py-1.5 font-medium">TanStack
                            Start</span>
                        <span
                            class="rounded-full border border-[#19140035] dark:border-[#3E3E3A] bg-white dark:bg-[#161615] px-4 py-1.5 font-medium">Tailwind
                            CSS</span>
                    </div>
                </div>
            </section>
        </main>

        {{-- Footer --}}
        <footer class="border-t border-[#e3e3e0] dark:border-[#3E3E3A]">
            <div
                class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-[#706f6c] dark:text-[#A1A09A] sm:flex-row lg:px-8">
                <p>&copy; {{ date('Y') }} {{ config('app.name', 'Client Project Tracker') }}. v{{ app()->version() }}
                </p>
                <div class="flex items-center gap-5">
                    <a href="/health" class="hover:text-foreground transition-colors">Health check</a>
                    <a href="/api/projects" class="hover:text-foreground transition-colors">API</a>
                    <a href="{{ config('app.frontend_url') }}/login" class="hover:text-foreground transition-colors">Log
                        in</a>
                </div>
            </div>
        </footer>
    </div>
</body>

</html>
