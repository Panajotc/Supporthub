<?php

namespace Database\Factories;

use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TicketStatusHistory>
 */
class TicketStatusHistoryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'ticket_id' => Ticket::factory(),
            'old_status' => null,
            'new_status' => TicketStatus::Open->value,
            'changed_by' => User::factory(),
        ];
    }
}
