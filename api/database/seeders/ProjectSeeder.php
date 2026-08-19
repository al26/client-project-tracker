<?php

namespace Database\Seeders;

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;
use App\Models\Project;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $demoUser = User::where('email', 'demo@example.com')->first();

        if (! $demoUser) {
            $demoUser = User::factory()->create([
                'name' => 'Demo User',
                'email' => 'demo@example.com',
                'password' => bcrypt('password'),
            ]);
        }

        $json = file_get_contents(base_path('database/seeders/data/test_data.json'));
        $data = json_decode($json, true);

        foreach ($data as $item) {
            unset($item['id']);
            Project::create([
                'user_id' => $demoUser->id,
                'client_name' => $item['clientName'],
                'project_name' => $item['projectName'],
                'description' => $item['description'],
                'status' => ProjectStatus::from($item['status']),
                'priority' => ProjectPriority::from($item['priority']),
                'start_date' => Carbon::parse($item['startDate']),
                'due_date' => Carbon::parse($item['dueDate']),
            ]);
        }
    }
}
