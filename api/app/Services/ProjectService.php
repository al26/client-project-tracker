<?php

namespace App\Services;

use App\Models\Project;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class ProjectService
{
    public function getAllProjects(): Collection
    {
        return Project::orderBy('start_date', 'asc')->get();
    }

    /**
     * Get paginated projects with optional filtering and sorting.
     *
     * @param  array{search?: string, status?: string, priority?: string, sort_by?: string, sort_direction?: string, per_page?: int}  $filters
     */
    public function getPaginatedProjects(array $filters = [], ?int $userId = null): LengthAwarePaginator
    {
        $query = Project::query();

        if ($userId) {
            $query->where('user_id', $userId);
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('client_name', 'like', "%{$search}%")
                    ->orWhere('project_name', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }

        $allowedSortColumns = ['id', 'client_name', 'project_name', 'start_date', 'due_date', 'status', 'priority'];
        $sortBy = in_array($filters['sort_by'] ?? null, $allowedSortColumns, true)
            ? $filters['sort_by']
            : 'start_date';
        $sortDirection = strtolower($filters['sort_direction'] ?? 'asc');
        $sortDirection = in_array($sortDirection, ['asc', 'desc'], true) ? $sortDirection : 'asc';

        $query->orderBy($sortBy, $sortDirection);

        $perPage = min((int) ($filters['per_page'] ?? 15), 100);

        return $query->paginate($perPage);
    }

    public function createProject(array $data, ?int $userId = null): Project
    {
        if ($userId) {
            $data['user_id'] = $userId;
        }

        return Project::create($data);
    }

    public function updateProject(Project $project, array $data): Project
    {
        $project->update($data);

        return $project;
    }

    public function deleteProject(Project $project): void
    {
        $project->delete();
    }
}
