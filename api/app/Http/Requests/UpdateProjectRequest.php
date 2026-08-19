<?php

namespace App\Http\Requests;

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;
use App\Models\Project;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProjectRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Project|null $project */
        $project = $this->route('project');

        return [
            'client_name' => ['sometimes', 'string', 'max:100'],
            'project_name' => ['sometimes', 'string', 'max:120'],
            'description' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'status' => ['sometimes', Rule::enum(ProjectStatus::class)],
            'priority' => ['sometimes', Rule::enum(ProjectPriority::class)],
            'start_date' => ['sometimes', 'date'],
            'due_date' => [
                'sometimes',
                'date',
                function (string $attribute, mixed $value, \Closure $fail) use ($project): void {
                    $startDate = $this->input('start_date')
                        ?? $project?->start_date?->format('Y-m-d');

                    if ($startDate && $value < $startDate) {
                        $fail('The due date field must be a date after or equal to start date.');
                    }
                },
            ],
        ];
    }
}
