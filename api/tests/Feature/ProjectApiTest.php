<?php

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function actingAsApiUser(): User
{
    return User::factory()->create();
}

function projectPayload(array $overrides = []): array
{
    return array_merge([
        'client_name' => 'Test Client',
        'project_name' => 'Test Project',
        'description' => 'Test Desc',
        'status' => 'Planning',
        'priority' => 'Medium',
        'start_date' => '2026-01-01',
        'due_date' => '2026-01-31',
    ], $overrides);
}

test('unauthenticated user cannot access projects', function () {
    $response = $this->getJson('/api/projects');
    $response->assertStatus(401);
});

test('can login and receive a sanctum token', function () {
    $user = actingAsApiUser();

    $response = $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('data.user.email', $user->email)
        ->assertJsonStructure(['data' => ['token', 'user' => ['id', 'name', 'email']]]);
});

test('can get all projects', function () {
    $user = actingAsApiUser();
    Project::factory()->count(3)->create(['user_id' => $user->id]);

    $response = $this->actingAs($user, 'sanctum')->getJson('/api/projects');

    $response->assertStatus(200)
        ->assertJsonCount(3, 'data')
        ->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'client_name',
                    'project_name',
                    'description',
                    'status',
                    'priority',
                    'start_date',
                    'due_date',
                ],
            ],
        ]);
});

test('can get a single project', function () {
    $user = actingAsApiUser();
    $project = Project::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user, 'sanctum')->getJson("/api/projects/{$project->id}");

    $response->assertStatus(200)
        ->assertJsonPath('data.id', $project->id)
        ->assertJsonPath('data.client_name', $project->client_name);
});

test('can create a project', function () {
    $user = actingAsApiUser();
    $payload = projectPayload();

    $response = $this->actingAs($user, 'sanctum')->postJson('/api/projects', $payload);

    $response->assertStatus(201)
        ->assertJsonPath('data.client_name', 'Test Client');

    $this->assertDatabaseHas('projects', [
        'client_name' => 'Test Client',
        'status' => 'Planning',
    ]);
});

test('cannot create project without required fields', function () {
    $user = actingAsApiUser();

    $response = $this->actingAs($user, 'sanctum')->postJson('/api/projects', []);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['client_name', 'project_name', 'status', 'priority', 'start_date', 'due_date']);
});

test('cannot create project with invalid status', function () {
    $user = actingAsApiUser();

    $response = $this->actingAs($user, 'sanctum')->postJson('/api/projects', projectPayload([
        'status' => 'Invalid Status',
    ]));

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['status']);
});

test('cannot create project with invalid priority', function () {
    $user = actingAsApiUser();

    $response = $this->actingAs($user, 'sanctum')->postJson('/api/projects', projectPayload([
        'priority' => 'Critical',
    ]));

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['priority']);
});

test('cannot create project with invalid date validation', function () {
    $user = actingAsApiUser();

    $response = $this->actingAs($user, 'sanctum')->postJson('/api/projects', projectPayload([
        'start_date' => '2026-02-01',
        'due_date' => '2026-01-31',
    ]));

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['due_date']);
});

test('can update a project with partial payload', function () {
    $user = actingAsApiUser();
    $project = Project::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user, 'sanctum')->putJson("/api/projects/{$project->id}", [
        'client_name' => 'Updated Client',
        'status' => 'In Progress',
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('data.client_name', 'Updated Client')
        ->assertJsonPath('data.status', 'In Progress');

    $this->assertDatabaseHas('projects', [
        'id' => $project->id,
        'client_name' => 'Updated Client',
        'status' => 'In Progress',
    ]);
});

test('can delete a project', function () {
    $user = actingAsApiUser();
    $project = Project::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user, 'sanctum')->deleteJson("/api/projects/{$project->id}");

    $response->assertStatus(204);
    $this->assertDatabaseMissing('projects', ['id' => $project->id]);
});

test('returns 404 when project does not exist', function () {
    $user = actingAsApiUser();

    $response = $this->actingAs($user, 'sanctum')->getJson('/api/projects/99999');

    $response->assertStatus(404);
});

test('returns 404 when updating a project that does not exist', function () {
    $user = actingAsApiUser();

    $response = $this->actingAs($user, 'sanctum')
        ->putJson('/api/projects/99999', ['client_name' => 'Nope']);

    $response->assertStatus(404);
});

