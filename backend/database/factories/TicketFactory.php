<?php

namespace Database\Factories;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Ticket>
 */
class TicketFactory extends Factory
{
    public function definition(): array
    {
        $customer = User::factory()->create();
        $agent = User::factory()->create();

        return [
            'public_id' => 'TKT-' . now()->year . '-' . fake()->unique()->numerify('######'),
            'title' => fake()->sentence(6),
            'description' => fake()->paragraphs(3, true),
            'status' => TicketStatus::Open->value,
            'priority' => fake()->randomElement([
                TicketPriority::Low->value,
                TicketPriority::Medium->value,
                TicketPriority::High->value,
                TicketPriority::Critical->value,
            ]),
            'customer_id' => $customer->id,
            'assigned_agent_id' => $agent->id,
            'created_by' => $customer->id,
            'updated_by' => null,
            'resolved_at' => null,
            'closed_at' => null,
        ];
    }
}