<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name', 'Laravel') }} — Health</title>
    @fonts
    @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
    @vite(['resources/css/app.css'])
    @endif
</head>

<body class="min-h-screen flex items-center justify-center bg-gray-50 p-6">
    <div class="w-full max-w-md text-center">
        <div class="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-8">
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h1 class="mt-4 text-2xl font-bold text-gray-900">{{ config('app.name', 'Laravel') }}</h1>
            <p class="mt-2 text-lg text-green-600 font-semibold">Status: OK</p>
            <dl class="mt-6 space-y-2 text-sm">
                <div class="flex justify-between">
                    <dt class="text-gray-500">Timestamp</dt>
                    <dd class="text-gray-900 font-medium" data-iso="{{ now()->toISOString() }}">
                        {{ now()->tz('UTC')->format('Y-m-d H:i:s') }} UTC
                    </dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-gray-500">Environment</dt>
                    <dd class="text-gray-900 font-medium">{{ config('app.env') }}</dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-gray-500">Version</dt>
                    <dd class="text-gray-900 font-medium">{{ config('app.version') }}</dd>
                </div>
            </dl>
            <p class="mt-6 text-xs text-gray-400">Endpoint: <code class="text-gray-600">/health</code></p>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const el = document.querySelector('[data-iso]');
            if (!el) return;
            const iso = el.getAttribute('data-iso');
            const date = new Date(iso);
            const opts = {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
                timeZoneName: 'short'
            };
            el.textContent = new Intl.DateTimeFormat(undefined, opts).format(date);
        });
    </script>
</body>

</html>
