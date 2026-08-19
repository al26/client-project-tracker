@component('mail::message')
# Welcome to Client Project Tracker, {{ $name }}!

You've been successfully registered. You can now start tracking your client projects.

@component('mail::panel')
Your email {{ $notifiable->email ?? '' }} is your username.
@endcomponent

@component('mail::button', ['url' => $url])
Go to your dashboard
@endcomponent

@component('mail::panel')
💡 **Tip:** When you log in, your dashboard will be empty. Click "New Project" to create your first client engagement and start tracking!
@endcomponent

Thanks,<br>
{{ config('app.name') }}
@endcomponent
