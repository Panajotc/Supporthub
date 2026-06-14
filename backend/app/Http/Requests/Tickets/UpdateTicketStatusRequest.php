<?php

namespace App\Http\Requests\Tickets;

use App\Enums\TicketStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTicketStatusRequest extends FormRequest
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
            'status' => [
                'required',
                'string',
                Rule::in(array_map(
                    fn (TicketStatus $status) => $status->value,
                    TicketStatus::cases()
                )),
            ],
        ];
    }
}