test('returns 404 when deleting a project that does not exist', function () {
    $user = actingAsApiUser();

    $response = $this->actingAs($user, 'sanctum')->deleteJson('/api/projects/99999');

    $response->assertStatus(404);
});

test('unauthenticated user cannot create a project', function () {
    $response = $this->postJson('/api/projects', projectPayload());
    $response->assertStatus(401);
});

test('unauthenticated user cannot update a project', function () {
    $response = $this->putJson('/api/projects/1', ['client_name' => 'Nope']);
    $response->assertStatus(401);
});

test('unauthenticated user cannot delete a project', function () {
    $response = $this->deleteJson('/api/projects/1');
    $response->assertStatus(401);
});

test('authenticated user can logout (401 after)', function () {
    $user = actingAsApiUser();

    $response = $this->actingAs($user, 'sanctum')->postJson('/api/logout');
    $response->assertStatus(200)->assertJsonPath('message', 'Logged out successfully');
});

test('can paginate projects across pages', function () {
    $user = actingAsApiUser();
    Project::factory()->count(5)->create(['user_id' => $user->id]);

    $response = $this->actingAs($user, 'sanctum')
        ->getJson('/api/projects?page=1&per_page=2');

    $response->assertStatus(200)
        ->assertJsonCount(2, 'data')
        ->assertJsonStructure([
            'meta' => ['current_page', 'from', 'last_page', 'per_page', 'to', 'total', 'links'],
        ]);
});

test('can search projects by client or project name', function () {
    $user = actingAsApiUser();
    Project::factory()->create(['user_id' => $user->id, 'client_name' => 'Acme Corp', 'project_name' => 'Redesign']);
    Project::factory()->create(['user_id' => $user->id, 'client_name' => 'Globex', 'project_name' => 'New Site']);

    $response = $this->actingAs($user, 'sanctum')
        ->getJson('/api/projects?search=Acme');

    $response->assertStatus(200)
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.client_name', 'Acme Corp');
});

test('can filter projects by status', function () {
    $user = actingAsApiUser();
    Project::factory()->create(['user_id' => $user->id, 'status' => 'Planning']);
    Project::factory()->create(['user_id' => $user->id, 'status' => 'In Progress']);

    $response = $this->actingAs($user, 'sanctum')
        ->getJson('/api/projects?status=Planning');

    $response->assertStatus(200)
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.status', 'Planning');
});

test('can filter projects by priority', function () {
    $user = actingAsApiUser();
    Project::factory()->create(['user_id' => $user->id, 'priority' => 'Low']);
    Project::factory()->create(['user_id' => $user->id, 'priority' => 'High']);

    $response = $this->actingAs($user, 'sanctum')
        ->getJson('/api/projects?priority=High');

    $response->assertStatus(200)
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.priority', 'High');
});

test('can sort projects by a valid column', function () {
    $user = actingAsApiUser();
    Project::factory()->create(['user_id' => $user->id, 'client_name' => 'Zeta', 'start_date' => '2026-01-02']);
    Project::factory()->create(['user_id' => $user->id, 'client_name' => 'Alpha', 'start_date' => '2026-01-01']);

    $response = $this->actingAs($user, 'sanctum')
        ->getJson('/api/projects?sort_by=client_name&sort_direction=asc');

    $response->assertStatus(200)
        ->assertJsonPath('data.0.client_name', 'Alpha');
});

test('returns 422 when filtering by invalid status', function () {
    $user = actingAsApiUser();

    $response = $this->actingAs($user, 'sanctum')
        ->getJson('/api/projects?status=Invalid%20Status');

    $response->assertStatus(422);
});

test('returns 422 when sorting by an invalid column', function () {
    $user = actingAsApiUser();

    $response = $this->actingAs($user, 'sanctum')
        ->getJson('/api/projects?sort_by=invalid_column');

    $response->assertStatus(422);
});

test('can update project with partial payload including nullable fields', function () {
    $user = actingAsApiUser();
    $project = Project::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user, 'sanctum')
        ->putJson("/api/projects/{$project->id}", [
            'description' => null,
            'priority' => 'High',
        ]);

    $response->assertStatus(200)
        ->assertJsonPath('data.description', null)
        ->assertJsonPath('data.priority', 'High');
});

test('cannot update project with invalid status', function () {
    $user = actingAsApiUser();
    $project = Project::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user, 'sanctum')
        ->putJson("/api/projects/{$project->id}", [
            'status' => 'Invalid Status',
        ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['status']);
});
