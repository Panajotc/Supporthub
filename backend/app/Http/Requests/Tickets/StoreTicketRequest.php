<?php

namespace App\Http\Requests\Tickets;

use App\Enums\TicketPriority;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'priority' => [
                'sometimes',
                'string',
                Rule::in(array_map(
                    fn (TicketPriority $priority) => $priority->value,
                    TicketPriority::cases()
                )),
            ],
        ];
    }
}