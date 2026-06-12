<?php

namespace Database\Seeders;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Enums\UserRole;
use App\Models\Ticket;
use App\Models\TicketReply;
use App\Models\TicketStatusHistory;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::factory()->create([
            'name' => 'SupportHub Admin',
            'email' => 'admin@supporthub.test',
            'password' => Hash::make('password'),
            'role' => UserRole::Admin->value,
        ]);

        $agent = User::factory()->create([
            'name' => 'SupportHub Agent',
            'email' => 'agent@supporthub.test',
            'password' => Hash::make('password'),
            'role' => UserRole::Agent->value,
        ]);

        $customer = User::factory()->create([
            'name' => 'Demo Customer',
            'email' => 'customer@supporthub.test',
            'password' => Hash::make('password'),
            'role' => UserRole::Customer->value,
        ]);

        $ticket = Ticket::factory()->create([
            'public_id' => 'TKT-' . now()->year . '-000001',
            'title' => 'Cannot access my account dashboard',
            'description' => 'I can log in, but the dashboard keeps loading and never shows my tickets.',
            'status' => TicketStatus::Open->value,
            'priority' => TicketPriority::High->value,
            'customer_id' => $customer->id,
            'assigned_agent_id' => $agent->id,
            'created_by' => $customer->id,
            'updated_by' => null,
        ]);

        TicketReply::factory()->create([
            'ticket_id' => $ticket->id,
            'user_id' => $customer->id,
            'body' => 'This started happening after I reset my password.',
            'is_internal' => false,
        ]);

        TicketReply::factory()->create([
            'ticket_id' => $ticket->id,
            'user_id' => $agent->id,
            'body' => 'Thanks for reporting this. I am checking your account permissions now.',
            'is_internal' => false,
        ]);

        TicketStatusHistory::factory()->create([
            'ticket_id' => $ticket->id,
            'old_status' => null,
            'new_status' => TicketStatus::Open->value,
            'changed_by' => $customer->id,
        ]);
    }
}